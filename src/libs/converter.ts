interface DateTimeResult {
    year: string;
    shortYear: string;
    month: string;
    day: string;
    hours: string;
    minutes: string;
    seconds: string;
    hour: string;
    minute: string;
    second: string;
}

function DateTime(date: string | number | Date): DateTimeResult {
    const d = new Date(typeof date === 'number' || /^\d+$/.test(String(date)) ? Number(date) : date);
    if (isNaN(d.getTime())) {
        return {
            year: '',
            shortYear: '',
            month: '',
            day: '',
            hours: '',
            minutes: '',
            seconds: '',
            hour: '',
            minute: '',
            second: '',
        };
    }

    const padToTwoDigits = (num: number): string => num.toString().padStart(2, '0');

    return {
        year: d.getFullYear().toString(),
        shortYear: d.getFullYear().toString().slice(-2),
        month: padToTwoDigits(d.getMonth() + 1),
        day: padToTwoDigits(d.getDate()),
        hours: padToTwoDigits(d.getHours()),
        minutes: padToTwoDigits(d.getMinutes()),
        seconds: padToTwoDigits(d.getSeconds()),
        hour: d.getHours().toString(),
        minute: d.getMinutes().toString(),
        second: d.getSeconds().toString(),
    };
}

function formatDate(date: string | number | Date, format: string): string {
    const {
        year, shortYear, month, day, hours, minutes, seconds, hour, minute, second
    } = DateTime(date);

    const replacements: Record<string, string> = {
        'YYYY': year,
        'YY': shortYear,
        'MM': month,
        'DD': day,
        'hh': hours,
        'mm': minutes,
        'ss': seconds,
        'h': hour,
        'm': minute,
        's': second
    };

    return format.replace(/YYYY|YY|MM|DD|hh|mm|ss|h|m|s/g, match => replacements[match] || match);
}

function getDefaultDateFormat(): string {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat(undefined, {
        year: 'numeric', month: '2-digit', day: '2-digit'
    });
    const parts = formatter.formatToParts(date);
    return parts.map(part => {
        switch (part.type) {
            case 'year': return 'YYYY';
            case 'month': return 'MM';
            case 'day': return 'DD';
            default: return part.value;
        }
    }).join('');
}

