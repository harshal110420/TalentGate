import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCareerApplication } from "../../../features/career_application/careerApplicationSlice";
import SkeletonPage from "../../../components/skeletons/skeletonPage";

const CareerApplication = () => {
  const dispatch = useDispatch();
  const { applications, pagination, loading, error } = useSelector(
    (state) => state.careerApplication
  );

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;

  // Format date
  const formatToIST = (utcString) => {
    if (!utcString) return "-";
    const date = new Date(utcString);
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: true,
    });
  };

  // 🔹 Fetch data from backend whenever page/search changes
  useEffect(() => {
    dispatch(
      fetchCareerApplication({ page: currentPage, limit: rowsPerPage, search })
    );
  }, [dispatch, currentPage, search]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-full px-5 py-5 font-sans text-gray-800 dark:text-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Career Applications
        </h1>
      </div>

      {/* Search Bar */}
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 mb-5 flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder="Search by name, email, mobile..."
          value={search}
          onChange={(e) => {
            setCurrentPage(1); // reset to page 1 when search changes
            setSearch(e.target.value);
          }}
          className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm flex-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-gray-900">
        <table className="min-w-[1000px] w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase tracking-wide text-[11px] font-medium">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Mobile</th>
              <th className="px-4 py-3 text-left">Resume</th>
              <th className="px-4 py-3 text-left">Applied On</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-950">
            {loading ? (
              <SkeletonPage rows={4} columns={7} />
            ) : error ? (
              <tr>
                <td colSpan="7" className="text-center py-4 text-red-500">
                  {error}
                </td>
              </tr>
            ) : !applications.length ? (
              <tr>
                <td colSpan="7" className="text-center py-5 text-gray-500">
                  No career applications found.
                </td>
              </tr>
            ) : (
              applications.map((app, idx) => (
                <tr
                  key={app.id}
                  className={`transition-colors duration-150 ${
                    idx % 2 === 0
                      ? "bg-white dark:bg-gray-900"
                      : "bg-gray-50 dark:bg-gray-800"
                  } hover:bg-blue-50 dark:hover:bg-gray-700`}
                >
                  <td className="px-4 py-2 text-[14px] font-medium">
                    {app.fullName || "-"}
                  </td>
                  <td className="px-4 py-2">{app.email || "-"}</td>
                  <td className="px-4 py-2">{app.phone || "-"}</td>
                  <td className="px-4 py-2">
                    {app.resume ? (
                      <a
                        href={app.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Resume
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-2">{formatToIST(app.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-3 py-1.5 border rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            Prev
          </button>

          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={`px-3 py-1.5 border rounded-md text-sm font-medium transition ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white border-blue-600"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === pagination.totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-3 py-1.5 border rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CareerApplication;
