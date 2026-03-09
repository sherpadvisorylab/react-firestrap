import React, { useMemo, useState, useEffect } from 'react';
import { UIProps, Wrapper } from "../index";
import { createPortal } from 'react-dom';
import { useTheme } from '../../Theme';

export type PaginationParams = {
    page?: number;
    limit?: number;
    navLimit?: number;
    scrollToTopOnChange?: boolean;
    scrollBehavior?: ScrollBehavior;
    align?: "start" | "center" | "end";
    sticky?: boolean;
};

interface PaginationProps<T> extends UIProps, PaginationParams {
    recordSet: T[];
    children: (pageRecords: T[], pageOffset: number) => React.ReactNode;
    appendTo?: HTMLElement | null;
}

const Pagination = <T,>({
    recordSet,
    children,
    limit = undefined,
    page = undefined,
    navLimit = undefined,
    appendTo = undefined,
    pre = undefined,
    post = undefined,
    className = undefined,
    wrapClass = undefined,
    scrollToTopOnChange = undefined,
    scrollBehavior = undefined,
    align = undefined,
    sticky = undefined
}: PaginationProps<T>) => {
    const theme = useTheme("pagination");

    const [currentPage, setCurrentPage] = useState(page || 1);

    // ✅ sync se page cambia dall'esterno
   /* useEffect(() => {
        if (page && page !== currentPage) {
            setCurrentPage(page);
        }
    }, [page]);*/

    const pageLimit = limit || recordSet.length;
    const totalPages = Math.ceil(recordSet.length / pageLimit);

    const pageOffset = (currentPage - 1) * pageLimit;
    const end = pageOffset + pageLimit;

    const pageRecords = useMemo(
        () => recordSet.slice(pageOffset, end),
        [recordSet, pageOffset, end]
    );

    const go = (p: number) => {
        if (p >= 1 && p <= totalPages) {
            setCurrentPage(p);
        }
    };

    useEffect(() => {
        if (!(scrollToTopOnChange || theme.Pagination.scrollToTop)) return;

        window.scrollTo({
            top: 0,
            behavior: scrollBehavior || theme.Pagination.scrollBehavior
        });
    }, [currentPage, scrollToTopOnChange, scrollBehavior]);

    const range = useMemo(() => {
        const max = Math.min(navLimit || theme.Pagination.maxItems, totalPages);

        let s = Math.max(1, currentPage - Math.floor(max / 2));
        let e = s + max - 1;

        if (e > totalPages) {
            e = totalPages;
            s = Math.max(1, e - max + 1);
        }

        return Array.from({ length: e - s + 1 }, (_, i) => s + i);
    }, [currentPage, navLimit, totalPages]);

    const disabledPrev = currentPage === 1 ? 'disabled' : '';
    const disabledNext = currentPage === totalPages ? 'disabled' : '';

    const nav = (
        <Wrapper className={(wrapClass || theme.Pagination.wrapClass) + (sticky || theme.Pagination.sticky ? ` ${theme.Pagination.stickyClass}` : '')}
            style={sticky || theme.Pagination.sticky ? {backdropFilter: "blur(10px)", backgroundColor: "rgba(255, 255, 255, 0.1)"} : {}}
        >
            {pre}

            {recordSet.length > pageLimit && (
                <nav aria-label="Page navigation" className={className || theme.Pagination.className}>
                    <ul className={`pagination justify-content-${align || theme.Pagination.align} mx-auto`}>

                        <li className={`page-item ${disabledPrev}`}>
                            <button onClick={() => go(1)} className="page-link">
                                <span>&laquo;</span>
                            </button>
                        </li>

                        <li className={`page-item ${disabledPrev}`}>
                            <button
                                className="page-link"
                                onClick={() => go(currentPage - 1)}
                            >
                                <span>&lsaquo;</span>
                            </button>
                        </li>

                        {range.map((pageNum) => (
                            <li
                                key={pageNum}
                                className={`page-item ${currentPage === pageNum ? 'active' : ''}`}
                            >
                                <button
                                    onClick={() => go(pageNum)}
                                    className="page-link"
                                >
                                    {pageNum}
                                </button>
                            </li>
                        ))}

                        <li className={`page-item ${disabledNext}`}>
                            <button
                                className="page-link"
                                onClick={() => go(currentPage + 1)}
                            >
                                <span>&rsaquo;</span>
                            </button>
                        </li>

                        <li className={`page-item ${disabledNext}`}>
                            <button
                                onClick={() => go(totalPages)}
                                className="page-link"
                            >
                                <span>&raquo;</span>
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
            {children(pageRecords, pageOffset)}
            {appendTo
                ? createPortal(nav, appendTo)
                : appendTo === undefined && nav}
        </>
    );
};

export default Pagination;