import { Eye, Pencil } from "lucide-react";

const Beds = () => {
  
  const beds = Array.from({ length: 25 }, (_, index) => ({
    id: index + 1,
    bedNo: `BED${String(index + 1).padStart(3, "0")}`,
    property: [
      "GPGS Koparkhairane",
      "GPGS Ghansoli",
      "GPGS Airoli",
      "GPGS Vashi",
    ][index % 4],
    roomNo: `${100 + index}`,
    sharing: ["2 Sharing", "3 Sharing", "4 Sharing"][index % 3],
    occupant:
      index % 4 === 0 ? "-" : `Tenant ${index + 1}`,
    status:
      index % 4 === 0 ? "Available" : "Occupied",
  }));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">
              Beds Master
            </h1>
            <p className="text-sm text-gray-500">
              Manage all property beds
            </p>
          </div>

          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg">
            + Add Bed
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b flex justify-between">
          <input
            type="text"
            placeholder="Search Bed..."
            className="border rounded-lg px-4 py-2 w-80"
          />

          <span className="text-gray-500">
            Total Beds:
            <strong className="ml-2">
              {beds.length}
            </strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-5 py-4 text-left">
                  Bed No
                </th>
                <th className="px-5 py-4 text-left">
                  Property
                </th>
                <th className="px-5 py-4 text-left">
                  Room No
                </th>
                <th className="px-5 py-4 text-left">
                  Sharing
                </th>
                <th className="px-5 py-4 text-left">
                  Occupant
                </th>
                <th className="px-5 py-4 text-center">
                  Status
                </th>
                <th className="px-5 py-4 text-center">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {beds.map((bed) => (
                <tr
                  key={bed.id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="px-5 py-4 font-medium">
                    {bed.bedNo}
                  </td>

                  <td className="px-5 py-4">
                    {bed.property}
                  </td>

                  <td className="px-5 py-4">
                    {bed.roomNo}
                  </td>

                  <td className="px-5 py-4">
                    {bed.sharing}
                  </td>

                  <td className="px-5 py-4">
                    {bed.occupant}
                  </td>

                  <td className="px-5 py-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        bed.status === "Available"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {bed.status}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-center gap-2">
                      <button className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <Eye size={18} />
                      </button>

                      <button className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                        <Pencil size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t px-5 py-3 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Showing 1 - 25 entries
          </span>

          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded-lg">
              Previous
            </button>

            <button className="px-3 py-1 bg-blue-600 text-white rounded-lg">
              1
            </button>

            <button className="px-3 py-1 border rounded-lg">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Beds;