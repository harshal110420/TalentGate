// src/pages/system-module/ModulePage.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchModules } from "../../../features/Modules/ModuleSlice";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Pencil } from "lucide-react";
import { getModulePathByMenu } from "../../../utils/navigation";
import SkeletonPage from "../../../components/skeletons/skeletonPage";
import ButtonWrapper from "../../../components/ButtonWrapper";

const ModulePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: modules, loading } = useSelector((state) => state.modules);
  const menuList = useSelector((state) => state.menus.list);
  const moduleList = useSelector((state) => state.modules.list);
  const modulePath = getModulePathByMenu(
    "module_management",
    moduleList,
    menuList
  );

  useEffect(() => {
    dispatch(fetchModules());
  }, [dispatch]);

  return (
    <div className="max-w-full px-5 py-5 font-sans text-gray-800 dark:text-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Module Management
        </h1>
        <ButtonWrapper subModule="Module Management" permission="new">
          <button
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 
      hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium 
      px-2 py-2 rounded-lg shadow-sm transition"
            onClick={() =>
              navigate(`/module/${modulePath}/module_management/create`)
            }
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Module</span>
          </button>
        </ButtonWrapper>
      </div>

      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-gray-900">
        <table className="min-w-[1100px] w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase tracking-wide text-[11px] font-medium">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Path</th>
              <th className="px-4 py-3 text-left">Version</th>
              <th className="px-4 py-3 text-left">Order</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-center sticky right-0 bg-gray-100 dark:bg-gray-800 border-l">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-800 dark:text-gray-100 text-sm">
            {loading ? (
              <SkeletonPage rows={4} columns={6} />
            ) : modules.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-4 text-gray-500 dark:text-gray-300"
                >
                  No modules found
                </td>
              </tr>
            ) : (
              modules.map((mod, idx) => (
                <tr
                  key={mod.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    idx % 2 === 0
                      ? "bg-white dark:bg-gray-900"
                      : "bg-gray-50 dark:bg-gray-800"
                  }`}
                >
                  <td className="px-4 py-2">{mod.name}</td>
                  <td className="px-4 py-2">{mod.path}</td>
                  <td className="px-4 py-2">{mod.version}</td>
                  <td className="px-4 py-2">{mod.orderBy}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        mod.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {mod.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center sticky right-0 bg-gray-50 dark:bg-gray-800 border-l">
                    <ButtonWrapper
                      subModule="Module Management"
                      permission="edit"
                    >
                      <button
                        onClick={() =>
                          navigate(
                            `/module/${modulePath}/module_management/update/${mod.id}`
                          )
                        }
                         title="Edit Module"
                        className="text-blue-600 hover:text-blue-800 p-1 rounded-full transition"
                      >
                        <Pencil className="w-4 h-4 inline" />
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

export default ModulePage;
