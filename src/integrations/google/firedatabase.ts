import {useEffect, useMemo} from "react";
import firebase from "firebase/compat/app";
import 'firebase/compat/database';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { converter } from "../../libs/converter";
import {consoleLog} from "../../constant";

type Operator = "eq" | "lt" | "lte" | "gt" | "gte";
type Condition = {
    [op in Operator]?: string | number | boolean | null;
};
type WhereClause = {
    [field: string]: Condition | string | number | boolean | null;
};

type FieldMap = Record<string, any>;
type RecordObject = Record<string, FieldMap>;
export type RecordProps = FieldMap & { _key?: string, _index?: number };
export type RecordArray = Array<RecordProps>;

type RecordFN<T extends RecordProps = RecordProps> = (records: T[]) => void;
export interface DatabaseOptions<T extends RecordProps = RecordProps> {
    where?: WhereClause;
    fieldMap?: Record<string, string>;
    onLoad?: (data: T[]) => T[];
}

let databaseInstance: firebase.database.Database;

const handleError = (action: string, error: any, exception: boolean) => {
    const message = `Errore durante ${action}: ${error}`;
    if (exception) {
        throw new Error(message);
    }
    console.error(message);
};

const getDatabase = (): firebase.database.Database => {
    if (!databaseInstance && firebase.apps.length) {
        databaseInstance = firebase.app().database();
    }
    return databaseInstance;
};

const query = (
    dbRef: firebase.database.Reference,
    where?: WhereClause
): firebase.database.Query => {
    if (!where) return dbRef;

    const [[field, raw]] = Object.entries(where);

    let ref: firebase.database.Query = dbRef.orderByChild(field);
    if (raw === null) return ref;

    const condition = typeof raw === "object" ? raw : { eq: raw };

    const [[op, val]] = Object.entries(condition);
    switch (op) {
        case "eq":
            return ref.equalTo(val);
        case "gt":
        case "gte":
            return ref.startAt(val);
        case "lt":
        case "lte":
            return ref.endAt(val);
        default:
            console.warn(`Unsupported operator '${op}'`);
            return dbRef;
    }
};

const db = {
    read: async (
        path: string,
        {
            where       = undefined,
            toArray     = false,
            shallow     = false,
            exception   = false
        }: {
            where?: WhereClause;
            toArray?: boolean;
            shallow?: boolean;
            exception?: boolean;
        } = {}
    ) => {
        const dbRef = query(getDatabase().ref(path), where);
        try {
            const snapshot = await dbRef.get();
            if (snapshot.exists()) {
                consoleLog(`Info: Data found in Firebase for path ${path}`);

                if (shallow) {
                    return Object.keys(snapshot.val());
                }

                return (toArray
                        ? Object.values(snapshot.val())
                        : snapshot.val()
                );
            } else if (exception) {
                handleError(`Data not found in Firebase for path ${path}`, null, exception);
            }
        } catch (error) {
            handleError(`lettura dei dati in Firebase per ${path}`, error, exception);
        }
    },
    set: async (path: string, data: any, exception: boolean = false) => {
        const dbRef = getDatabase().ref(path);
        try {
            await dbRef.set(data);
            consoleLog(`Dati aggiornati con successo in Firebase per ${path}`);
        } catch (error) {
            handleError(`aggiornamento dei dati in Firebase per ${path}`, error, exception);
        }
    },
    remove: async (path: string, exception: boolean = false) => {
        const dbRef = getDatabase().ref(path);
        try {
            await dbRef.remove();
            consoleLog(`Dati rimossi con successo in Firebase per ${path}`);
        } catch (error) {
            handleError(`rimozione dei dati in Firebase per ${path}`, error, exception);
        }
    },
    useListener: <T extends RecordProps = RecordProps>(
        path: string | undefined,
        setRecords: RecordFN<T>,
        {
            where = undefined,
            fieldMap = undefined,
            onLoad = undefined
        }: DatabaseOptions<T> = {}
    ) => {
        const auth = useMemo(() => getAuth(), []); // Ottieni l'oggetto auth una sola volta

        useEffect(() => {
            if (!path) return;

            const fetchData = () => {
                const dbRef = query(getDatabase().ref(path), where);

                const onValueChange = (snapshot: firebase.database.DataSnapshot) => {
                    const val: RecordObject = snapshot.val();

                    if (!val) {
                        setRecords([]);
                        return;
                    }

                    if (!fieldMap) {
                        const records: T[] = Object.entries(val).map(
                            ([key, value], index) => ({
                                _index: index,
                                _key: key,
                                ...value
                            }) as T
                        );
                        setRecords(onLoad ? onLoad(records) : records);
                        return;
                    }

                    const mapKeys = Object.keys(fieldMap);
                    const records: T[] = [];
                    let index = 0;

                    for (const [key, value] of Object.entries(val)) {
                        const mapped: FieldMap = {};

                        for (let i = 0; i < mapKeys.length; i++) {
                            const prop = mapKeys[i];
                            const field = fieldMap[prop];

                            mapped[prop] = field.includes("{")
                                ? converter.parse({ key, ...value }, field)
                                : value[field];
                        }

                        records.push({
                            _key: key,
                            _index: index++,
                            ...mapped
                        } as T);
                    }

                    setRecords(onLoad ? onLoad(records) : records);
                };

                dbRef.on("value", onValueChange);

                return () => {
                    dbRef.off("value", onValueChange);
                };
            };


            // Listener per i cambiamenti di stato dell'autenticazione
            const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
                if (!user) {
                    // Se l'utente non è autenticato, pulisci i record
                    setRecords([]);
                } else {
                    // L'utente è autenticato, recupera i dati (se necessario)
                    fetchData();
                }
            });

            // Cleanup function per rimuovere i listener
            return () => {
                unsubscribeAuth(); // Pulisci il listener di autenticazione
            };
        }, [path, setRecords, fieldMap, onLoad, where]);
    }
};

export default db;