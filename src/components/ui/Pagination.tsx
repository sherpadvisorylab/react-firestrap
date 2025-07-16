import React, { useState } from 'react';
import { UIProps, Wrapper } from "../index";
import { RecordArray } from 'integrations/google/firedatabase';

export type PaginationParams = {
    page?: number;
    limit?: number;
    pagesDisplayed?: number;
};

interface PaginationProps extends UIProps, PaginationParams {
    recordSet: RecordArray | any[];
    children: any;
}

const Pagination = ({
    recordSet,
    children,
    limit               = undefined,
    page                = undefined,
    pagesDisplayed      = undefined,
    pre                 = undefined,
    post                = undefined,
    className           = undefined,
    wrapClass           = undefined
}: PaginationProps) => {
    const pageSize = limit || recordSet.length;
    const totalPages = Math.ceil(recordSet.length / pageSize);
    const numPagesDisplayed = pagesDisplayed || 5;

    const [currentPage, setCurrentPage] = useState(page || 1);
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;

    const pageRecords = recordSet.slice(start, end);

    const handlePage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const disabledPrev = currentPage === 1 ? 'disabled' : '';
    const disabledNext = currentPage === totalPages ? 'disabled' : '';

    const getPageRange = () => {
        const totalToShow = Math.min(numPagesDisplayed, totalPages);
        let startPage = Math.max(1, currentPage - Math.floor(totalToShow / 2));
        let endPage = startPage + totalToShow - 1;

        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - totalToShow + 1);
        }

        const range = [];
        for (let i = startPage; i <= endPage; i++) {
            range.push(i);
        }
        return range;
    };

    return (
        <Wrapper className={wrapClass}>
            {children(pageRecords)}
            {pre}
            {recordSet.length > pageSize && (
                <nav aria-label="Page navigation" className={className}>
                    <ul className="pagination justify-content-center">
                        <li className={`page-item ${disabledPrev}`}>
                            <button onClick={() => handlePage(1)} className="page-link">
                                <span aria-hidden="true">&laquo;</span>
                            </button>
                        </li>
                        <li className={`page-item ${disabledPrev}`}>
                            <button className="page-link" onClick={() => handlePage(currentPage - 1)}>
                                <span aria-hidden="true">&lsaquo;</span>
                            </button>
                        </li>

                        {getPageRange().map((pageNum) => (
                            <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                                <button onClick={() => handlePage(pageNum)} className="page-link">
                                    {pageNum}
                                </button>
                            </li>
                        ))}

                        <li className={`page-item ${disabledNext}`}>
                            <button className="page-link" onClick={() => handlePage(currentPage + 1)}>
                                <span aria-hidden="true">&rsaquo;</span>
                            </button>
                        </li>
                        <li className={`page-item ${disabledNext}`}>
                            <button onClick={() => handlePage(totalPages)} className="page-link">
                                <span aria-hidden="true">&raquo;</span>
                            </button>
                        </li>
                    </ul>
                </nav>
            )}
            {post}
        </Wrapper>
    );
};

export default Pagination;
