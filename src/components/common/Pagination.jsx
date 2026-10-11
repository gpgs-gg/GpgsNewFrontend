// const Pagination = ({
//   currentPage,
//   totalPages,
//   onPageChange,
// }) => {
//   const getPages = () => {
//     if (totalPages <= 5) {
//       return Array.from(
//         { length: totalPages },
//         (_, i) => i + 1
//       );
//     }

//     if (currentPage <= 3) {
//       return [1, 2, 3, 4, "...", totalPages];
//     }

//     if (currentPage >= totalPages - 2) {
//       return [
//         1,
//         "...",
//         totalPages - 3,
//         totalPages - 2,
//         totalPages - 1,
//         totalPages,
//       ];
//     }

//     return [
//       1,
//       "...",
//       currentPage - 1,
//       currentPage,
//       currentPage + 1,
//       "...",
//       totalPages,
//     ];
//   };

//   return (
//     <div className="flex items-center gap-2 flex-wrap">
//       {/* Previous */}
//       <button
//         disabled={currentPage === 1}
//         onClick={() => onPageChange(currentPage - 1)}
//         className="
//           px-4 py-2
//           border border-gray-300
//           rounded-lg
//           bg-white
//           hover:bg-gray-100
//           disabled:opacity-50
//           disabled:cursor-not-allowed
//         "
//       >
//         Previous
//       </button>

//       {/* Page Numbers */}
//       {getPages().map((page, index) =>
//         page === "..." ? (
//           <span
//             key={index}
//             className="px-2 text-gray-500"
//           >
//             ...
//           </span>
//         ) : (
//           <button
//             key={index}
//             onClick={() => onPageChange(page)}
//             className={`
//               min-w-10
//               h-10
//               px-3
//               rounded-lg
//               transition
//               ${
//                 currentPage === page
//                   ? "bg-gray-600 text-white"
//                   : "border border-gray-300 bg-white hover:bg-gray-100"
//               }
//             `}
//           >
//             {page}
//           </button>
//         )
//       )}

//       {/* Next */}
//       <button
//         disabled={currentPage === totalPages}
//         onClick={() => onPageChange(currentPage + 1)}
//         className="
//           px-4 py-2
//           border border-gray-300
//           rounded-lg
//           theme-btn
//           hover:theme-btn
//           disabled:opacity-50
//           disabled:cursor-not-allowed
//         "
//       >
//         Next
//       </button>
//     </div>
//   );
// };

// export default Pagination;

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const getPages = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-1.5 sm:gap-2 lg:w-auto lg:justify-start">

      {/* PREVIOUS */}
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="
          rounded-lg border border-gray-300 bg-white
          px-2.5 py-2 text-xs
          hover:bg-gray-100
          disabled:cursor-not-allowed disabled:opacity-50
          sm:px-4 sm:py-2 sm:text-sm
        "
      >
        <span className="sm:hidden">Prev</span>
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* PAGE NUMBERS */}
      {getPages().map((page, index) =>
        page === "..." ? (
          <span
            key={`dots-${index}`}
            className="px-0.5 text-xs text-gray-500 sm:px-2 sm:text-sm"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={currentPage === page ? "page" : undefined}
            className={`
              flex h-8 min-w-8 items-center justify-center
              rounded-lg px-2 text-xs transition
              sm:h-10 sm:min-w-10 sm:px-3 sm:text-sm
              ${
                currentPage === page
                  ? "bg-gray-600 text-white"
                  : "border border-gray-300 bg-white hover:bg-gray-100"
              }
            `}
          >
            {page}
          </button>
        )
      )}

      {/* NEXT */}
      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="
          rounded-lg border border-gray-300
          theme-btn px-2.5 py-2 text-xs
          hover:theme-btn
          disabled:cursor-not-allowed disabled:opacity-50
          sm:px-4 sm:py-2 sm:text-sm
        "
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
