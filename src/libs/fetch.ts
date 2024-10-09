import {sleep} from "./utils";
import {converter} from "./converter";

export async function fetchRest(url, options = {}) {
    const method = (options.method || "GET").toUpperCase();
    const headers = options.headers || {};
    const body = !["GET", "HEAD"].includes(method)
        ? JSON.stringify(options.body || {})
        : undefined;
    const query = ["GET", "HEAD"].includes(method)
        ? converter.toQueryString(options.body || {}, url.includes("?") ? "&" : "?")
        : "";
    const endpoint = url + query;
    const request = {
        redirect: "follow",
        ...options,
        method,
        headers,
        body,
    };

    return fetch(endpoint, request)
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw { response, text }; });
            }

            if (headers['Accept'] && headers['Accept'].split(";")[0] !== response.headers.get('Content-Type').split(";")[0]) {
                return response.text().then(text => { throw { response, text }; });
            }

            return response?.headers && response.headers.get('Content-Type') === "application/json"
                ? response.json()
                : response.text();
        })
        .catch(error => {
            if (error.message) {
                console.warn(`fetchRest: ${error.message}`, method, endpoint, request);
                return null;
            }
            const { response, text } = error;
            function getResponse() {
                const contentType = response?.headers?.get('Content-Type')?.split(";")[0] || "";

                if (contentType === "application/json" && (text.startsWith("{") || text.startsWith("["))) {
                    const json = JSON.parse(text);
                    console.warn(`fetchRest: Error`, method, endpoint, response.status, request, json);
                    return json;
                } else {
                    const accept = headers?.['Accept']?.split(";")[0] || "";

                    const wrongContentType = accept !== contentType
                        ? "Request Accept header does not match response Content-Type (Accept: " + accept + ", Content-Type: " + contentType + ")"
                        : accept === "application/json"
                            ? "Request Accept header is application/json but response is not JSON"
                            : null;

                    console.warn(`fetchRest: ${wrongContentType}`, method, endpoint, response.status, request, text);
                    return (wrongContentType && accept === "application/json"
                        ? {error: text, status: 520}
                        : text
                    );
                }
            }

            throw getResponse();
        });
}

export async function fetchApi({url, method = "GET", body = {}, headers = {}}) {
    const isGetOrHead = method.toUpperCase() === "GET" || method.toUpperCase() === "HEAD";
    const options = {
        method,
        headers: {
            "Content-Type": "application/json",
            ...headers
        },
        body: isGetOrHead || !body ? undefined : JSON.stringify(body)
    };

    return fetchJson(isGetOrHead && body ? `${url}?${new URLSearchParams(body)}` : url, options);
}

export async function fetchJson(url, options = {}) {
    //options.mode = options.mode || "no-cors";
    return fetch(url, {
            redirect: "follow",
            ...options
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }

            console.error(`Failed to fetch Json`, response);
            throw {response, url, options};
        });
}

export async function fetchWithRetry(url, options = undefined, maxRetries = 3, statusNoRetry = [429]) {
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