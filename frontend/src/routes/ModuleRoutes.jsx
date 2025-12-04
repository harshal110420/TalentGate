import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchAllGroupedMenus } from "../features/menus/menuSlice";
import { fetchAllModules } from "../features/Modules/ModuleSlice";
import LoadingScreen from "../components/skeletons/LoadingScreen";
import RolesPage from "../pages/Administration/Roles/RolesPage";
import RoleForm from "../pages/Administration/Roles/RoleForm";
import MenuPage from "../pages/System/Menus/MenuPage";
import MenuForm from "../pages/System/Menus/MenusForm";
import PermissionsPage from "../pages/System/Permission/PermissionPage";
import UserPage from "../pages/Administration/User/UsersPage";
import UserForm from "../pages/Administration/User/UserForm";
import DepartmentPage from "../pages/Administration/Department/DepartmentPage";
import DepartmentForm from "../pages/Administration/Department/DepartmentForm";
import LevelPage from "../pages/Administration/Level/LevelPage";
import LevelForm from "../pages/Administration/Level/LevelForm";
import ModulePage from "../pages/System/Module/ModulePage";
import ModuleForm from "../pages/System/Module/ModuleForm";
import QuestionPage from "../pages/Examination/Question/QuestionPage";
import QuestionForm from "../pages/Examination/Question/QuestionForm";
import SubjectPage from "../pages/Administration/Subject/SubjectPage";
import SubjectForm from "../pages/Administration/Subject/SubjectForm";
import NotFoundPage from "../components/common/NotFoundPage";
import CandidatePage from "../pages/Examination/Candidate/CandidatePage";
import CandidateForm from "../pages/Examination/Candidate/CandidateForm";
import QuestionReportPage from "../pages/Examination/Question/QuestionReportPage";
import DetailedReportTable from "../pages/Examination/Question/DetailedReportTable";
import ExamPage from "../pages/Examination/Exam/ExamPage";
import ExamForm from "../pages/Examination/Exam/ExamForm";
import ExamViewPage from "../pages/Examination/Exam/ExamViewPage";
import ExamResultViewPage from "../pages/Examination/Exam/ExamResultViewPage";
import ExamResultDetailPage from "../pages/Examination/Exam Result/ExamResultDetailPage";
import ExamResultsPage from "../pages/Examination/Exam Result/ExamResultPage";
import ExamResultResponsePage from "../pages/Examination/Exam Result/ExamResultResponsePage";
import CareerApplication from "../pages/Examination/Career Application/CareerApplication";
import QuestionDetailPage from "../pages/Examination/Question/QuestionDetailPage";
import UserPermissionWrapper from "../pages/Administration/User/UserPermissionWrapper";
import JobOpeningPage from "../pages/HumanResource/JobOpening/jobOpeningPage";
import JobOpeningForm from "../pages/HumanResource/JobOpening/JobOpeningForm";
import JobDetails from "../pages/HumanResource/JobOpening/JobDetails";
const ModuleRoutes = ({ moduleName }) => {
  const location = useLocation();
  const dispatch = useDispatch();

  // Get modules from permission state (same as ModuleLayout uses)
  // This ensures consistency - modules come from permissions which user has access to
  const permissionModules = useSelector((state) => state.userPermission.loggedInUserPermissions);
  const allModulesList = useSelector((state) => state.modules.list);
  const menus = useSelector((state) => state.menus.list);
  const menusLoading = useSelector((state) => state.menus.loading);
  const modulesLoading = useSelector((state) => state.modules.loading);

  // Ensure menus and modules are loaded
  useEffect(() => {
    if (menus.length === 0 && !menusLoading) {
      dispatch(fetchAllGroupedMenus());
    }
    if (allModulesList.length === 0 && !modulesLoading) {
      dispatch(fetchAllModules());
    }
  }, [dispatch, menus.length, allModulesList.length, menusLoading, modulesLoading]);

  // Try to find module in permission modules first (has modulePath)
  let currentModule = permissionModules?.find(
    (module) => module.modulePath === moduleName
  );

  // Fallback to all modules list if not found in permission modules (has path)
  if (!currentModule) {
    currentModule = allModulesList.find((module) => module.path === moduleName);
  }

  const isBasePath = location.pathname === `/module/${moduleName}`;

  // Show loading while fetching data
  if ((menusLoading || modulesLoading) && menus.length === 0) {
    return <LoadingScreen />;
  }

  // If the current module doesn't exist in the Redux state, show not found
  // Don't redirect to /unauthorized as that route might not exist
  if (!currentModule) {
    return <NotFoundPage />;
  }

  // Get menus from currentModule (from permissions) - this has the correct structure
  // Menus are organized by category: { Master: [], Transaction: [], Report: [] }
  const moduleMenusByCategory = currentModule.menus || {};

  // Flatten all menus from all categories into a single array
  const currentModuleMenus = Object.values(moduleMenusByCategory).flat();

  // Also keep the flat menus list for route generation (needed for menu name matching)
  // But prioritize menus from permission modules as they have the correct structure

  // Define routes for the current module dynamically
  const generateRoutes = () => {
    // Use currentModuleMenus which comes from permissions (has name and menuId)
    return currentModuleMenus.map((menu) => {
      // Menu from permissions has: { name, menuId, actions }
      if (!menu.name) return null;

      switch (menu.name) {
        case "Role Management":
          return (
            <>
              <Route path="role_management" element={<RolesPage />} />
              <Route path="role_management/create" element={<RoleForm />} />
              <Route
                path="role_management/update/:roleId"
                element={<RoleForm />}
              />
            </>
          );
        case "User Management":
          return (
            <>
              <Route path="user_management" element={<UserPage />} />
              <Route path="user_management/create" element={<UserForm />} />
              <Route path="user_management/update/:id" element={<UserForm />} />
              {/* ✅ NEW ROUTE */}
              <Route
                path="user_management/permission/:userId"
                element={<UserPermissionWrapper />}
              />
            </>
          );
        case "Department Management":
          return (
            <>
              <Route
                path="department_management"
                element={<DepartmentPage />}
              />
              <Route
                path="department_management/create"
                element={<DepartmentForm />}
              />
              <Route
                path="department_management/update/:id"
                element={<DepartmentForm />}
              />
            </>
          );
        case "Level Management":
          return (
            <>
              <Route path="level_management" element={<LevelPage />} />
              <Route path="level_management/create" element={<LevelForm />} />
              <Route
                path="level_management/update/:id"
                element={<LevelForm />}
              />
            </>
          );
        case "Subject Management":
          return (
            <>
              <Route path="subject_management" element={<SubjectPage />} />
              <Route
                path="subject_management/create"
                element={<SubjectForm />}
              />
              <Route
                path="subject_management/update/:id"
                element={<SubjectForm />}
              />
            </>
          );
        case "Menu Management":
          return (
            <>
              <Route path="menu_management" element={<MenuPage />} />
              <Route path="menu_management/create" element={<MenuForm />} />
              <Route path="menu_management/update/:id" element={<MenuForm />} />
            </>
          );
        case "Permission Management":
          return (
            <Route path="permission_management" element={<PermissionsPage />} />
          );
        case "Module Management":
          return (
            <>
              <Route path="module_management" element={<ModulePage />} />
              <Route path="module_management/create" element={<ModuleForm />} />
              <Route
                path="module_management/update/:id"
                element={<ModuleForm />}
              />
            </>
          );
        case "Question Management":
          return (
            <>
              <Route path="question_management" element={<QuestionPage />} />
              <Route
                path="question_management/create"
                element={<QuestionForm />}
              />
              <Route
                path="question_management/update/:id"
                element={<QuestionForm />}
              />
              <Route
                path="question_management/view/:id"
                element={<QuestionDetailPage />}
              />
            </>
          );
        case "Candidate Management":
          return (
            <>
              <Route path="candidate_management" element={<CandidatePage />} />
              <Route
                path="candidate_management/create"
                element={<CandidateForm />}
              />
              <Route
                path="candidate_management/update/:id"
                element={<CandidateForm />}
              />
            </>
          );
        case "Exam Management":
          return (
            <>
              <Route path="exam_management" element={<ExamPage />} />
              <Route path="exam_management/create" element={<ExamForm />} />
              <Route path="exam_management/update/:id" element={<ExamForm />} />
              <Route
                path="exam_management/view/:id"
                element={<ExamViewPage />}
              />
            </>
          );
        case "Exam Results":
          return (
            <>
              <Route path="exam_results" element={<ExamResultsPage />} />
              <Route
                path="exam_results/:candidateId"
                element={<ExamResultDetailPage />}
              />
              <Route
                path="exam_results/view/:id"
                element={<ExamResultViewPage />}
              />
              <Route
                path="exam_results/:candidateId/exam/:id"
                element={<ExamResultResponsePage />}
              />
            </>
          );
        case "Career Application":
          return (
            <>
              <Route
                path="website_career_application"
                element={<CareerApplication />}
              />
            </>
          );
        case "Question Reports":
          return (
            <>
              <Route path="question_reports" element={<QuestionReportPage />} />
              <Route
                path="question_reports"
                element={<DetailedReportTable />}
              />
            </>
          );
        case "Job Management":
          return (
            <>
              <Route path="job_management" element={<JobOpeningPage />} />
              <Route path="job_management/create" element={<JobOpeningForm />} />
              <Route path="job_management/update/:id" element={<JobOpeningForm />} />
              <Route path="job_management/view/:id" element={<JobDetails />} />
            </>
          );

        default:
          return null; // If no menu matches, do nothing (you can handle default behavior)
      }
    });
  };

  // Generate routes - filter out null values
  const routes = generateRoutes().filter(route => route !== null);

  // If no routes and no menus, show a message
  if (currentModuleMenus.length === 0 && !menusLoading) {
    return (
      <div className="p-6 text-center text-gray-700 dark:text-gray-100">
        <h2 className="text-xl font-semibold mb-2">No menus available</h2>
        <p className="text-sm">This module doesn't have any accessible menus.</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Default route for base module path - show empty or redirect to first menu */}
      {isBasePath && (
        <Route
          path=""
          element={
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              <p className="text-sm">Please select a menu from the sidebar to continue.</p>
            </div>
          }
        />
      )}

      {/* Dynamically generate module routes */}
      {routes}

      {/* Catch-all for any other route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default ModuleRoutes;
