import db from "./database.js";
import {normalizeKey} from "./utils.js";
import {getGlobalVars} from "../Global.js";


const setLog = async (path, action, record, recordKey) => {
    const when = new Date().toISOString();
    const user = getGlobalVars("user");
    const data = { user: user.email, when, action, record, recordKey };

    await db.set(`/log/${path}/${normalizeKey(when)}`, data);
};

export default setLog;