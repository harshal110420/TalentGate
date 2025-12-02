// src/components/skeletons/DashboardSkeleton.jsx

const DashboardSkeleton = () => {
  const cards = new Array(6).fill(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((_, idx) => (
        <div
          key={idx}
          className="
            p-6 rounded-xl shadow-md animate-pulse space-y-4
            bg-white dark:bg-gray-800 
            border border-gray-200 dark:border-gray-700
          "
        >
          <div
            className="
              h-6 rounded w-1/3 
              bg-gray-300 dark:bg-gray-700
            "
          ></div>

          {/* Example second line if needed */}
          {/* 
          <div
            className="
              h-4 rounded w-1/2 
              bg-gray-200 dark:bg-gray-600
            "
          ></div> 
          */}
        </div>
      ))}
    </div>
  );
};

export default DashboardSkeleton;
