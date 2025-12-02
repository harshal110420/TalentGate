const SkeletonForm = () => {
  return (
    <div className="flex flex-col h-full animate-pulse">
      <div
        className="
          flex flex-col justify-between flex-grow max-w-full pt-5 pr-5 pl-5 pb-2 
          bg-white dark:bg-gray-800 
          rounded-lg shadow-md 
          border border-gray-200 dark:border-gray-700
        "
      >
        {/* Title */}
        <div>
          <div className="flex border-b border-gray-300 dark:border-gray-700 mb-6">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-600 rounded mb-4"></div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-300 dark:border-gray-700 mb-7">
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-600 rounded mr-3 mb-3"></div>
            <div className="h-8 w-24 bg-gray-100 dark:bg-gray-700 rounded mb-3"></div>
          </div>

          {/* Section */}
          <section className="space-y-4">
            <div className="border-b border-gray-300 dark:border-gray-700 pb-2">
              <div className="h-5 w-40 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </section>
        </div>

        {/* Buttons at bottom-right */}
        <div className="flex justify-end items-center gap-2 mt-6">
          <div className="h-8 w-20 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
          <div className="h-8 w-24 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonForm;
