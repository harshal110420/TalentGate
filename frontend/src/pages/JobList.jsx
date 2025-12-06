import React, { useEffect, useState } from "react";
import axios from "axios";

const JobList = () => {

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);

    // ✅ Fetch public jobs
    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/public/jobs");
            setJobs(res.data.data || []);
        } catch (error) {
            console.error("Failed to load jobs");
        } finally {
            setLoading(false);
        }
    };

    const openModal = (job) => {
        setSelectedJob(job);
    };

    const closeModal = () => {
        setSelectedJob(null);
    };

    const handleApply = () => {
        alert(`✅ Applied for: ${selectedJob.jobCode}`);
        // Yahi par later POST /apply API call hoga
        closeModal();
    };

    if (loading) return <div className="p-5">Loading jobs…</div>;

    return (
        <div className="p-6 max-w-5xl mx-auto">

            <h1 className="text-2xl font-bold mb-6">
                Open Job Positions
            </h1>

            {/* ✅ JOB LIST */}
            <div className="grid md:grid-cols-2 gap-5">

                {jobs.map((job) => (
                    <div
                        key={job.id}
                        className="border rounded-lg p-4 shadow hover:shadow-md transition flex flex-col justify-between"
                    >

                        <div>
                            <h2 className="text-lg font-semibold">
                                {job.title}
                            </h2>

                            <p className="text-sm text-gray-600 mt-1">
                                {job.department?.name}
                            </p>

                            <div className="text-sm mt-2">
                                📍 {job.location}
                            </div>

                            <div className="text-sm mt-1">
                                🧠 {job.employmentType}
                            </div>

                            <div className="text-sm mt-1">
                                ⏳ {job.minExperience} - {job.maxExperience} Years
                            </div>
                        </div>

                        {/* SEE MORE BUTTON */}
                        <button
                            className="mt-4 p-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                            onClick={() => openModal(job)}
                        >
                            See more
                        </button>
                    </div>
                ))}

            </div>

            {/* ✅ MODAL */}
            {selectedJob && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">

                    <div className="bg-white rounded-xl max-w-xl w-full p-6 relative">

                        <button
                            onClick={closeModal}
                            className="absolute top-3 right-3 text-lg font-bold"
                        >
                            ✕
                        </button>

                        <h2 className="text-xl font-semibold mb-2">
                            {selectedJob.title}
                        </h2>

                        <p className="text-sm mb-1">
                            <b>Department:</b> {selectedJob.department?.name}
                        </p>

                        <p className="text-sm mb-1">
                            <b>Location:</b> {selectedJob.location}
                        </p>

                        <p className="text-sm mb-1">
                            <b>Experience:</b>{" "}
                            {selectedJob.minExperience} - {selectedJob.maxExperience} years
                        </p>

                        <p className="text-sm mb-1">
                            <b>Employment:</b> {selectedJob.employmentType}
                        </p>

                        <p className="text-sm mb-1">
                            <b>Opening Date:</b>{" "}
                            {selectedJob.openingDate}
                        </p>

                        <p className="text-sm mb-4">
                            <b>Job Code:</b> {selectedJob.jobCode}
                        </p>

                        {/* APPLY BUTTON */}
                        <button
                            onClick={handleApply}
                            className="w-full p-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            Apply for this position
                        </button>

                    </div>

                </div>
            )}

        </div>
    );
};

export default JobList;
