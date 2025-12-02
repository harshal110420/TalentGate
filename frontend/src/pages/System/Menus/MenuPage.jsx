import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchGroupedMenus } from "../../../features/menus/menuSlice";
import ButtonWrapper from "../../../components/ButtonWrapper";
import SkeletonPage from "../../../components/skeletons/skeletonPage";
import { useNavigate } from "react-router-dom";
import debounce from "lodash.debounce";
import { Pencil, PlusCircle } from "lucide-react";
import { getModulePathByMenu } from "../../../utils/navigation";

const MenuPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    list: menus = [],
    loading,
    error,
  } = useSelector((state) => state.menus);
  const modules = useSelector((state) => state.modules.list);
  const modulePath = getModulePathByMenu("menu_management", modules, menus);

  const [searchInput, setSearchInput] = useState("");
  const [searchName, setSearchName] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchGroupedMenus());
  }, [dispatch]);

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        setSearchName(value);
      }, 300),
    []
  );

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    debouncedSearch(e.target.value);
  };

  const filteredMenus = menus.filter((menu) => {
    const matchesName = menu.name
      ?.toLowerCase()
      .includes(searchName.toLowerCase());
    const matchesModule =
      moduleFilter === "all" || menu.module === moduleFilter;
    const matchesCategory =
      categoryFilter === "all" || menu.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && menu.isActive) ||
      (statusFilter === "inactive" && !menu.isActive);

    return matchesName && matchesModule && matchesCategory && matchesStatus;
  });

  const moduleOptions = [...new Set(menus.map((menu) => menu.module))];
  const categoryOptions = [...new Set(menus.map((menu) => menu.category))];

  return (
    <div className="max-w-full px-5 py-5 font-sans text-gray-800 dark:text-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Manage Menus
        </h1>
        <ButtonWrapper subModule="Menu Management" permission="new">
          <button
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 
              hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium 
              px-2 py-2 rounded-lg shadow-sm transition"
            onClick={() =>
              navigate(`/module/${modulePath}/menu_management/create`)
            }
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Menu</span>
          </button>
        </ButtonWrapper>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 mb-5 flex flex-wrap gap-2 items-center">
        <input
          type="text"
          value={searchInput}
          onChange={handleSearchChange}
          placeholder="Search Name"
          className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm flex-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800"
        />

        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 text-sm bg-white dark:bg-gray-800"
        >
          <option value="all">All Modules</option>
          {moduleOptions.map((module) => (
            <option key={module} value={module}>
              {module}
            </option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 text-sm bg-white dark:bg-gray-800"
        >
          <option value="all">All Categories</option>
          {categoryOptions.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        {/* ✅ Status Filter Added */}
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
              <th className="px-4 py-3 text-left">Menu Name</th>
              <th className="px-4 py-3 text-left">Module</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-center sticky right-0 bg-gray-100 dark:bg-gray-800 border-l">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-800 dark:text-gray-100 text-sm">
            {loading ? (
              <SkeletonPage rows={4} columns={4} />
            ) : error ? (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-6 text-red-600 dark:text-red-400"
                >
                  Error:{" "}
                  {error?.message || "Something went wrong, please try again."}
                </td>
              </tr>
            ) : filteredMenus.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-6 text-gray-500 dark:text-gray-300"
                >
                  No menus found.
                </td>
              </tr>
            ) : (
              filteredMenus.map((menu, index) => (
                <tr
                  key={menu.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    index % 2 === 0
                      ? "bg-white dark:bg-gray-900"
                      : "bg-gray-50 dark:bg-gray-800"
                  }`}
                >
                  <td className="px-4 py-2">{menu.name}</td>
                  <td className="px-4 py-2">{menu.module}</td>
                  <td className="px-4 py-2">{menu.category}</td>
                  <td className="px-4 py-2">
                    {menu.isActive ? (
                      <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded-full">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-center sticky right-0 bg-gray-50 dark:bg-gray-800 border-l">
                    <ButtonWrapper
                      subModule="Menu Management"
                      permission="edit"
                    >
                      <button
                        onClick={() =>
                          navigate(
                            `/module/${modulePath}/menu_management/update/${menu.id}`
                          )
                        }
                        title="Edit Menu"
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

export default MenuPage;
