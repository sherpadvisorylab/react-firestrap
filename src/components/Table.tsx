import React from 'react';
import {useTheme} from "../Theme";
import {Wrapper} from "./GridSystem";

export type TableHeaderProp = {
    key: string,
    label: string,
    className?: string,
    sort?: boolean
};

type TableProps = {
    header: TableHeaderProp[],
    body: { key: string, [key: string]: any }[],
    Footer?: string | React.ReactNode,
    onClick?: (key: string) => void,
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
                   body,
                   Footer           = null,
                   onClick          = null,
                   wrapClass        = "",
                   scrollClass      = "",
                   tableClass       = "",
                   headerClass      = "",
                   bodyClass        = "",
                   footerClass      = "",
                   selectedClass    = ""
} : TableProps) {
    const theme = useTheme();
    selectedClass = selectedClass || theme.Table.selectedClass;

    if (!Array.isArray(body)) {
        return <p className={"p-4"}><i className={"spinner-border spinner-border-sm"}></i> Caricamento in corso...</p>;
    } else if(body.length === 0) {
        return <p className={"p-4"}>Nessun dato trovato</p>;
    }

    // Estrai le chiavi dal primo oggetto nell'array per creare le intestazioni della tabella
    const headers = (header || Object.keys(body[0]).map(key => ({ key, label: key })));
    const handleClick = (key, e) => {
        let currentElement = e.target;

        while (currentElement && currentElement.tagName !== 'TR') {
            if (currentElement.tagName === 'A' || currentElement.tagName === 'BUTTON' ) {
                return;
            }
            currentElement = currentElement.parentNode;
        }

        if (selectedClass && !currentElement.classList.contains(selectedClass)) {
            Array.from(currentElement.parentNode.children).forEach(row => {
                row.classList.remove(selectedClass);
            });

            currentElement.classList.add(selectedClass);
        }

        onClick && onClick(key);
    }

    const getField = (item, key) => {
        if (typeof item[key] === 'object' && !React.isValidElement(item[key]) && !Array.isArray(item[key])) {
            return "";
        }

        return item[key];
    }

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
                            {body.map((item, index) => (
                                <tr
                                    key={index}
                                    style={{ cursor: onClick ? "pointer": "cursor" }}
                                    onClick={(e) => {
                                        onClick && handleClick(item.key, e);
                                    }}
                                >
                                    {headers.map((hdr) => (
                                        <td key={hdr.key}>{getField(item, hdr.key)}</td>
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
