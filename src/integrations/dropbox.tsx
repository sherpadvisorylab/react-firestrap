import React from "react";
import {fetchWithRetry} from "../libs/fetch";
import {sleep} from "../libs/utils";
import {AuthButton, getAccessToken, useAccessToken} from "../auth";
import type {IButton} from "../components/Buttons";
import pathInfo from "../libs/path";


const DROPBPX_URL = "https://www.dropbox.com/home";
export const DROPBOX_AUTH_SERVER = 'www.dropbox.com/oauth2';

let config = null;

const init = (dropBoxConfig) => {
    config = dropBoxConfig;
}

const fetchDropboxBlob = async (url, body, headers = {}) => {
    const ACCESS_TOKEN= await getAccessToken(config.clientId);
    if(!ACCESS_TOKEN) {
        throw new Error('DropBox: Access token not found');
    }

    return await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/octet-stream',
            ...headers
        },
        body: body,
    }).catch((error) => {
        console.error('There was a problem with the fetch operation:', error);
        return null;
    }).finally(() => {
        console.log('DropBox: Fetch operation completed');
    })
}

const fetchDropbox = async (url, body, headers = {}) => {
    const ACCESS_TOKEN= await getAccessToken(config.clientId);
    if(!ACCESS_TOKEN) {
        console.error('DropBox: Access token not found');
        return null;
    }

    return await fetchWithRetry(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
            ...headers
        },
        body: JSON.stringify(body),
    }).then(async (response) => {
        if (response.status === 409) {
            const json = await response.json();
            if (!json.error_summary || !json.error_summary.includes("not_found")) {
                console.error('DropBox: Fetch operation failed:', json);
            }
            return null;
        }
        return response;
    }).catch((error) => {
        console.error('There was a problem with the fetch operation:', error);
        return null;
    }).finally(() => {
        console.log('DropBox: Fetch operation completed', url);
    })
}

export const resolvePath = (path, includeHost = false) => {
    return (includeHost ? DROPBPX_URL : "") + (path.startsWith(config.rootPath) ? path : config.rootPath + path);
}

const search = async (jobPath, startPath = null, removeExtension = false) => {
    const paths = {};
    const dropBoxPaths = await dropBox.listFolders({
        path: `${jobPath + startPath}`,
        recursive: true
    });
    dropBoxPaths.forEach(dropBoxPath => {
        if (dropBoxPath[".tag"] === "folder") return;
        paths[removeExtension ? pathInfo.changeFilename(dropBoxPath.path_display, {ext:''}): dropBoxPath.path_display] = dropBoxPath.name;
    });

    return paths;
}

const onCompleted = async (response, path) => {
    if (!response.async_job_id) {
        return Promise.reject(response);
    }

    let check;
    let inProgress = true;
    while (inProgress) {
        await sleep(100);
        check = await fetchDropbox(`https://api.dropboxapi.com/2/${path}/check`, {
            async_job_id: response.async_job_id
        });

        console.log("DropBox: Check folders response: ", check);

        if (check?.[".tag"] !== "in_progress") {
            inProgress = false;
        }
    }

    return (check?.[".tag"] === "complete"
        ? Promise.resolve(check.entries)
        : Promise.reject(check)
    );
};


const createFolders = async (paths, basePath = "") => {
    const apiPath = "files/create_folder_batch";
    const response = await fetchDropbox(`https://api.dropboxapi.com/2/${apiPath}`, {
        "autorename": false,
        "force_async": true,
        "paths": paths.map(path => resolvePath(basePath + path)),
    });

    return onCompleted(response, apiPath);
}

const deleteBulk = async (paths, basePath = "") => {
    const apiPath = "files/create_folder_batch";
    const response = fetchDropbox(`https://api.dropboxapi.com/2/${apiPath}`, {
        entries: paths.map(path => ({ path: resolvePath(basePath + path) })),
    });

    return onCompleted(response, apiPath);
}

const addTag = async (path, tag) => {
    return fetchDropbox("https://api.dropboxapi.com/2/files/tags/add", {
        "path": path,
        "tag_text": tag.toLowerCase().replaceAll(/[^a-z0-9]/g, ""),
    });
}

const addTags = async (paths, basePath = "") => {
    for (const path in paths) {
        for (const tag of paths[path]) {
            await addTag(resolvePath(basePath + path), tag);
        }
    }
}

const listFolders = async ({path = "", recursive = false} = {}) => {
    const entries = [];
    const fetchFolders = async ({path, cursor, recursive}) => {
        return (
            path
            ? await fetchDropbox("https://api.dropboxapi.com/2/files/list_folder", {
                "include_deleted": false,
                "include_has_explicit_shared_members": false,
                "include_media_info": false,
                "include_mounted_folders": true,
                "include_non_downloadable_files": true,
                "path": resolvePath(path),
                "recursive": recursive
            })
            : await fetchDropbox("https://api.dropboxapi.com/2/files/list_folder/continue", {
                "cursor": cursor
            })
        );
    }

    let folders = {has_more: true, cursor: null};
    while (folders?.has_more) {
        folders = await fetchFolders(folders.cursor
            ? {cursor: folders.cursor, recursive}
            : {path:  path, recursive}
        );
        folders && entries.push(...folders.entries);
    }

    return entries;
}

const copy_ = async (paths) => {
    const startCopy = async (entry) => {
        return await fetchDropbox("https://api.dropboxapi.com/2/files/copy_v2", {
            ...entry,
            autorename: false
        });
    };

    for (const path of paths) {
        await startCopy({
            from_path: resolvePath(path.from),
            to_path: resolvePath(path.to),
        });
    }

};

