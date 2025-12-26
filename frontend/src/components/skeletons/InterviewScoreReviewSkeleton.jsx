const InterviewScoreReviewSkeleton = () => {
    const cards = Array.from({ length: 4 }); // adjust if needed

    return (
        <div className="p-6 max-w-6xl mx-auto animate-pulse">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="h-5 w-48 bg-gray-200 rounded-md mb-2"></div>
                    <div className="h-3 w-64 bg-gray-200 rounded-md"></div>
                </div>

                <div className="h-8 w-24 bg-gray-200 rounded-md"></div>
            </div>

            {/* GRID CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
                {cards.map((_, i) => (
                    <div
                        key={i}
                        className="bg-white border rounded-xl shadow-sm p-5 flex flex-col gap-4"
                    >
                        {/* STATUS BADGE */}
                        <div className="absolute top-3 right-3 h-4 w-16 bg-gray-200 rounded-full"></div>

                        {/* INTERVIEWER SECTION */}
                        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border">
                            <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                            <div className="flex flex-col gap-2 w-full">
                                <div className="h-3 w-28 bg-gray-200 rounded-md"></div>
                                <div className="h-2 w-40 bg-gray-200 rounded-md"></div>

                                <div className="flex gap-2 mt-1">
                                    <div className="h-3 w-20 bg-gray-200 rounded-full"></div>
                                    <div className="h-3 w-20 bg-gray-200 rounded-full"></div>
                                </div>
                            </div>
                        </div>

                        {/* SCORE BAR */}
                        <div>
                            <div className="h-2 flex-1 bg-gray-200 rounded-full"></div>
                            <div className="h-4 w-12 bg-gray-200 rounded-md mt-2"></div>
                        </div>

                        {/* TEXT BLOCKS */}
                        {[1, 2, 3].map((_, idx) => (
                            <div key={idx} className="flex flex-col gap-2">
                                <div className="h-3 w-24 bg-gray-200 rounded-md"></div>
                                <div className="h-3 w-40 bg-gray-200 rounded-md"></div>
                            </div>
                        ))}

                        {/* DATE */}
                        <div className="h-3 w-32 bg-gray-200 rounded-md mt-2"></div>
                    </div>
                ))}
            </div>

            {/* LOCK BUTTON PLACEHOLDER */}
            <div className="mt-10 flex justify-end">
                <div className="h-9 w-40 bg-gray-200 rounded-md"></div>
            </div>
        </div>
    );
};

export default InterviewScoreReviewSkeleton;
