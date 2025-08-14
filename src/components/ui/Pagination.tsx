import React, { useMemo, useState } from 'react';
import { UIProps, Wrapper } from "../index";
import { RecordArray } from 'integrations/google/firedatabase';
import { createPortal } from 'react-dom';

export type PaginationParams = {
    page?: number;
    limit?: number;
    navLimit?: number;
};

interface PaginationProps extends UIProps, PaginationParams {
    recordSet: RecordArray | any[];
    children: any;
    appendTo?: HTMLElement | null;
}

const Pagination = ({
    recordSet,
    children,
    limit               = undefined,
    page                = undefined,
    navLimit            = undefined,
    appendTo            = undefined,
    pre                 = undefined,
    post                = undefined,
    className           = undefined,
    wrapClass           = undefined
}: PaginationProps) => {
    const NAV_LIMIT_DEFAULT = 5;
    const [currentPage, setCurrentPage] = useState(page || 1);

    const pageLimit = limit || recordSet.length;
    const totalPages = Math.ceil(recordSet.length / pageLimit);

    const start = (currentPage - 1) * pageLimit;
    const end = start + pageLimit;
    const pageRecords = useMemo(() => recordSet.slice(start, end), [recordSet, start, end]);

    const go = (p: number) => p >= 1 && p <= totalPages && setCurrentPage(p);

    const range = useMemo(() => {
        const max = Math.min(navLimit || NAV_LIMIT_DEFAULT, totalPages);
        let s = Math.max(1, currentPage - Math.floor(max / 2));
        let e = s + max - 1;
        if (e > totalPages) { e = totalPages; s = Math.max(1, e - max + 1); }
        return Array.from({ length: e - s + 1 }, (_, i) => s + i);
      }, [currentPage, navLimit, totalPages]);

    const disabledPrev = currentPage === 1 ? 'disabled' : '';
    const disabledNext = currentPage === totalPages ? 'disabled' : '';

    const nav = (
        <Wrapper className={wrapClass}>
            {pre}
            {recordSet.length > pageLimit && (
                <nav aria-label="Page navigation" className={className}>
                    <ul className="pagination justify-content-center">
                        <li className={`page-item ${disabledPrev}`}>
                            <button onClick={() => go(1)} className="page-link">
                                <span aria-hidden="true">&laquo;</span>
                            </button>
                        </li>
                        <li className={`page-item ${disabledPrev}`}>
                            <button className="page-link" onClick={() => go(currentPage - 1)}>
                                <span aria-hidden="true">&lsaquo;</span>
                            </button>
                        </li>

                        {range.map((pageNum) => (
                            <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                                <button onClick={() => go(pageNum)} className="page-link">
                                    {pageNum}
                                </button>
                            </li>
                        ))}

                        <li className={`page-item ${disabledNext}`}>
                            <button className="page-link" onClick={() => go(currentPage + 1)}>
                                <span aria-hidden="true">&rsaquo;</span>
                            </button>
                        </li>
                        <li className={`page-item ${disabledNext}`}>
                            <button onClick={() => go(totalPages)} className="page-link">
                                <span aria-hidden="true">&raquo;</span>
                            </button>
                        </li>
                    </ul>
                </nav>
            )}
            {post}
        </Wrapper>
    );

    return (
        <>
          {children(pageRecords)}
          {appendTo ? createPortal(nav, appendTo) : appendTo === undefined && nav}
        </>
      );
};

export default Pagination;
