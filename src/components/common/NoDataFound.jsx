
import { SearchX, RotateCcw, Users } from "lucide-react";

const NoDataFound = ({ onReset, title, message }) => {
  return (
    <div className="flex min-h-[420px] w-full items-center justify-center rounded-2xl  bg-white px-6 py-12">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        {/* Icon */}
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-50 ring-8 ring-slate-50/50">
          <SearchX className="h-10 w-10 text-slate-600" strokeWidth={1.6} />
        </div>

        {/* Heading */}
        <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          {title || "No Results Found"}
        </h2>

        {/* Description */}
        <p className="mt-3 max-w-sm text-sm leading-6 text-gray-500">
          {message}
        </p>

        {/* Helpful hint */}
        <div className="mt-5 flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-3 text-left">
          <Users className="h-4 w-4 shrink-0 text-gray-400" />
          <span className="text-xs text-gray-600">
            Try using a different keyword or removing some filters.
          </span>
        </div>

        {/* Reset Button */}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
          >
            <RotateCcw className="h-4 w-4" />
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default NoDataFound;