function getDefaultTimeFormat(): string {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat(undefined, {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
    const parts = formatter.formatToParts(date);
    return parts.map(part => {
        switch (part.type) {
            case 'hour': return 'hh';
            case 'minute': return 'mm';
            case 'second': return 'ss';
            default: return part.value;
        }
    }).join('');
}

type ConverterFunction = (value: string | number | Date, format?: string) => string;

interface ConverterCore {
    toDate: ConverterFunction;
    toTime: ConverterFunction;
    toDateTime: ConverterFunction;
    toCamel: (str: string, separator?: string, delimiter?: string[]) => string;
    toUpper: (str: string) => string;
    toLower: (str: string) => string;
    subStringCount: (str: string, subStr: string) => number;
}

interface Converter extends ConverterCore {
    parse: (values: Record<string, string>, pattern: string) => string;
    splitLast: (str: string, seps: string | string[], regException?: RegExp) => [string, string];
    splitFirst: (str: string, seps: string | string[], regException?: RegExp) => [string, string];
    padLeft: (str: string, length: number, char?: string, regex?: RegExp) => string;
    padRight: (str: string, length: number, char?: string, regex?: RegExp) => string;
    toQueryString: (params: Record<string, string>, startWith?: string, fill?: string) => string;
    fillObject: <T>(obj: Record<string, T>, value?: any) => Record<string, any>;
    [key: string]: ConverterCore[keyof ConverterCore] | any;
}

export const converter: Converter = {
    parse: (values, pattern) => {
        const parse = pattern.replace(/{([^}:]+)(?::([^}:]+))?(?::([^}:]+))?}/g, (_, Key, Func, format) => {
            const [pre, key] = ((Key || '').indexOf('(') === -1 ? ['', Key] : Key.split('(', 2));
            const [func, post] = ((Func || '').indexOf(')') === -1 ? [Func, ''] : Func.split(')', 2));

            if (!converter?.[func] || !values?.[key]) {
                //console.error(`Conversion failed`, values, key, func)
                return values[key] || '';
            }

            return pre + converter[func](values[key], format) + post;
        });

        return splitter(replacer(parse));
    },
    toDate: (date, format = undefined) => {
        const defaultFormat = getDefaultDateFormat();
        if (format === 'ISO') {
            return formatDate(date, 'YYYY-MM-DD');
        }
        return formatDate(date, format || defaultFormat);
    },
    toTime: (date, format = undefined) => {
        const defaultFormat = getDefaultTimeFormat();
        if (format === 'ISO') {
            return formatDate(date, 'hh:mm:ss');
        }
        return formatDate(date, format || defaultFormat);
    },
    toDateTime: (date, format = undefined) => {
        const defaultDateFormat = getDefaultDateFormat();
        const defaultTimeFormat = getDefaultTimeFormat();
        const defaultFormat = `${defaultDateFormat} ${defaultTimeFormat}`;
        if (format === 'ISO') {
            return formatDate(date, 'YYYY-MM-DD hh:mm:ss');
        }
        return formatDate(date, format || defaultFormat);
    },
    toCamel: (str, separator = '', delimiter = ['-', '_', ' ']) => {
        const parts = str.split('/');
        const last = parts.pop() || '';
        const escaped = delimiter.map(d => '\\' + d).join('');
        const regex = new RegExp(`(?:[${escaped}]+|^)(.)`, 'g');
        const camel = last.toLowerCase().replace(regex, (_, char) => separator + char.toUpperCase());
        return [...parts, camel].join('/');
    },
    toUpper: (str) => str.toUpperCase(),
    toLower: (str) => str.toLowerCase(),
    splitLast: (str, seps, regException = undefined) => {
        const splitter = (sep: string): [string, string] | null => {
            const split = str.split(sep);
            if (split.length <= 1) return null;
            let last = split.pop() || '';
            while (split.length && regException?.test(split[split.length - 1])) {
                last = split.pop() + sep + last;
            }
            return [split.join(sep), last];
        };
        const separators: string[] = typeof seps === 'string' ? [seps] : Array.isArray(seps) ? seps : [];
        for (const sep of separators) {
            const result = splitter(sep);
            if (result) return result;
        }
        return [str, ''];
    },
    splitFirst: (str, seps, regException = undefined) => {
        const splitter = (sep: string): [string, string] | null => {
            const split = str.split(sep);
            if (split.length <= 1) return null;
            let first = split.shift() || '';
            while (split.length && regException?.test(split[0])) {
                first += sep + split.shift();
            }
            return [first, split.join(sep)];
        };
        const separators: string[] = typeof seps === 'string' ? [seps] : Array.isArray(seps) ? seps : [];
        for (const sep of separators) {
            const result = splitter(sep);
            if (result) return result;
        }
        return [str, ''];
    },
    padLeft: (str, length, char = ' ', regex = undefined) => {
        if (regex) {
            return str.replace(regex, match => match.padStart(length, char));
        }
        return str.padStart(length, char);
    },
    padRight: (str, length, char = ' ', regex = undefined) => {
        if (regex) {
            return str.replace(regex, match => match.padEnd(length, char));
        }
        return str.padEnd(length, char);
    },
    toQueryString: (params, startWith = "?", fill = undefined) => {
        const query = Object.keys(params);
        return (query.length > 0 ? startWith : "") + query.map(key => {
            return `${encodeURIComponent(key)}=${encodeURIComponent(fill === undefined
                ? params[key]
                : fill)}`;
        }).join('&');
    },
    fillObject: (obj, value = null) => {
        const result: Record<string, any> = {};
        for (const key in obj) {
            result[key] = value;
        }
        return result;
    },
    subStringCount: (str, subStr) => {
        if (subStr === '') return 0;
        return str.split(subStr).length - 1;
    }
};

function replacer(pattern: string) {
    return pattern.replace(/replace\(([^,]+),([^,]+),([^)]+)\)/gi, (_, key, from, to) => {
        return key.replaceAll(from, to);
    });
}

function splitter(pattern: string) {
    return pattern.replace(/split\(([^,]+),([^,]+),([^)]+)\)/gi, (_, key, sep, index = 0) => {
        return key.split(sep)[index];
    });
}
