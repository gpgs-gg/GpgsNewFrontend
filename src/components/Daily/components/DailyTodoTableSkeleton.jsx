import { Skelton } from "../../common/DailySkeleton";

const SkeletonBlock = ({ w = "100%", h = "16px" }) => (
  <div
    className="bg-gray-200 rounded animate-pulse"
    style={{ width: w, height: h }}
  />
);

export default function DailyTodoTableSkeleton() {
  return (
    <div className="min-h-screen w-auto bg-gray-50 pt-24 my-2">
      {/* HEADER */}
      <div className="flex flex-wrap md:items-center md:justify-between mx-2 mb-4">
        <div className="px-5 space-y-2">
          <SkeletonBlock w="240px" h="24px" />
        </div>

        <div className="flex gap-4 px-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} w="120px" h="32px" />
          ))}
        </div>

        <div className="flex gap-3 px-8">
          <SkeletonBlock w="140px" h="32px" />
          <SkeletonBlock w="100px" h="32px" />
        </div>
      </div>

      {/* TABLE */}
      <Skelton />
    </div>
  );
}
