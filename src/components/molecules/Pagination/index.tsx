import React from "react";
import _ from "lodash";

import "./index.scss";

interface PaginationProps {
    currentPage: number;
    pageCount: number;
    onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    pageCount,
    onPageChange,
}) => {
    const generatePageNumbers = (page: number, pageCount: number) => {
        const DOTS = "...";
        const siblingCount = 2;
        const totalPageCount = pageCount;
        const totalPageNumbers = siblingCount + 5;

        if (totalPageNumbers >= totalPageCount) {
            return _.range(1, totalPageCount + 1);
        }

        const leftSiblingIndex = Math.max(page - siblingCount, 1);
        const rightSiblingIndex = Math.min(page + siblingCount, totalPageCount);

        const shouldShowLeftDots = leftSiblingIndex > 2;
        const shouldShowRightDots = rightSiblingIndex < totalPageCount - 1;

        const firstPageIndex = 1;
        const lastPageIndex = totalPageCount;

        if (!shouldShowLeftDots && shouldShowRightDots) {
            let leftItemCount = 3 + 2 * siblingCount;
            let leftRange = _.range(1, leftItemCount + 1);
            return [...leftRange, DOTS, lastPageIndex];
        }

        if (shouldShowLeftDots && !shouldShowRightDots) {
            let rightItemCount = 3 + 2 * siblingCount;
            let rightRange = _.range(totalPageCount - rightItemCount + 1, totalPageCount + 1);
            return [firstPageIndex, DOTS, ...rightRange];
        }

        if (shouldShowLeftDots && shouldShowRightDots) {
            let middleRange = _.range(leftSiblingIndex, rightSiblingIndex + 1);
            return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
        }

        return [];
    };

    return (
            
            <nav className="vf-pagination" aria-label="Pagination">
                <ul className="vf-pagination__list">
                    <li className="vf-pagination__item">
                        <a
                            className={`vf-pagination__link ${currentPage === 1 ? "disabled" : ""}`}
                            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        >
                            Previous
                        </a>
                    </li>
                    {generatePageNumbers(currentPage, pageCount).map((page, index) => (
                        <li
                            key={index}
                            className={`vf-pagination__item ${currentPage === page ? "vf-pagination__item--is-active" : ""}`}
                        >
                            {typeof page === "number" ? (
                                currentPage === page ? (
                                    <span className="vf-pagination__label" aria-current="page">
                                        <span className="vf-u-sr-only">Page </span>
                                        {page}
                                    </span>
                                ) : (
                                    <a className="vf-pagination__link" onClick={() => onPageChange(page)}>
                                        {page}
                                        <span className="vf-u-sr-only"> page</span>
                                    </a>
                                )
                            ) : (
                                <span className="vf-pagination__label">{page}</span>
                            )}
                        </li>
                    ))}
                    <li className="vf-pagination__item">
                        <a
                            className={`vf-pagination__link ${currentPage === pageCount ? "disabled" : ""}`}
                            onClick={() => onPageChange(Math.min(pageCount, currentPage + 1))}
                        >
                            Next
                        </a>
                    </li>
                </ul>
            </nav>
    );
};
