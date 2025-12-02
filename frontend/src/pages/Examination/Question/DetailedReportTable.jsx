import React from "react";

import { format } from "date-fns";

const DetailedReportTable = ({ data = [] }) => {
  if (!data.length) {
    return (
      <p className="p-4 text-center text-gray-500">
        No records found for the selected filters.
      </p>
    );
  }

  return (
    <div className="overflow-auto">
      <table className="min-w-full border border-gray-200 rounded shadow-sm bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">#</th>
            <th className="px-4 py-2 border">Department</th>
            <th className="px-4 py-2 border">Subject</th>
            <th className="px-4 py-2 border">Level</th>
            <th className="px-4 py-2 border">Question</th>
            <th className="px-4 py-2 border">Options</th>
            <th className="px-4 py-2 border">Correct Answer</th>
            <th className="px-4 py-2 border">Created At</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="px-4 py-2 border text-center">{idx + 1}</td>
              <td className="px-4 py-2 border">{row.department_name}</td>
              <td className="px-4 py-2 border">{row.subject_name}</td>
              <td className="px-4 py-2 border">{row.level_name || "-"}</td>
              <td className="px-4 py-2 border">{row.question}</td>
              <td className="px-4 py-2 border">
                <ul className="list-disc ml-4">
                  {Array.isArray(row.options)
                    ? row.options.map((opt, i) => <li key={i}>{opt}</li>)
                    : (() => {
                        try {
                          return JSON.parse(row.options).map((opt, i) => (
                            <li key={i}>{opt}</li>
                          ));
                        } catch (e) {
                          return <li>{row.options}</li>;
                        }
                      })()}
                </ul>
              </td>
              <td className="px-4 py-2 border text-green-600 font-medium">
                {row.correct}
              </td>
              <td className="px-4 py-2 border text-sm text-gray-600">
                {row.created_at
                  ? format(new Date(row.created_at), "dd-MM-yyyy")
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DetailedReportTable;
