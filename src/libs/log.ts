import db from "./database";
import {normalizeKey} from "./utils";
import {getGlobalVars} from "../Global";



const setLog = async (
    path: string,
    action: 'create' | 'update' | 'delete',
    record: any,
    recordKey?: string
): Promise<void> => {
    const when = new Date().toISOString();
    const user = getGlobalVars("user");
    const data = {
        user: user.email ?? 'unknown',
        when,
        action,
        record,
        recordKey
    };

    await db.set(`/log/${path}/${normalizeKey(when)}`, data);
};

export default setLog;