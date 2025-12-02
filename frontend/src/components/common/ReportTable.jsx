// src/components/ReportTable.jsx
import React from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ReportTable = ({ data }) => {
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Question Report");
    XLSX.writeFile(wb, "question_report.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Department", "Subject", "Total Questions"]],
      body: data.map((item) => [
        item.department_name,
        item.subject_name,
        item.total_questions,
      ]),
    });
    doc.save("question_report.pdf");
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow">
      <div className="flex justify-end gap-2 mb-4">
        <button onClick={exportToExcel} className="bg-green-600 text-white px-3 py-1 rounded">
          Export Excel
        </button>
        <button onClick={exportToPDF} className="bg-red-600 text-white px-3 py-1 rounded">
          Export PDF
        </button>
      </div>
      <table className="w-full table-auto border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">Department</th>
            <th className="p-2 border">Subject</th>
            <th className="p-2 border">Total Questions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="text-center">
              <td className="p-2 border">{row.department_name}</td>
              <td className="p-2 border">{row.subject_name}</td>
              <td className="p-2 border">{row.total_questions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportTable;
