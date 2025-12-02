import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchExams } from "../../../features/Exams/examSlice";
import { fetchAllDepartments } from "../../../features/department/departmentSlice";
import { fetchAllLevels } from "../../../features/level/levelSlice";
import SkeletonPage from "../../../components/skeletons/skeletonPage";
import { getModulePathByMenu } from "../../../utils/navigation";
import ButtonWrapper from "../../../components/ButtonWrapper";
import { PlusCircle, Eye, Pencil } from "lucide-react";

const ITEMS_PER_PAGE = 10; // 👈 change as needed

const ExamPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list: exams = [], loading, error } = useSelector((s) => s.exam);
  const { list: departments = [] } = useSelector((s) => s.department);
  const { list: levels = [] } = useSelector((s) => s.level);
  const modules = useSelector((s) => s.modules.list);
  const menus = useSelector((s) => s.menus.list);

  const modulePath = getModulePathByMenu("exam_management", modules, menus);

  const [filters, setFilters] = useState({
    search: "",
    departmentId: "",
    levelId: "",
    status: "all",
  });

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchAllDepartments());
    dispatch(fetchAllLevels());
    dispatch(fetchExams());
  }, [dispatch]);

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchSearch = exam.name
        .toLowerCase()
        .includes(filters.search.toLowerCase());
      const matchDept = filters.departmentId
        ? String(exam.department?.id) === filters.departmentId
        : true;
      const matchLevel = filters.levelId
        ? String(exam.level?.id) === filters.levelId
        : true;
      const matchStatus =
        filters.status === "all"
          ? true
          : filters.status === "true"
            ? exam.isActive
            : !exam.isActive;
      return matchSearch && matchDept && matchLevel && matchStatus;
    });
  }, [exams, filters]);

  // Pagination logic
  const totalPages = Math.ceil(filteredExams.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedExams = filteredExams.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading) return <SkeletonPage />;

  return (
    <div className="max-w-full px-5 py-5 font-sans text-gray-800 dark:text-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Exam Management
        </h1>
        <ButtonWrapper subModule="Exam Management" permission="new">
          <button
            onClick={() =>
              navigate(`/module/${modulePath}/exam_management/create`)
            }
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 
      hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium 
      px-2 py-2 rounded-lg shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            Add Exam
          </button>
        </ButtonWrapper>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 mb-5 flex flex-wrap gap-2 items-center">
        <input
          type="text"
          value={filters.search}
          onChange={(e) =>
            setFilters((f) => ({ ...f, search: e.target.value }))
          }
          placeholder="Search exam..."
          className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm flex-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800"
        />

        <select
          value={filters.departmentId}
          onChange={(e) =>
            setFilters((f) => ({ ...f, departmentId: e.target.value }))
          }
          className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 text-sm bg-white dark:bg-gray-800"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          value={filters.levelId}
          onChange={(e) =>
            setFilters((f) => ({ ...f, levelId: e.target.value }))
          }
          className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 text-sm bg-white dark:bg-gray-800"
        >
          <option value="">All Levels</option>
          {levels.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) =>
            setFilters((f) => ({ ...f, status: e.target.value }))
          }
          className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 text-sm bg-white dark:bg-gray-800"
        >
          <option value="all">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-gray-900">
        <table className="min-w-[1100px] w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase tracking-wide text-[11px] font-medium">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Department</th>
              <th className="px-4 py-3 text-left">Level</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-center sticky right-0 bg-gray-100 dark:bg-gray-800 border-l">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-950">
            {loading ? (
              <SkeletonPage rows={4} columns={6} />
            ) : error ? (
              <tr>
                <td colSpan="6" className="text-center py-4 text-red-500">
                  {error}
                </td>
              </tr>
            ) : !paginatedExams.length ? (
              <tr>
                <td colSpan="6" className="text-center py-5 text-gray-500">
                  No exams found.
                </td>
              </tr>
            ) : (
              paginatedExams.map((exam, i) => (
                <tr
                  key={exam.id}
                  className={`transition-colors duration-150 ${i % 2 === 0
                      ? "bg-white dark:bg-gray-900"
                      : "bg-gray-50 dark:bg-gray-800"
                    } hover:bg-blue-50 dark:hover:bg-gray-700`}
                >
                  <td className="px-4 py-2 text-[14px] font-medium">
                    {exam.name}
                  </td>
                  <td className="px-4 py-2">{exam.department?.name || "-"}</td>
                  <td className="px-4 py-2">{exam.level?.name || "-"}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${exam.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-800/30 dark:text-green-300"
                          : "bg-red-100 text-red-700 dark:bg-red-800/30 dark:text-red-300"
                        }`}
                    >
                      {exam.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center sticky right-0 bg-gray-50 dark:bg-gray-800 border-l">
                    <div className="flex justify-center items-center gap-2">
                      <ButtonWrapper
                        subModule="Exam Management"
                        permission="edit"
                      >
                        <button
                          onClick={() =>
                            navigate(
                              `/module/${modulePath}/exam_management/update/${exam.id}`
                            )
                          }
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition"
                          title="Edit Exam"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </ButtonWrapper>
                      <ButtonWrapper
                        subModule="Exam Management"
                        permission="details"
                      >
                        <button
                          onClick={() =>
                            navigate(
                              `/module/${modulePath}/exam_management/view/${exam.id}`
                            )
                          }
                          className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition"
                          title="Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </ButtonWrapper>
                    </div>
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
              className={`px-3 py-1.5 border rounded-md text-sm font-medium transition ${currentPage === i + 1
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

export default ExamPage;
