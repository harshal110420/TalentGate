import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

// Components
import ReportFilterPanel from "../../../components/common/ReportFilterPanel";
import ReportTable from "../../../components/common/ReportTable";
import DetailedReportTable from "../../../pages/Examination/Question/DetailedReportTable"; // ✅ import this

// Services
import {
  fetchQuestionsReport,
  fetchDetailedQuestionsReport,
} from "../../../services/reportService";

// Redux Slices
import { fetchAllDepartments } from "../../../features/department/departmentSlice";
import { fetchAllSubjects } from "../../../features/subject/subjectSlice";

const QuestionReportPage = () => {
  const dispatch = useDispatch();

  const [filters, setFilters] = useState({});
  const [data, setData] = useState([]);
  const [reportType, setReportType] = useState("summary"); // ✅ New state

  const departments = useSelector((state) => state.department?.list || []);
  const subjects = useSelector((state) => state.subjects?.list || []);

  const onSearch = async () => {
    const res =
      reportType === "summary"
        ? await fetchQuestionsReport(filters)
        : await fetchDetailedQuestionsReport(filters);

    setData(res);
  };

  useEffect(() => {
    dispatch(fetchAllDepartments());
    dispatch(fetchAllSubjects());
  }, [dispatch]);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">📊 Question Report</h1>

        {/* 🔘 Report Type Toggle */}
        <div className="flex items-center gap-2">
          <label htmlFor="reportType" className="text-sm text-gray-600">
            Report Type:
          </label>
          <select
            id="reportType"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="summary">Summary (Count)</option>
            <option value="detailed">Detailed (Full Data)</option>
          </select>
        </div>
      </div>

      {/* 🔍 Filters */}
      <ReportFilterPanel
        filters={filters}
        setFilters={setFilters}
        departments={departments}
        subjects={subjects}
        onSearch={onSearch}
      />

      {/* 📄 Report Data Table */}
      {reportType === "summary" ? (
        <ReportTable data={data} />
      ) : (
        <DetailedReportTable data={data} />
      )}
    </div>
  );
};

export default QuestionReportPage;
