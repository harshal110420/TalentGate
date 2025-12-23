import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllInterviews } from "../../../features/HR_Slices/Interview/InterviewSlice";
import { useNavigate } from "react-router-dom";
import { getModulePathByMenu } from "../../../utils/navigation";

const AllInterviews = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { allInterviews, loading } = useSelector(
        (state) => state.candidatesOverview
    );
    const modules = useSelector((state) => state.modules.list);
    const menus = useSelector((state) => state.menus.list);
    const modulePath = getModulePathByMenu("interview_evaluation", modules, menus);

    useEffect(() => {
        dispatch(fetchAllInterviews());
    }, [dispatch]);

    if (loading) {
        return <div className="p-6 text-gray-500">Loading interviews...</div>;
    }

    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold mb-6">
                All Interviews (HR View)
            </h2>

            <div className="overflow-x-auto bg-white rounded-xl shadow border">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                        <tr>
                            <th className="px-4 py-3 text-left">Candidate</th>
                            <th className="px-4 py-3 text-left">Job</th>
                            <th className="px-4 py-3">Round</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Time</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Panel</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {allInterviews?.length === 0 && (
                            <tr>
                                <td colSpan="9" className="text-center py-6 text-gray-500">
                                    No interviews found
                                </td>
                            </tr>
                        )}

                        {allInterviews.map((interview) => (
                            <tr
                                key={interview.id}
                                className="border-t hover:bg-gray-50 transition"
                            >
                                {/* Candidate */}
                                <td className="px-4 py-3">
                                    <div className="font-medium">
                                        {interview.candidate?.name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {interview.candidate?.email}
                                    </div>
                                </td>

                                {/* Job */}
                                <td className="px-4 py-3">
                                    <div>{interview.jobOpening?.title}</div>
                                    <div className="text-xs text-gray-500">
                                        {interview.jobOpening?.jobCode}
                                    </div>
                                </td>

                                {/* Round */}
                                <td className="px-4 py-3 text-center">
                                    {interview.round}
                                </td>

                                {/* Date */}
                                <td className="px-4 py-3 text-center">
                                    {new Date(interview.interviewDate).toLocaleDateString()}
                                </td>

                                {/* Time */}
                                <td className="px-4 py-3 text-center">
                                    {interview.startTime} – {interview.endTime}
                                </td>

                                {/* Type */}
                                <td className="px-4 py-3 text-center">
                                    {interview.interviewType}
                                </td>

                                {/* Panel */}
                                <td className="px-4 py-3">
                                    {interview.panel?.map((p) => (
                                        <div key={p.id} className="text-xs">
                                            <span className="font-medium">
                                                {p.user?.firstName} {p.user?.lastName}
                                            </span>
                                            <span className="text-gray-500">
                                                {" "}
                                                ({p.role})
                                            </span>
                                        </div>
                                    ))}
                                </td>

                                {/* Status */}
                                <td className="px-4 py-3 text-center">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium
                      ${interview.status === "Scheduled"
                                                ? "bg-blue-100 text-blue-700"
                                                : interview.status === "Completed"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-600"
                                            }`}
                                    >
                                        {interview.status}
                                    </span>
                                </td>

                                {/* Actions */}
                                <td className="px-4 py-3 text-center">
                                    <button
                                        onClick={() =>
                                            navigate(`/module/${modulePath}/interview_evaluation/review/${interview.id}`)
                                        }
                                        className="px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700"
                                    >
                                        View Scores
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AllInterviews;
