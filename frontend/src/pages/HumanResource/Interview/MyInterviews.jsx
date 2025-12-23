import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyInterviews } from "../../../features/HR_Slices/Interview/InterviewSlice";
import { useNavigate } from "react-router-dom";
import { getModulePathByMenu } from "../../../utils/navigation";

const MyInterviews = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { myInterviews, loading } = useSelector(
        (state) => state.candidatesOverview
    );
    const modules = useSelector((state) => state.modules.list);
    const menus = useSelector((state) => state.menus.list);
    const modulePath = getModulePathByMenu("interview_evaluation", modules, menus);

    useEffect(() => {
        dispatch(fetchMyInterviews());
    }, [dispatch]);

    if (loading) {
        return (
            <div className="p-6 text-gray-500 text-center">
                Loading your interviews...
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                    My Interviews
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    Interviews assigned to you as a panel member
                </p>
            </div>

            {/* Empty State */}
            {myInterviews.length === 0 && (
                <div className="border rounded-xl p-8 text-center text-gray-500 bg-white">
                    No interviews assigned yet.
                </div>
            )}

            {/* Interviews Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {myInterviews.map((interview) => (
                    <div
                        key={interview.id}
                        className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition"
                    >
                        {/* Candidate */}
                        <div className="mb-3">
                            <h3 className="text-lg font-medium text-gray-800">
                                {interview.candidate?.name}
                            </h3>
                            <p className="text-xs text-gray-500">
                                {interview.jobOpening?.title}
                            </p>
                        </div>

                        {/* Interview Info */}
                        <div className="text-sm text-gray-600 space-y-1">
                            <p>
                                <b>Round:</b> {interview.round}
                            </p>
                            <p>
                                <b>Date:</b>{" "}
                                {new Date(interview.interviewDate).toLocaleDateString()}
                            </p>
                            <p>
                                <b>Time:</b> {interview.startTime} – {interview.endTime}
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="mt-4 flex items-center justify-between">
                            {/* Status Badge */}
                            <span
                                className={`text-xs font-medium px-2 py-1 rounded-full
                  ${interview.status === "Scheduled"
                                        ? "bg-blue-100 text-blue-700"
                                        : interview.status === "Completed"
                                            ? "bg-green-100 text-green-700"
                                            : interview.status === "Locked"
                                                ? "bg-gray-200 text-gray-700"
                                                : "bg-yellow-100 text-yellow-700"
                                    }`}
                            >
                                {interview.status}
                            </span>

                            {/* CTA */}
                            <button
                                onClick={() =>
                                    navigate(
                                        `/module/${modulePath}/assigned_interviews/enter-score/${interview.id}`
                                    )
                                }
                                className="text-sm px-3 py-1.5 border rounded-md hover:bg-gray-100"
                            >
                                Open Score
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyInterviews;
