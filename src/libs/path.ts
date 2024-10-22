interface PathUtils {
    basename(path: string): string;
    extname(path: string): string;
    dirname(path: string): string;
    filename(path: string): string;
    parentBasename(path: string): string;
    parentDirname(path: string): string;
    parentFilename(path: string): string;
    append(path: string, suffix: string): string;
    prepend(path: string, prefix: string): string;
    changeFilename(path: string, options?: { prefix?: string; suffix?: string; ext?: string | null }): string;
    join(...paths: string[]): string;
    parse(path: string): { root: string; dir: string; base: string; ext: string; name: string; };
}

const path: PathUtils = {
    // Restituisce l'ultimo segmento di un percorso, escludendo la barra finale se presente
    basename: (path) => {
        const segments = path.split('/').filter(Boolean);
        return segments.pop() || '';
    },

    // Restituisce l'estensione del file, includendo il punto
    extname: (path) => {
        const index = path.lastIndexOf('.');
        return index > 0 ? path.slice(index) : '';
    },

    // Restituisce la directory del percorso, escludendo il nome del file
    dirname: (path) => {
        const segments = path.split('/').filter(Boolean);
        segments.pop(); // Rimuovi il basename
        return '/' + segments.join('/');
    },

    // Restituisce il nome del file senza l'estensione
    filename: (path) => {
        const base = path.split('/').pop() || '';
        const ext = base.includes('.') ? base.slice(base.lastIndexOf('.')) : '';
        return base.replace(ext, '');
    },

    // Restituisce il nome del percorso genitore
    parentBasename: (path) => {
        const segments = path.split('/').filter(Boolean);
        segments.pop(); // Rimuovi il basename
        return segments.pop() || '';
    },

    // Restituisce la directory del percorso genitore
    parentDirname: (path) => {
        const segments = path.split('/').filter(Boolean);
        segments.pop(); // Rimuovi il basename
        segments.pop(); // Rimuovi il parent basename
        return '/' + segments.join('/');
    },

    // Restituisce il nome del file del percorso genitore senza l'estensione
    parentFilename: (path) => {
        const segments = path.split('/').filter(Boolean);
        segments.pop(); // Rimuovi il basename
        const parentBase = segments.pop() || '';
        const ext = parentBase.includes('.') ? parentBase.slice(parentBase.lastIndexOf('.')) : '';
        return parentBase.replace(ext, '');
    },

    // Aggiunge un suffisso al nome del file mantenendo l'estensione
    append: (path, suffix) => {
        const dir = path.split('/').slice(0, -1).join('/');
        const base = path.split('/').pop() || '';
        const ext = base.includes('.') ? base.slice(base.lastIndexOf('.')) : '';
        const name = base.replace(ext, '');
        return (dir ? dir + '/' : '') + name + suffix + ext;
    },

    // Aggiunge un prefisso al nome del file mantenendo l'estensione
    prepend: (path, prefix) => {
        const dir = path.split('/').slice(0, -1).join('/');
        const base = path.split('/').pop() || '';
        const ext = base.includes('.') ? base.slice(base.lastIndexOf('.')) : '';
        const name = base.replace(ext, '');
        return (dir ? dir + '/' : '') + prefix + name + ext;
    },

    // Modifica il nome del file aggiungendo un prefisso e/o un suffisso e opzionalmente cambiando l'estensione
    changeFilename: (path, { prefix = '', suffix = '', ext = null } = {}) => {
        const dir = path.split('/').slice(0, -1).join('/');
        const base = path.split('/').pop() || '';
        const currentExt = base.includes('.') ? base.slice(base.lastIndexOf('.')) : '';
        const name = base.replace(currentExt, '');
        //const newExt = ext === '' ? '' : ext.startsWith('.') ? ext : (ext ? '.' + ext : currentExt);
        const newExt = ext !== null ? (ext ? (ext.startsWith('.') ? ext : '.' + ext) : '') : currentExt;
        return (dir ? dir + '/' : '') + prefix + name + suffix + newExt;
    },

    // Combina diversi segmenti di percorso in un unico percorso
    join: (...paths) => {
        return paths.join('/').replace(/\/+/g, '/');
    },

    // Divide il percorso in root, dir, base, ext, e name
    parse: (inputPath) => {
        const ext = path.extname(inputPath);
        const base = path.basename(inputPath);
        const dir = path.dirname(inputPath);
        const root = inputPath.startsWith('/') ? '/' : '';
        const name = base.replace(ext, '');

        return {
            root: root,
            dir: dir,
            base: base,
            ext: ext,
            name: name
        };
    }
};

export default path;