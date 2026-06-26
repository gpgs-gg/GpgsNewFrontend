import { SearchX } from "lucide-react";

const NoDataFound = ({
  title = "No Data Found",
  description = "No records available to display.",
}) => {
  return (
    <div className="flex flex-col items-center  justify-center py-16">
      <div className="bg-gray-100 p-4 rounded-full">
        <SearchX
          size={50}
          className="text-gray-400"
        />
      </div>

      <h3 className="mt-4 text-lg font-semibold text-gray-700">
        {title}
      </h3>

      <p className="mt-1 text-sm text-gray-500 text-center">
        {description}
      </p>
    </div>
  );
};

export default NoDataFound;