function DateTime(date) {
    const d = new Date(isNaN(date) ? date : parseInt(date));

    const padToTwoDigits = (num) => {
        return num.toString().padStart(2, '0');
    };

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

function formatDate(date, format) {
    const {
        year, shortYear, month, day, hours, minutes, seconds, hour, minute, second
    } = DateTime(date);

    const replacements = {
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

function getDefaultDateFormat() {
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

function getDefaultTimeFormat() {
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

export const converter = {
    parse: (values, pattern) => {
        const parse = pattern.replace(/{([^}:]+)(?::([^}:]+))?(?::([^}:]+))?}/g, (_, Key, Func, format) => {
            const [pre, key] = ((Key || "").indexOf("(") === -1
                ? ["", Key]
                : Key.split("(", 2)
            );
            const [func, post] = ((Func || "").indexOf(")") === -1
                ? [Func, ""]
                : Func.split(")", 2)
            );

            if(!converter?.[func] || !values?.[key]) {
                //console.error(`Conversion failed`, values, key, func)
                return values[key] || '';
            }

            return pre + converter[func](values[key], format) + post;
        });

        return replacer(parse);
    },
    toDate: (date, format = null) => {
        const defaultFormat = getDefaultDateFormat();
        if (format === 'ISO') {
            return formatDate(date, 'YYYY-MM-DD');
        }
        return formatDate(date, format || defaultFormat);
    },
    toTime: (date, format = null) => {
        const defaultFormat = getDefaultTimeFormat();
        if (format === 'ISO') {
            return formatDate(date, 'hh:mm:ss');
        }
        return formatDate(date, format || defaultFormat);
    },
    toDateTime: (date, format = null) => {
        const defaultDateFormat = getDefaultDateFormat();
        const defaultTimeFormat = getDefaultTimeFormat();
        const defaultFormat = `${defaultDateFormat} ${defaultTimeFormat}`;
        if (format === 'ISO') {
            return formatDate(date, 'YYYY-MM-DD hh:mm:ss');
        }
        return formatDate(date, format || defaultFormat);
    },
    toCamel: (str, separator = '') => {
        return str.toLowerCase().replace(/(?:[-_/ ]+|^)(.)/g, (_, char) => separator + char.toUpperCase());
    },
    toUpper: (str) => {
        return str.toUpperCase();
    },
    toLower: (str) => {
        return str.toLowerCase();
    },
    splitLast: (str, seps, regExeption = null) => {
        const splitter = (sep) => {
            const split = str.split(sep);
            let last = split.pop();
            while(regExeption && regExeption.test(split[split.length - 1])) {
                last = split.pop() + sep + last;
            }

            return split.length
                ? [split.join(sep), last]
                : null;
        }

        const separators = typeof seps === 'string' ? [seps] : Array.isArray(seps) ? seps : [];
        const result = separators.reduce((acc, sep) => acc || splitter(sep), null);

        return result || [str, ''];
    },
    splitFirst: (str, seps, regExeption = null) => {
        const splitter = (sep) => {
            const split = str.split(sep);
            let first = split.shift();
            while(regExeption && regExeption.test(split[0])) {
                first += sep + split.shift();
            }

            return split.length
                ? [first, split.join(sep)]
                : null;
        }

        const separators = typeof seps === 'string' ? [seps] : Array.isArray(seps) ? seps : [];
        const result = separators.reduce((acc, sep) => acc || splitter(sep), null);

        return result || [str, ''];
    },
    padLeft: (str, length, char = ' ', regex = null) => {
        if(regex) {
            return str.replace(regex, match => match.padStart(length, char));
        }
        return str.padStart(length, char);
    },
    padRight: (str, length, char = ' ', regex = null) => {
        if(regex) {
            return str.replace(regex, match => match.padEnd(length, char));
        }
        return str.padEnd(length, char);
    },
    toQueryString: (params, startWith = "?", fill = null) => {
        const query = Object.keys(params);
        return (query.length > 0 ? startWith : "") + query.map(key => {
            return `${encodeURIComponent(key)}=${encodeURIComponent(fill === null
                ? params[key]
                : fill)}`;
        }).join('&');
    },
    fillObject: (obj, value = null) => {
        const result = {};
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


function replacer(pattern) {
    return pattern.replace(/replace\(([^,]+),([^,]+),([^)]+)\)/gi, (_, key, from, to) => {
        return key.replaceAll(from, to);
    });
}