// components/common/SkeletonPage.jsx
import React from "react";

const SkeletonPage = ({ rows = 4, columns = 3 }) => {
  return (
    <>
      {[...Array(rows)].map((_, rowIndex) => (
        <tr
          key={rowIndex}
          className={`
            animate-pulse
            ${rowIndex % 2 === 0
              ? "bg-white dark:bg-gray-800"
              : "bg-gray-50 dark:bg-gray-700"
            }
          `}
        >
          {[...Array(columns)].map((_, colIndex) => (
            <td key={colIndex} className="px-4 py-2">
              <div
                className="
                  h-4 rounded w-2/4 
                  bg-gray-200 dark:bg-gray-600
                "
              ></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export default SkeletonPage;
