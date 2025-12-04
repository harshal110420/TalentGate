import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { fetchJobOpenings } from "../../../features/HR_Slices/jobOpening/jobOpeningSlice";
import { fetchAllDepartments } from "../../../features/department/departmentSlice";

import SkeletonPage from "../../../components/skeletons/skeletonPage";
import ButtonWrapper from "../../../components/ButtonWrapper";
import { getModulePathByMenu } from "../../../utils/navigation";

import { PlusCircle, Pencil, Eye } from "lucide-react";

const ITEMS_PER_PAGE = 10;

const JobOpeningPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { jobOpenings = [], loading, error } = useSelector(
        (s) => s.jobOpening
    );

    const { list: departments = [] } = useSelector((s) => s.department);
    const modules = useSelector((s) => s.modules.list);
    const menus = useSelector((s) => s.menus.list);

    const modulePath = getModulePathByMenu("job_management", modules, menus);
    const [filters, setFilters] = useState({
        search: "",
        departmentId: "",
        status: "all",
        employmentType: "",
        location: "",
    });

    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        dispatch(fetchAllDepartments());
        dispatch(fetchJobOpenings());
    }, [dispatch]);

    // ✅ Filtering Logic
    const filteredJobs = useMemo(() => {
        return jobOpenings.filter((job) => {
            const matchSearch = job.title
                ?.toLowerCase()
                .includes(filters.search.toLowerCase());

            const matchDept = filters.departmentId
                ? String(job.department?.id) === filters.departmentId
                : true;

            const matchStatus =
                filters.status === "all"
                    ? true
                    : filters.status === "true"
                        ? job.isPublished
                        : !job.isPublished;

            const matchType = filters.employmentType
                ? job.employmentType === filters.employmentType
                : true;

            const matchLocation = filters.location
                ? job.location
                    ?.toLowerCase()
                    .includes(filters.location.toLowerCase())
                : true;

            return (
                matchSearch &&
                matchDept &&
                matchStatus &&
                matchType &&
                matchLocation
            );
        });
    }, [jobOpenings, filters]);

    // ✅ Pagination
    const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

    const paginatedJobs = filteredJobs.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE
    );

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    // Helper function
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case "Draft":
                return "bg-gray-100 text-gray-700";
            case "Open":
                return "bg-green-100 text-green-700";
            case "Hold":
                return "bg-yellow-100 text-yellow-700";
            case "Closed":
                return "bg-blue-100 text-blue-700";
            case "Cancelled":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    if (loading) return <SkeletonPage />;

    return (
        <div className="max-w-full px-5 py-5 font-sans text-gray-800 dark:text-gray-100">
            {/* ---------------- Header ---------------- */}
            <div className="flex flex-col sm:flex-row justify-between mb-6">
                <h1 className="text-2xl font-semibold">
                    Job Management
                </h1>

                <ButtonWrapper subModule="Job Management" permission="new">
                    <button
                        onClick={() =>
                            navigate(`/module/${modulePath}/job_management/create`)
                        }
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 
            hover:from-blue-700 hover:to-indigo-700 text-white px-2 py-2 rounded-lg shadow-sm text-sm"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Add Job
                    </button>
                </ButtonWrapper>
            </div>

            {/* ---------------- Filters ---------------- */}
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 
        rounded-xl p-3 mb-5 flex flex-wrap gap-2">

                <input
                    value={filters.search}
                    onChange={(e) =>
                        setFilters((f) => ({ ...f, search: e.target.value }))
                    }
                    placeholder="Search job..."
                    className="border rounded-md px-3 py-1.5 text-sm flex-1 bg-white dark:bg-gray-800"
                />

                <select
                    value={filters.departmentId}
                    onChange={(e) =>
                        setFilters((f) => ({ ...f, departmentId: e.target.value }))
                    }
                    className="border rounded-md px-2 py-1.5 text-sm bg-white dark:bg-gray-800"
                >
                    <option value="">All Departments</option>
                    {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                            {d.name}
                        </option>
                    ))}
                </select>

                <select
                    value={filters.employmentType}
                    onChange={(e) =>
                        setFilters((f) => ({
                            ...f,
                            employmentType: e.target.value,
                        }))
                    }
                    className="border rounded-md px-2 py-1.5 text-sm bg-white dark:bg-gray-800"
                >
                    <option value="">All Types</option>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Intern">Intern</option>
                    <option value="Contract">Contract</option>
                </select>

                <input
                    placeholder="Location"
                    value={filters.location}
                    onChange={(e) =>
                        setFilters((f) => ({ ...f, location: e.target.value }))
                    }
                    className="border rounded-md px-2 py-1.5 text-sm bg-white dark:bg-gray-800"
                />

                <select
                    value={filters.status}
                    onChange={(e) =>
                        setFilters((f) => ({ ...f, status: e.target.value }))
                    }
                    className="border rounded-md px-2 py-1.5 text-sm bg-white dark:bg-gray-800"
                >
                    <option value="all">All Status</option>
                    <option value="true">Published</option>
                    <option value="false">Unpublished</option>
                </select>
            </div>

            {/* ---------------- Table ---------------- */}
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white dark:bg-gray-900">
                <table className="min-w-[1100px] w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-800 text-gray-500 uppercase text-[11px]">
                        <tr>
                            <th className="px-4 py-3 text-left">Job Title</th>
                            <th className="px-4 py-3 text-left">Department</th>
                            <th className="px-4 py-3 text-left">Type</th>
                            <th className="px-4 py-3 text-left">Location</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left">Visibility</th>
                            <th className="px-4 py-3 text-center sticky right-0 border-l">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {error ? (
                            <tr>
                                <td colSpan="6" className="text-center text-red-500 py-4">
                                    {error}
                                </td>
                            </tr>
                        ) : paginatedJobs.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-5 text-gray-500">
                                    No job found.
                                </td>
                            </tr>
                        ) : (
                            paginatedJobs.map((job, i) => (
                                <tr
                                    key={job.id}
                                    className={`${i % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"
                                        } hover:bg-blue-50 dark:hover:bg-gray-700`}
                                >
                                    <td className="px-4 py-2 font-medium">{job.title}</td>
                                    <td className="px-4 py-2">{job.department?.name}</td>
                                    <td className="px-4 py-2">{job.employmentType}</td>
                                    <td className="px-4 py-2">{job.location}</td>
                                    <td className="px-4 py-2">
                                        <span
                                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(job.status)}`}
                                        >
                                            {job.status}
                                        </span>
                                    </td>                                    <td className="px-4 py-2">
                                        <span
                                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${job.isPublished
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {job.isPublished ? "Published" : "Unpublished"}
                                        </span>
                                    </td>

                                    <td className="text-center sticky right-0 bg-gray-50 dark:bg-gray-800 border-l">
                                        <div className="flex justify-center gap-2">
                                            <ButtonWrapper subModule="Job Management" permission="edit">
                                                <button
                                                    onClick={() =>
                                                        navigate(
                                                            `/module/${modulePath}/job_management/update/${job.id}`
                                                        )
                                                    }
                                                >
                                                    <Pencil className="w-4 h-4 text-blue-600" />
                                                </button>
                                            </ButtonWrapper>

                                            <ButtonWrapper subModule="Job Management" permission="details">
                                                <button
                                                    onClick={() =>
                                                        navigate(
                                                            `/module/${modulePath}/job_management/view/${job.id}`
                                                        )
                                                    }
                                                >
                                                    <Eye className="w-4 h-4 text-indigo-600" />
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

            {/* ---------------- Pagination ---------------- */}
            {totalPages > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="px-3 py-1 border rounded-md"
                    >
                        Prev
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => handlePageChange(i + 1)}
                            className={`px-3 py-1 border rounded-md ${currentPage === i + 1
                                ? "bg-blue-600 text-white"
                                : ""
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="px-3 py-1 border rounded-md"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default JobOpeningPage;