const copy = async (paths) => {
    const STEP = 900;

    const startCopy = async (entries) => {
        return await fetchDropbox("https://api.dropboxapi.com/2/files/copy_batch_v2", {
            entries: entries,
            autorename: false
        });
    };
    const checkJobStatus = async (asyncJobId) => {
        return await fetchDropbox("https://api.dropboxapi.com/2/files/copy_batch/check_v2", {
            async_job_id: asyncJobId
        });
    };

    const results = [];
    let entries = [];
    for (let i = 0; i < paths.length; i += STEP) {
        entries = paths.slice(i, i + STEP).map(path => ({
            from_path: resolvePath(path.from),
            to_path: resolvePath(path.to),
        }));

        // Start the copy operation
        const copyResponse = await startCopy(entries);
        if (copyResponse.error) {
            throw new Error(`Error starting copy: ${copyResponse.error}`);
        }

        let jobStatus = copyResponse;
        while (jobStatus?.['.tag'] === 'async_job_id' || jobStatus?.['.tag'] === 'in_progress') {
            await sleep(2000);

            jobStatus = await checkJobStatus(copyResponse.async_job_id);
        }

        if (jobStatus?.['.tag'] === 'failed') {
            throw new Error(`Copy operation failed: ${jobStatus['.tag']}`);
        }

        if (jobStatus?.['.tag'] === 'complete') {
            results.push(...jobStatus.entries);
        }
    }

    return results
        .filter(entry => entry[".tag"] === "failure")
        .map(entry => entry.failure);
};

const move = async (paths) => {
    const startMove = async (entry) => {
        return await fetchDropbox("https://api.dropboxapi.com/2/files/move_v2", {
            ...entry,
            autorename: true
        });
    };

    for (const path of paths) {
        await startMove({
            from_path: resolvePath(path.from),
            to_path: resolvePath(path.to),
        });
    }
};

const getThumbnails = async ({
                                 thumbnailsRequest = [],
                                 size = "w64h64",
                                 format = "jpeg",
                                 mode = "strict"
}: {
    thumbnailsRequest: {path: string, [key]: string}[],
    size?: 'w32h32' | 'w64h64' | 'w128h128' | 'w256h256' | 'w480h320' | 'w640h480' | 'w960h640' | 'w1024h768' | 'w2048h1536',
    format?: 'jpg' | 'jpeg' | 'png' | 'tiff' | 'tif' | 'gif' | 'webp' | 'ppm' | 'bmp',
    mode?: 'strict' | 'bestfit' | 'fitone_bestfit' | 'original'
}, setThumbnails?: (thumbnails: {[path: string]: {path: string, thumbnail: string, mimetype:string, width: number, height: number, [key]: string}}) => void): Promise<any> => {
    const STEP = 25;
    const PLACEHOLDER_THUMBNAIL= "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAgAAAAwAAAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==";

    const setEntry = (path) => {
        return {
            "path": resolvePath(path),
            "format": format,
            "size": size,
            "mode": mode
        }
    }
    let results = {};
    const fetchPromise = [];
    for (let i = 0; i < thumbnailsRequest.length; i += STEP) {
        const batch = thumbnailsRequest.slice(i, i + STEP);
        const entries = batch.map(request => setEntry(request.path));
        await sleep(100);
        fetchPromise.push(fetchDropbox("https://content.dropboxapi.com/2/files/get_thumbnail_batch", { entries })
            .then((thumbnails) => {
                if(!thumbnails) return;

                const entries = thumbnails.entries.reduce((acc, entry, index) => {
                    const path = batch[index].path;
                    acc[path] = {
                        ...batch[index],
                        thumbnail: entry?.[".tag"] === "success" ? entry.thumbnail : PLACEHOLDER_THUMBNAIL,
                        mimetype: "data:image/jpeg;base64,",
                        width: size.split("h")[0].split("w")[1],
                        height: size.split("h")[1],
                    };
                    return acc;
                }, {});
                console.log("DropBox: setThumbnails", entries);
                setThumbnails && setThumbnails(entries);
                results = {...results, ...entries};
            }));
    }
    return Promise.all(fetchPromise).then(() => {
        return results;
    });
}

const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);

        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
};

const upload = async (path, fileBase64) => {
    try {
        // Rimuovi il prefisso "data:image/png;base64," se presente
        const base64Data = fileBase64.split(',')[1];

        // Converti base64 in un blob
        const blob = b64toBlob(base64Data, 'application/octet-stream');

        fetchDropboxBlob("https://content.dropboxapi.com/2/files/upload", blob, {
            'Dropbox-API-Arg': JSON.stringify({
                path: resolvePath(path),
                mode: 'overwrite',
                autorename: true,
                mute: false
            })
        }).then((response) => {
            console.log("DropBox: Upload response", response);
        });
    } catch (error) {
        console.error('Errore durante il caricamento su Dropbox:', error);
    }
}

export const useDropBoxConnect = (renew = false) => {
    return useAccessToken(config.clientId, renew);
}

export const DropBoxConnectButton = (options: IButton = {}) => {
    const isAuth = useDropBoxConnect(true);

    return(<AuthButton
            authServer={DROPBOX_AUTH_SERVER}
            clientID={config.clientId}
            refreshParamName={"token_access_type"}
            options={{
                ...options,
                buttonClass: options?.buttonClass + (isAuth ? " text-success": " text-danger"),
                icon : isAuth ? "link" : "link-break",
                title : isAuth ? "DropBox Connected" : "DropBox Disconnected",
            }}
        />
    );
}

export const dropBox = {
    resolvePath: resolvePath,
    createFolders: createFolders,
    deleteBulk: deleteBulk,
    addTags: addTags,
    listFolders: listFolders,
    getThumbnails: getThumbnails,
    search: search,
    upload: upload,
    copy: copy,
    move: move,
}



export default init;
