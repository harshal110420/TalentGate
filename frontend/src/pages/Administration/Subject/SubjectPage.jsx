import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSubjects } from "../../../features/subject/subjectSlice";
import { fetchAllDepartments } from "../../../features/department/departmentSlice";
import ButtonWrapper from "../../../components/ButtonWrapper";
import SkeletonPage from "../../../components/skeletons/skeletonPage";
import { useNavigate } from "react-router-dom";
import debounce from "lodash.debounce";
import { Pencil, PlusCircle } from "lucide-react";
import { getModulePathByMenu } from "../../../utils/navigation";

const SubjectPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    list: subjects = [],
    loading,
    error,
  } = useSelector((state) => state.subjects);

  const { list: departments = [] } = useSelector((state) => state.department);

  const modules = useSelector((state) => state.modules.list);
  const menus = useSelector((state) => state.menus.list);
  const modulePath = getModulePathByMenu("subject_management", modules, menus);

  // 🔹 Filters
  const [searchInput, setSearchInput] = useState("");
  const [searchSubjectName, setSearchSubjectName] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchSubjects());
    dispatch(fetchAllDepartments());
  }, [dispatch]);

  // 🔹 Debounce search
  const debouncedSearch = useMemo(
    () => debounce((value) => setSearchSubjectName(value), 300),
    []
  );

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    debouncedSearch(e.target.value);
  };

  // 🔹 Filter Logic
  const filteredSubjects = subjects.filter((subject) => {
    const matchesName = subject.name
      ?.toLowerCase()
      .includes(searchSubjectName.toLowerCase());

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
          ? subject.isActive
          : !subject.isActive;

    const matchesDepartment =
      departmentFilter === "all"
        ? true
        : subject.departmentId === parseInt(departmentFilter);

    return matchesName && matchesStatus && matchesDepartment;
  });

  return (
    <div className="max-w-full px-5 py-5 font-sans text-gray-800 dark:text-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Subject Management
        </h1>
        <ButtonWrapper subModule="Subject Management" permission="new">
          <button
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 
            hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium 
            px-2 py-2 rounded-lg shadow-sm transition"
            onClick={() =>
              navigate(`/module/${modulePath}/subject_management/create`)
            }
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Subject</span>
          </button>
        </ButtonWrapper>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 mb-5 flex flex-wrap gap-2 items-center">
        {/* Search */}
        <input
          type="text"
          placeholder="Search subject..."
          value={searchInput}
          onChange={handleSearchChange}
          className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm flex-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800"
        />

        {/* Department Filter */}
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 text-sm bg-white dark:bg-gray-800"
        >
          <option value="all">All Departments</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 text-sm bg-white dark:bg-gray-800"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-gray-900">
        <table className="min-w-[1100px] w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase tracking-wide text-[11px] font-medium">
            <tr>
              <th className="px-4 py-3 text-left">Subject Name</th>
              <th className="px-4 py-3 text-left">Department</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-center sticky right-0 bg-gray-100 dark:bg-gray-800 border-l">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-800 dark:text-gray-100 text-sm">
            {loading ? (
              <SkeletonPage rows={4} columns={4} />
            ) : filteredSubjects.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="text-center py-6 text-gray-500 dark:text-gray-300"
                >
                  No subjects found.
                </td>
              </tr>
            ) : (
              filteredSubjects.map((subject, index) => (
                <tr
                  key={subject.id}
                  className={`${index % 2 === 0
                      ? "bg-white dark:bg-gray-900"
                      : "bg-gray-50 dark:bg-gray-800"
                    } hover:bg-gray-100 dark:hover:bg-gray-700 transition`}
                >
                  <td className="px-4 py-2">{subject.name}</td>
                  <td className="px-4 py-2">
                    {subject.department?.name || "-"}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${subject.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                        }`}
                    >
                      {subject.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center sticky right-0 bg-gray-50 dark:bg-gray-800 border-l">
                    <ButtonWrapper
                      subModule="Subject Management"
                      permission="edit"
                    >
                      <button
                        onClick={() =>
                          navigate(
                            `/module/${modulePath}/subject_management/update/${subject.id}`
                          )
                        }
                        title="Edit Subject"
                        className="text-blue-600 hover:text-blue-800 p-1 rounded-full transition"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </ButtonWrapper>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubjectPage;
