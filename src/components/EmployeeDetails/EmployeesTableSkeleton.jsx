export const EmployeesTableSkeleton = () => {
  return (
    <div className="max-w-full mx-auto mt-3 p-2 bg-gray-50 rounded-lg shadow-md animate-pulse">
      
      {/* ===== FILTER BAR SKELETON ===== */}
      {/* <div className="flex flex-wrap gap-3 mb-4 justify-center">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-32 bg-gray-200 rounded-xl"
          />
        ))}
      </div> */}

      {/* ===== TABLE SKELETON ===== */}
      <div className="overflow-hidden bg-white rounded-lg shadow">
        <table className="min-w-full border">
          <thead className="bg-gray-600">
            <tr>
              {Array.from({ length: 12 }).map((_, i) => (
                <th key={i} className="p-4">
                  <div className="h-4 bg-white rounded" />
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: 7 }).map((_, row) => (
              <tr key={row} className="border-b">
                {Array.from({ length: 12 }).map((_, col) => (
                  <td key={col} className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== PAGINATION SKELETON ===== */}
      <div className="flex justify-center gap-4 mt-5">
        <div className="h-8 w-24 bg-gray-400 rounded" />
        <div className="h-8 w-24 bg-gray-400 rounded" />
      </div>
    </div>
  );
};

export const SearchSkeleton = () => {
  return (

    
      <div className="bg-white shadow-sm py-5 rounded-b-lg px-10 max-w-8xl w-full animate-pulse">

        <div className="flex justify-end md:px-2 gap-5 mr-5 items-center animate-pulse">
          <div className="flex items-center gap-6">
            {/* Active Skeleton */}
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-300"></div>
              <div className="h-5 w-16 bg-gray-300 rounded"></div>
            </div>
            {/* Not Active Skeleton */}
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-300"></div>
              <div className="h-5 w-24 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-5 pt-2">
          {Array.from({ length: 2}).map((_, idx) => (
            <div key={idx} className="flex flex-col gap-2">
            
            {/* Label Skeleton */}
            <div className="h-4 w-24 bg-gray-200 rounded relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer"></div>
            </div>

            {/* Input / Select Box Skeleton */}
            <div className="h-10 bg-gray-200 rounded-md relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer"></div>
            </div>

          </div>
          ))}
        </div>
      </div>
    );
};

export const DashboardSkeleton = () => {
  const CardSkeleton = () => (
    <div className="bg-white rounded-xl shadow p-5 border-l-4 border-gray-200 animate-pulse">
      <div className="h-4 w-24 bg-gray-200 rounded"></div>
      <div className="h-8 w-20 bg-gray-300 rounded mt-3"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white space-y-6">
      {/* HEADER */}
      {/* <div className="space-y-2 animate-pulse">
        <div className="h-6 w-64 bg-gray-300 rounded"></div>
        <div className="h-4 w-80 bg-gray-200 rounded"></div>
      </div> */}

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {Array.from({ length: 7 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};