import React from 'react';
import {useTheme} from "../../Theme";
import {Wrapper} from "./GridSystem";
import {RecordArray, RecordProps} from "../../integrations/google/firedatabase";

export type TableHeaderProp = {
    key: string,
    label: string,
    className?: string,
    sort?: boolean
};

type TableProps = {
    header: TableHeaderProp[],
    body?: RecordArray,
    Footer?: string | React.ReactNode,
    onClick?: (index: number) => void;
    wrapClass?: string,
    scrollClass?: string,
    tableClass?: string,
    headerClass?: string,
    bodyClass?: string,
    footerClass?: string,
    selectedClass?: string
};

function Table({
                   header,
                   body             = undefined,
                   Footer           = undefined,
                   onClick          = undefined,
                   wrapClass        = undefined,
                   scrollClass      = undefined,
                   tableClass       = undefined,
                   headerClass      = undefined,
                   bodyClass        = undefined,
                   footerClass      = undefined,
                   selectedClass    = undefined
} : TableProps) {
    const theme = useTheme("table");
    const activeClass = selectedClass || theme.Table.selectedClass;

    const handleClick = (e: React.MouseEvent<HTMLElement>, index: number) => {
        let currentElement = e.target as HTMLElement;

        while (currentElement && currentElement.tagName !== 'TR') {
            if (currentElement.tagName === 'A' || currentElement.tagName === 'BUTTON' ) {
                return;
            }
            currentElement = currentElement.parentNode as HTMLElement;
        }

        if (activeClass && !currentElement.classList.contains(activeClass)) {
            Array.from(currentElement.parentNode?.children || []).forEach(row => {
                row.classList.remove(activeClass);
            });

            currentElement.classList.add(activeClass);
        }

        onClick?.(index);
    }

    const getField = (item: RecordProps, key: string) => {
        if (typeof item[key] === 'object' && !React.isValidElement(item[key]) && !Array.isArray(item[key])) {
            return "";
        }

        return item[key];
    }

    if (!Array.isArray(body)) {
        return <p className={"p-4"}><i className={"spinner-border spinner-border-sm"}></i> Caricamento in corso...</p>;
    } else if(body.length === 0) {
        return <p className={"p-4"}>Nessun dato trovato</p>;
    }

    // Estrai le chiavi dal primo oggetto nell'array per creare le intestazioni della tabella
    const headers = (header || Object.keys(body[0]).map(key => ({ key, label: key })));

    return (
        <div className={"table-responsive " + (wrapClass || theme.Table.wrapClass)}>
            <Wrapper className={scrollClass || theme.Table.scrollClass}>
                <div className={"fixed-table-container"}>
                    <table className={"table " + (tableClass || theme.Table.tableClass)}>
                        <thead className={headerClass || theme.Table.headerClass}>
                        <tr>
                            {headers.map((hdr) => (
                                hdr.label ? (
                                    <th key={hdr.key} className={hdr.className}>
                                        <div
                                            className={
                                                "th-inner" + (hdr.sort ? "pe-5 sortable both" : "")
                                            }
                                        >{hdr.label}</div>
                                    </th>
                                ) : (
                                    <th key={hdr.key} style={{ width: '1%', whiteSpace: 'nowrap' }}></th>
                                )
                            ))}
                        </tr>
                        </thead>
                        <tbody className={bodyClass || theme.Table.bodyClass}>
                            {body.map((record, index) => (
                                <tr
                                    key={index}
                                    style={{ cursor: onClick ? "pointer": "cursor" }}
                                    onClick={(e) => {
                                        onClick && handleClick(e, index);
                                    }}
                                >
                                    {headers.map((hdr) => (
                                        <td key={hdr.key}>{getField(record, hdr.key)}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                        {Footer && <tfoot className={footerClass || theme.Table.footerClass}>{Footer}</tfoot>}
                    </table>
                </div>
            </Wrapper>
        </div>
    );
}

export default Table;
