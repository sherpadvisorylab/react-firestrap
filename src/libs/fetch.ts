import {sleep} from "./utils";

interface FetchOptions {
    method?: "GET" | "POST" | "PUT" | "DELETE" | "HEAD" | "PATCH";
    headers?: Record<string, string>;
    body?: Record<string, any> | string;
}

function resolveContentType(options: FetchOptions) {
    const { body, headers } = options;
    const contentType = headers?.["Content-Type"] || "";

    const allowedContentTypes = Array.isArray(body) || typeof body === 'object'
        ? ["application/json", "application/x-www-form-urlencoded", "multipart/form-data"]
        : ["text/plain", "text/html"];

    if (allowedContentTypes.includes(contentType)) {
        return contentType;
    }

    return typeof body === 'object'
        ? "application/json"
        : typeof body === 'string' && body.startsWith("<")
            ? "text/html"
            : "text/plain";
}

export async function fetchRest(
    url: string,
    options: FetchOptions | null = null
): Promise<any> {
    const request: RequestInit = {
        redirect: "follow",
        method: options?.method?.toUpperCase() || "GET",
        headers: options?.headers || {}
    };

    if (options?.body) {
        if (["GET", "HEAD"].includes(request.method as string)) {
            url += (url.includes("?") ? "&" : "?") + new URLSearchParams(options.body);
        } else {
            switch (resolveContentType(options)) {
                case "application/json":
                    request.body = JSON.stringify(options.body);
                    break;

                case "application/x-www-form-urlencoded":
                    request.body = new URLSearchParams(options.body);
                    break;

                case "multipart/form-data": {
                    const formData = new FormData();
                    const body = options.body as Record<string, any>;
                    for (const key in body) {
                        formData.append(key, body[key]);
                    }
                    request.body = formData;
                    break;
                }
                case "text/html":
                case "text/plain":
                    if (typeof options.body !== 'string') {
                        throw new Error("Fetch: Body must be a string for text/plain or text/html content types.");
                    }

                    request.body = options.body;
                    break;
                default:
                    throw new Error(`Fetch: Unsupported Content-Type`);
            }
        }
    }

    //options.mode = options.mode || "no-cors";
    return fetch(url, request)
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw { response, text }; });
            }

            const accept = options?.headers?.['Accept'];
            const contentType = response.headers.get('Content-Type')?.split(";")[0];
            if (accept && accept.split(";")[0] !== contentType) {
                return response.text().then(text => { throw { response, text }; });
            }

            return response?.headers && response.headers.get('Content-Type') === "application/json"
                ? response.json()
                : response.text();
        })
        .catch(error => {
            if (error.message) {
                console.warn(`fetch: ${error.message}`, url, request);
                return null;
            }
            const { response, text } = error;
            function getResponse() {
                const contentType = response?.headers.get('Content-Type')?.split(";")[0] || "";

                if (contentType === "application/json" && (text.startsWith("{") || text.startsWith("["))) {
                    const json = JSON.parse(text);
                    console.warn(`fetch: Error`, url, request, response.status, json);
                    return json;
                } else {
                    const accept = options?.headers?.['Accept']?.split(";")[0] || "";

                    const wrongContentType = accept !== contentType
                        ? "Request Accept header does not match response Content-Type (Accept: " + accept + ", Content-Type: " + contentType + ")"
                        : accept === "application/json"
                            ? "Request Accept header is application/json but response is not JSON"
                            : null;

                    console.warn(`fetch: ${wrongContentType}`, url, request, response.status, text);
                    return (wrongContentType && accept === "application/json"
                            ? {error: text, status: 520}
                            : text
                    );
                }
            }

            throw getResponse();
        });
}

export async function fetchJson(
    url: string,
    options: FetchOptions | null = null
): Promise<any> {
    return fetchRest(url, {
        ...options,
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            ...options?.headers,
        }
    })
    .then(response => {
        if (response?.error) {
            throw response;
        }
        return response;
    });
}

export async function fetchWithRetry(
    url: string,
    options: RequestInit = {},
    maxRetries: number = 3,
    statusNoRetry: number[] = [429]
): Promise<any | Response> {
    return fetch(url, options)
        .then(response => {
            if (response.ok) {
                return response.json();
            }

            if (!statusNoRetry.includes(response.status) && maxRetries > 0) {
                console.log("Retrying...", maxRetries, url, options);

                return sleep(500)
                    .then(() => fetchWithRetry(url, options, maxRetries - 1));
            }

            console.error(response);
            return response;
            //throw new Error(`Failed to fetch ${url}`);
        })
        .catch((err) => console.error(err, "BBBBBBBBBBBBBBBBBBBBBBB"));
}