export const Skelton = () => {
  return (
    <div className="mx-6 my-6 animate-pulse">
      {/* TABLE SKELETON */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* TABLE HEADER */}
        <div className="flex bg-gray-200 px-4 py-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="h-6 bg-gray-300 rounded mx-2"
              style={{ width: i === 0 ? 80 : 150 }}
            />
          ))}
        </div>

        {/* TABLE ROWS */}
        <div className="max-h-[74vh] overflow-auto w-full">
          {Array.from({ length: 13 }).map((_, rowIdx) => (
            <div key={rowIdx} className="flex items-center px-4 py-4 border-b">
              {Array.from({ length: 13 }).map((_, colIdx) => (
                <div
                  key={colIdx}
                  className="h-5 bg-gray-200 rounded mx-2"
                  style={{ width: colIdx === 0 ? 60 : 140 }}
                />
              ))}

              {/* ACTIONS */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};