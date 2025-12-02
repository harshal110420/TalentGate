// src/components/ReportFilterPanel.jsx
import React from "react";

const ReportFilterPanel = ({
  departments = [],
  subjects = [],
  filters,
  setFilters,
  onSearch,
}) => {
  return (
    <div className="p-4 bg-white rounded-xl shadow mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
      <select
        className="border p-2 rounded"
        value={filters.departmentId || ""}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, departmentId: e.target.value }))
        }
      >
        <option value="">All Departments</option>
        {departments.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>

      <select
        className="border p-2 rounded"
        value={filters.subjectId || ""}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, subjectId: e.target.value }))
        }
      >
        <option value="">All Subjects</option>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <input
        type="date"
        className="border p-2 rounded"
        value={filters.fromDate || ""}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, fromDate: e.target.value }))
        }
      />

      <input
        type="date"
        className="border p-2 rounded"
        value={filters.toDate || ""}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, toDate: e.target.value }))
        }
      />

      <button
        onClick={onSearch}
        className="col-span-full md:col-span-1 bg-blue-600 text-white p-2 rounded"
      >
        Search
      </button>
    </div>
  );
};

export default ReportFilterPanel;
