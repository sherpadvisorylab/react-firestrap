import db from "./database";
import { normalizeKey } from "./utils";

export interface CacheOptions {
    callLabel: string;
    callKey: string;
    callBasePath: string;
    callService: string;
    callFunc: Function;
    callOptions: Object;
}

export const cache = async (
    search: any, 
    strategy: any,
    {
        callLabel,
        callKey,
        callBasePath,
        callService,
        callFunc,
        callOptions
    }: CacheOptions,
    caller: any = null, 
    storePaths: string[] = []
) => {
    const callPath = `${callBasePath}/${normalizeKey(strategy)}/${callKey}`;
    const callServicePath = `${callService}/${callKey}`;

    return await db.read(callPath) || await callFunc(search, strategy, callOptions).then((response: any) => {
        if (response) {
            db.set(callPath, response).then(() => {
                // Success case - could add error management here if needed
            });
        } else {
            console.warn(`${callLabel} ${strategy}: No Result`);
            response = {};
        }

        return response;
    });
};
