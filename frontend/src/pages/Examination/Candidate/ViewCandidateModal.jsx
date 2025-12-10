export default function ViewCandidateModal({ isOpen, onClose, candidate }) {
    if (!isOpen || !candidate) return null;

    const Label = ({ l, v }) => (
        <p className="text-sm text-gray-700">
            <b className="text-gray-900">{l}:</b> {v || "-"}
        </p>
    );

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center">
            <div className="bg-white w-[95%] max-w-4xl rounded-xl shadow-xl overflow-y-auto max-h-[90vh]">

                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold">
                        Candidate Overview
                    </h2>
                    <button
                        className="text-gray-500 hover:text-red-600"
                        onClick={onClose}
                    >
                        ✖
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-5">

                    {/* Profile */}
                    <section>
                        <h3 className="font-semibold mb-2 border-b pb-1">Profile</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <Label l="Name" v={candidate.name} />
                            <Label l="Email" v={candidate.email} />
                            <Label l="Mobile" v={candidate.mobile} />
                            <Label l="Experience" v={candidate.experience} />
                            <Label l="Source" v={candidate.source} />
                            <Label l="Resume" v={
                                candidate.resumeUrl ? (
                                    <a
                                        className="text-blue-600 underline"
                                        href={candidate.resumeUrl}
                                        target="_blank"
                                    >
                                        Download
                                    </a>
                                ) : "N/A"
                            } />
                        </div>
                    </section>

                    {/* Job Info */}
                    <section>
                        <h3 className="font-semibold mb-2 border-b pb-1">Job Details</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <Label l="Job Code" v={candidate.jobCode} />
                            <Label l="Department" v={candidate.department?.name} />
                            <Label l="Designation" v={candidate.job?.designation} />
                            <Label l="Job Title" v={candidate.job?.title} />
                        </div>
                    </section>

                    {/* Hiring Status */}
                    <section>
                        <h3 className="font-semibold mb-2 border-b pb-1">Hiring Status</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <Label l="Application Stage" v={candidate.applicationStage} />
                            <Label l="Exam Status" v={candidate.examStatus} />
                            <Label l="Last Mail Sent" v={
                                candidate.lastMailSentAt
                                    ? new Date(candidate.lastMailSentAt).toLocaleString()
                                    : "-"
                            } />
                            <Label l="Resume Reviewed" v={
                                candidate.resumeReviewed ? "Yes" : "No"
                            } />
                            <Label l="HR Rating" v={candidate.hrRating} />
                            <Label l="Account Status" v={candidate.isActive ? "Active" : "Inactive"} />
                        </div>
                    </section>

                    {/* Interview */}
                    {candidate.applicationStage === "Interview Scheduled" && (
                        <section>
                            <h3 className="font-semibold mb-2 border-b pb-1">Interview Details</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <Label
                                    l="Date & Time"
                                    v={
                                        candidate.interviewDateTime
                                            ? new Date(candidate.interviewDateTime).toLocaleString()
                                            : "-"
                                    }
                                />
                                <Label l="Mode" v={candidate.interviewMode} />
                                <Label l="Location" v={candidate.interviewLocation} />
                                <Label l="Panel" v={candidate.interviewPanel} />
                                <Label l="Remarks" v={candidate.interviewRemarks} />
                            </div>
                        </section>
                    )}

                    {/* Rejection */}
                    {candidate.applicationStage === "Rejected" && (
                        <section>
                            <h3 className="font-semibold mb-2 border-b pb-1 text-red-600">
                                Rejection Info
                            </h3>
                            <Label l="Remarks" v={candidate.remarks} />
                        </section>
                    )}

                    {/* Hired */}
                    {candidate.applicationStage === "Hired" && (
                        <section>
                            <h3 className="font-semibold mb-2 border-b pb-1 text-green-700">
                                Joining Details
                            </h3>
                            <Label
                                l="Joining Date"
                                v={
                                    candidate.joiningDate
                                        ? new Date(candidate.joiningDate).toLocaleDateString()
                                        : "-"
                                }
                            />
                        </section>
                    )}
                </div>

                {/* Footer */}
                <div className="text-right p-3 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 bg-gray-600 hover:bg-gray-700 rounded text-white text-sm"
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
}
