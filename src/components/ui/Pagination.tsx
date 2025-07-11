import React, { Children, useState } from 'react';
import { UIProps, Wrapper } from "../index";
import { RecordArray } from 'integrations/google/firedatabase';

interface PaginationProps extends UIProps {
    recordSet: RecordArray | any[];
    children: any;
    limit?: number;
    page?: number;
}

const Pagination = ({
    recordSet,
    children,
    limit = 100,
    page = 1,
    pre = undefined,
    post = undefined,
    className = undefined,
    wrapClass = undefined,
}: PaginationProps) => {

    const totalPages = Math.ceil(recordSet.length / limit);

    const [currentPage, setCurrentPage] = useState(page);
    const start = (currentPage - 1) * limit;
    const end = start + limit;

    const pageRecords = recordSet.slice(start, end)

    const handlePage = (page: number) => {
        if (page >= 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    }

    const disabledPrev = currentPage === 1 ? 'disabled' : '';
    const disabledNext = currentPage === totalPages ? 'disabled' : '';

    return (
        <Wrapper className={wrapClass}>
            {children(pageRecords)}
            {pre}
            <nav aria-label="Page navigation example" className={className}>
                <ul className="pagination justify-content-center">
                    <li className={`page-item ${disabledPrev}`}>
                        <button onClick={() => handlePage(1)} className="page-link">
                            <span aria-hidden="true">&laquo;</span>
                        </button>
                    </li>
                    <li className={`page-item ${disabledPrev}`}>
                        <button className="page-link" aria-label="Previous" onClick={() => handlePage(currentPage - 1)}>
                            <span aria-hidden="true">&lsaquo;</span>
                        </button>
                    </li>

                    {currentPage > 1 && (
                        <li className="page-item">
                            <button onClick={() => handlePage(currentPage - 1)} className="page-link">{currentPage - 1}</button>
                        </li>
                    )}
                    <li className="page-item active">
                        <button className="page-link">{currentPage}</button>
                    </li>
                    {currentPage < totalPages && (
                        <li className="page-item">
                            <button onClick={() => handlePage(currentPage + 1)} className="page-link">{currentPage + 1}</button>
                        </li>
                    )}

                    <li className={`page-item ${disabledNext}`}>
                        <button className="page-link" aria-label="Next" onClick={() => handlePage(currentPage + 1)}>
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
            {post}
        </Wrapper>
    )
}

export default Pagination;