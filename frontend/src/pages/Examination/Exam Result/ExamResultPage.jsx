import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchExamResultsGrouped } from "../../../features/Exams/examResultSlice";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import SkeletonPage from "../../../components/skeletons/skeletonPage";
import { getModulePathByMenu } from "../../../utils/navigation";

const ExamResultsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { groupedList, loading, error } = useSelector(
    (state) => state.examResult
  );
  const modules = useSelector((state) => state.modules.list);
  const menu = useSelector((state) => state.menus.list);
  const modulePath = getModulePathByMenu("exam_results", modules, menu);

  const [filters, setFilters] = useState({
    search: "",
    department: "all",
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;

  // Fetch exam results on load
  useEffect(() => {
    dispatch(fetchExamResultsGrouped());
  }, [dispatch]);

  // Extract unique departments for dropdown
  const departments = useMemo(() => {
    const unique = new Set();
    groupedList?.forEach((c) => {
      if (c.candidateDepartment) unique.add(c.candidateDepartment);
    });
    return ["all", ...Array.from(unique)];
  }, [groupedList]);

  // Filtered data with search and department
  const filteredData = useMemo(() => {
    let data = groupedList || [];
    if (filters.department !== "all") {
      data = data.filter((c) => c.candidateDepartment === filters.department);
    }
    if (filters.search.trim()) {
      const term = filters.search.toLowerCase();
      data = data.filter(
        (c) =>
          c.candidateName.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term)
      );
    }
    return data;
  }, [groupedList, filters]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentExamResults = filteredData.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-full px-5 py-5 font-sans text-gray-800 dark:text-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Exam Results
        </h1>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 mb-5 flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder="Search by candidate name or email..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm flex-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800"
        />
        <select
          value={filters.department}
          onChange={(e) =>
            setFilters({ ...filters, department: e.target.value })
          }
          className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm flex-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800"
        >
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept === "all" ? "All Departments" : dept}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-gray-900">
        <table className="min-w-[1100px] w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase tracking-wide text-[11px] font-medium">
            <tr>
              <th className="px-4 py-2 text-left">Candidate</th>
              <th className="px-4 py-2 text-left">Department</th>
              <th className="px-4 py-2 text-center">Total Exams</th>
              <th className="px-4 py-3 text-center sticky right-0 bg-gray-100 dark:bg-gray-800 border-l">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-950">
            {loading ? (
              <SkeletonPage rows={10} columns={4} />
            ) : error ? (
              <tr>
                <td colSpan="10" className="text-center py-4 text-red-500">
                  {error}
                </td>
              </tr>
            ) : !currentExamResults.length ? (
              <tr>
                <td colSpan="10" className="text-center py-5 text-gray-500">
                  No results found.
                </td>
              </tr>
            ) : (
              currentExamResults.map((res, idx) => (
                <tr
                  key={res.candidateId}
                  className={`transition-colors duration-150 ${
                    idx % 2 === 0
                      ? "bg-white dark:bg-gray-900"
                      : "bg-gray-50 dark:bg-gray-800"
                  } hover:bg-blue-50 dark:hover:bg-gray-700`}
                >
                  <td className="px-4 py-2 text-[14px] font-medium">
                    {res.candidateName}
                  </td>
                  <td className="px-4 py-2">
                    {res.candidateDepartment || "-"}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {res.exams?.length || 0}
                  </td>
                  <td className="px-4 py-2 text-center sticky right-0 bg-gray-50 dark:bg-gray-800 border-l">
                    <button
                      onClick={() =>
                        navigate(
                          `/module/${modulePath}/exam_results/${res.candidateId}`
                        )
                      }
                      className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition"
                      title="Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-3 py-1.5 border rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
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
            disabled={currentPage === totalPages}
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

export default ExamResultsPage;
