import {useEffect, useMemo} from "react";
import firebase from "firebase/compat/app";
import 'firebase/compat/database';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { converter } from "../../libs/converter.js";

let databaseInstance = null;

const consoleLog = (...args) => {
    if (0 && process.env.NODE_ENV === 'development') {
        console.log(...args);
    }
};

const handleError = (action, error, exception) => {
    const message = `Errore durante ${action}: ${error}`;
    if (exception) {
        throw new Error(message);
    }
    console.error(message);
};

const getDatabase = () => {
    if (!databaseInstance && firebase.apps.length) {
        databaseInstance = firebase.app().database();
    }
    return databaseInstance || null;
};

const query = (dbRef, where = null) => {
    if (!where) return dbRef;

    const op = where.op || "=";
    const field = Object.keys(where)[0];
    const value = Object.values(where)[0];

    switch (op) {
        case '=':
            return dbRef.orderByChild(field).equalTo(value);
        case '>':
            return dbRef.orderByChild(field).startAt(value);
        case '<':
            return dbRef.orderByChild(field).endAt(value);
        default:
            return dbRef;
    }
};
const db = {
    read: async (path, { where = null, toArray = false, shallow = false, exception = false } = {}) => {
        const dbRef = query(getDatabase().ref(path), where);
        if (shallow) {
            dbRef.limitToFirst(1);
        }

        const snapshot = await dbRef.get();
        if (snapshot.exists()) {
            return (toArray
                    ? Object.values(snapshot.val())
                    : snapshot.val()
            );
        } else if (exception) {
            throw new Error(`Data not found in Firebase for path ${path}`);
        }
        consoleLog(`Info: Data not found in Firebase for path ${path}`);
    },
    set: async (path, data, exception = false) => {
        const dbRef = getDatabase().ref(path);
        try {
            await dbRef.set(data);
            consoleLog(`Dati aggiornati con successo in Firebase per ${path}`);
        } catch (error) {
            handleError(`aggiornamento dei dati in Firebase per ${path}`, error, exception);
        }
    },
    remove: async (path, exception = false) => {
        const dbRef = getDatabase().ref(path);
        try {
            await dbRef.remove();
            consoleLog(`Dati rimossi con successo in Firebase per ${path}`);
        } catch (error) {
            handleError(`rimozione dei dati in Firebase per ${path}`, error, exception);
        }
    },
    useListener: (
        path,
        setRecords,
        {
            where = null,
            fieldMap = null,
            onLoad = null
        } = {}) => {
        const auth = useMemo(() => getAuth(), []); // Ottieni l'oggetto auth una sola volta

        useEffect(() => {
            if (!path) return;

            const map = (fieldMap && typeof fieldMap === "string"
                    ? { label: fieldMap, value: fieldMap }
                    : fieldMap
            );
            // Funzione per recuperare i dati dal database
            const fetchData = () => {
                const dbRef = query(getDatabase().ref(path), where);

                const onValueChange = (snapshot) => {
                    const val = snapshot.val();
                    const mapKey = Object.keys(map || {});
                    const records = val && map
                        ? Object.keys(val).map(key => {
                            return mapKey.reduce((acc, prop) => {
                                acc[prop] = map[prop].includes("{")
                                    ? converter.parse({ key: key, ...val[key] }, map[prop])
                                    : map[prop] === "key" && !val[key][map[prop]] ? key : val[key][map[prop]];
                                return acc;
                            }, {});
                        })
                        : val || [];

                    setRecords(onLoad ? onLoad(records) : records);
                };

                dbRef.on('value', onValueChange);

                // Restituisci la funzione per disiscrivere il listener
                return () => {
                    dbRef.off('value', onValueChange); // Pulisci il listener del database
                };
            };


            // Listener per i cambiamenti di stato dell'autenticazione
            const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
                console.log("unsubscribeAuthunsubscribeAuthunsubscribeAuthunsubscribeAuthunsubscribeAuthunsubscribeAuthunsubscribeAuth");

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