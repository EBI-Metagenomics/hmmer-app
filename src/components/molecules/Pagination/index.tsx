import React from "react";
import _ from "lodash";
import { Table } from "@tanstack/react-table";

import "./index.scss";

interface PaginationProps {
    tableInstance: Table<any>;
    pageSizeOptions: number[];
}

export const Pagination: React.FC<PaginationProps> = ({
    tableInstance,
    pageSizeOptions,
}) => {
    const { getState, setPageSize, setPageIndex, getPageCount } = tableInstance;

    const { pageIndex, pageSize } = getState().pagination;
    const pageCount = getPageCount();

    const generatePageNumbers = () => {
        const DOTS = "...";
        const siblingCount = 2;
        const totalPageCount = pageCount;
        const totalPageNumbers = siblingCount + 5;

        if (totalPageNumbers >= totalPageCount) {
            return _.range(0, totalPageCount);
        }

        const leftSiblingIndex = Math.max(pageIndex - siblingCount, 0);
        const rightSiblingIndex = Math.min(pageIndex + siblingCount, totalPageCount - 1);

        const shouldShowLeftDots = leftSiblingIndex > 1;
        const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2;

        const firstPageIndex = 0;
        const lastPageIndex = totalPageCount - 1;

        if (!shouldShowLeftDots && shouldShowRightDots) {
            let leftItemCount = 3 + 2 * siblingCount;
            let leftRange = _.range(0, leftItemCount);
            return [...leftRange, DOTS, lastPageIndex];
        }

        if (shouldShowLeftDots && !shouldShowRightDots) {
            let rightItemCount = 3 + 2 * siblingCount;
            let rightRange = _.range(totalPageCount - rightItemCount, totalPageCount);
            return [firstPageIndex, DOTS, ...rightRange];
        }

        if (shouldShowLeftDots && shouldShowRightDots) {
            let middleRange = _.range(leftSiblingIndex, rightSiblingIndex + 1);
            return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
        }

        return [];
    };

    return (
        <div className="vf-cluster vf-cluster--800">
            <div className="vf-cluster__inner">
                <div className="page-size-container">
                    <div><span>Page Size</span></div>
                    <select
                        id="pageSize"
                        className="vf-form__select"
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                    >
                        {pageSizeOptions.map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                </div>
                <nav className="vf-pagination" aria-label="Pagination">
                    <ul className="vf-pagination__list">
                        <li className="vf-pagination__item">
                            <a
                                className={`vf-pagination__link ${pageIndex === 0 ? "disabled" : ""}`}
                                onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
                            >
                                Previous
                            </a>
                        </li>
                        {generatePageNumbers().map((page, index) => (
                            <li
                                key={index}
                                className={`vf-pagination__item ${pageIndex === page ? "vf-pagination__item--is-active" : ""}`}
                            >
                                {typeof page === "number" ? (
                                    pageIndex === page ? (
                                        <span className="vf-pagination__label" aria-current="page">
                                            <span className="vf-u-sr-only">Page </span>
                                            {page + 1}
                                        </span>
                                    ) : (
                                        <a
                                            className="vf-pagination__link"
                                            onClick={() => setPageIndex(page)}
                                        >
                                            {page + 1}
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
                                className={`vf-pagination__link ${pageIndex === pageCount - 1 ? "disabled" : ""}`}
                                onClick={() => setPageIndex(Math.min(pageCount - 1, pageIndex + 1))}
                            >
                                Next
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );
};
