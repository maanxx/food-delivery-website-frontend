import React, { useMemo } from 'react';
import classNames from 'classnames/bind';
import styles from './Pagination.module.css';

const cx = classNames.bind(styles);

const DOTS = '...';

/**
 * Modern Pagination component with ShopeeFood style and ellipsis logic.
 * Props:
 * - currentPage: Number (1-indexed)
 * - totalPages: Number
 * - onPageChange: Function (receives page number)
 */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  
  const paginationRange = useMemo(() => {
    const totalPageNumbers = 6; // Adjusted to show enough context

    // 1. If total pages is less than the numbers we want to show
    if (totalPages <= totalPageNumbers + 1) {
      return Array.from({ length: totalPages }, (_, idx) => idx + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - 1, 1);
    const rightSiblingIndex = Math.min(currentPage + 1, totalPages);

    /*
      We do not show dots just when there is only one page number to be inserted between the sibling and the bound.
      (e.g., 1 ... 3 4 5) is better as (1 2 3 4 5)
    */
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    // Case 2: No left dots to show, but right dots are needed
    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftItemCount = 3 + 1;
      let leftRange = Array.from({ length: leftItemCount }, (_, idx) => idx + 1);
      return [...leftRange, DOTS, totalPages];
    }

    // Case 3: No right dots to show, but left dots are needed
    if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightItemCount = 3 + 1;
      let rightRange = Array.from(
        { length: rightItemCount },
        (_, idx) => totalPages - rightItemCount + idx + 1
      );
      return [firstPageIndex, DOTS, ...rightRange];
    }

    // Case 4: Both left and right dots to be shown
    if (shouldShowLeftDots && shouldShowRightDots) {
      let middleRange = [leftSiblingIndex, currentPage, rightSiblingIndex];
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }

    return [];
  }, [totalPages, currentPage]);

  if (currentPage === 0 || paginationRange.length < 2) {
    return null;
  }

  const onNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const onPrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  return (
    <ul className={cx('container')}>
      {/* Previous Button */}
      <li className={cx('item')}>
        <button
          className={cx('button')}
          disabled={currentPage === 1}
          onClick={onPrevious}
          aria-label="Previous Page"
        >
          <span className={cx('arrow')}>«</span>
        </button>
      </li>

      {/* Page Numbers */}
      {paginationRange.map((pageNumber, index) => {
        if (pageNumber === DOTS) {
          return (
            <li key={`dots-${index}`} className={cx('ellipsis')}>
              {DOTS}
            </li>
          );
        }

        return (
          <li key={pageNumber} className={cx('item')}>
            <button
              className={cx('button', { active: pageNumber === currentPage })}
              onClick={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </button>
          </li>
        );
      })}

      {/* Next Button */}
      <li className={cx('item')}>
        <button
          className={cx('button')}
          disabled={currentPage === totalPages}
          onClick={onNext}
          aria-label="Next Page"
        >
          <span className={cx('arrow')}>»</span>
        </button>
      </li>
    </ul>
  );
};

export default Pagination;
