import { useState } from "react";

const CustomCalendar = ({ selectedDate, onSelect, scheduledInterviews }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [showInterviewModal, setShowInterviewModal] = useState(false);
    const [selectedInterviewDate, setSelectedInterviewDate] = useState(null);
    console.log("selectedInterviewDate", selectedInterviewDate)
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);

    const isSelected = (day) => {
        if (!day || !selectedDate) return false;
        const d = new Date(selectedDate);
        return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    };

    const selectDate = (day) => {
        if (!day) return;
        const selected = new Date(year, month, day);
        const yyyy = selected.getFullYear();
        const mm = String(selected.getMonth() + 1).padStart(2, "0");
        const dd = String(selected.getDate()).padStart(2, "0");
        onSelect(`${yyyy}-${mm}-${dd}`);
    };
    const ACTIVE_STATUSES = ["Scheduled", "Rescheduled"];

    // Filter interviews for current month/day
    const getInterviewsForDay = (day) => {
        if (!day || !Array.isArray(scheduledInterviews)) return [];

        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        return scheduledInterviews.filter(
            (i) =>
                i.interviewDate === dateStr &&
                ACTIVE_STATUSES.includes(i.status)
        );
    };

    const formatTo12Hour = (time24) => {
        if (!time24) return "";
        const [hour, minute] = time24.split(":");
        let h = parseInt(hour);

        const suffix = h >= 12 ? "PM" : "AM";
        h = h % 12 || 12; // 0 ko 12 banana

        return `${h}:${minute} ${suffix}`;
    };

    return (
        <div className="rounded-lg border bg-white p-3 relative">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-3">
                <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} className="px-2 py-1 text-sm hover:bg-gray-100 rounded">‹</button>
                <span className="font-medium text-sm">{currentMonth.toLocaleString("default", { month: "long" })} {year}</span>
                <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} className="px-2 py-1 text-sm hover:bg-gray-100 rounded">›</button>
            </div>

            {/* WEEK DAYS */}
            <div className="grid grid-cols-7 text-xs text-gray-500 mb-1">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => <div key={d} className="text-center">{d}</div>)}
            </div>

            {/* DATES */}
            <div className="grid grid-cols-7 gap-1 text-sm">
                {days.map((day, idx) => {
                    const dayInterviews = getInterviewsForDay(day);
                    return (
                        <div key={idx} className="relative flex justify-center">
                            <button
                                onClick={() => selectDate(day)}
                                disabled={!day}
                                className={`h-9 w-9 rounded-md flex items-center justify-center
                  ${!day ? "" : "hover:bg-teal-100"}
                  ${isSelected(day) ? "bg-teal-600 text-white" : "text-gray-700"}
                `}
                            >
                                {day}
                            </button>

                            {/* Dot indicator for interviews */}
                            {dayInterviews.length > 0 && (
                                <span
                                    onClick={() => {
                                        setSelectedInterviewDate(dayInterviews);
                                        setShowInterviewModal(true);
                                    }}
                                    className="absolute bottom-1 w-2 h-2 rounded-full bg-teal-500 cursor-pointer"
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Interview Info Modal */}
            {showInterviewModal && selectedInterviewDate && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-[fadeIn_0.25s_ease]">

                        {/* Header */}
                        <button
                            onClick={() => setShowInterviewModal(false)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-white"
                        >
                            ✕
                        </button>

                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                            Interview Schedule
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">
                            {selectedInterviewDate[0]?.interviewDate}
                        </p>

                        <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                            {selectedInterviewDate.map((i, idx) => (
                                <div
                                    key={idx}
                                    className="border border-gray-200 dark:border-slate-700 rounded-xl p-4 bg-gray-50 dark:bg-slate-800"
                                >
                                    {/* Candidate Section */}
                                    <div>
                                        <h3 className="text-sm font-medium text-teal-600 dark:text-teal-400">
                                            {i.candidate?.name}
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {i.candidate?.email}
                                        </p>
                                    </div>

                                    {/* Time & Round */}
                                    <div className="mt-3 grid grid-cols-2 text-xs gap-x-4">
                                        <div className="space-y-[2px]">
                                            <span className="text-gray-500">Time</span>
                                            <p className="font-medium">
                                                {formatTo12Hour(i.startTime)} - {formatTo12Hour(i.endTime)}
                                            </p>
                                        </div>
                                        <div className="space-y-[2px]">
                                            <span className="text-gray-500">Round</span>
                                            <p className="font-medium">{i.round}</p>
                                        </div>
                                    </div>

                                    {/* Job Details */}
                                    <div className="mt-3 text-xs space-y-[2px]">
                                        <span className="text-gray-500">Position</span>
                                        <p className="font-medium">{i.jobOpening?.title}</p>
                                        <p className="text-[11px] text-gray-400">
                                            {i.jobOpening?.jobCode}
                                        </p>
                                    </div>

                                    {/* Panel Members */}
                                    <div className="mt-3 text-xs">
                                        <span className="text-gray-500 block mb-1">Panel</span>
                                        <div className="flex flex-wrap gap-1">
                                            {i.panel.map((p, idx2) => {
                                                const u = p.user;
                                                if (!u) return null;
                                                const fullName = [u.firstName, u.lastName].filter(Boolean).join(" ");
                                                return (
                                                    <span
                                                        key={idx2}
                                                        className="px-2 py-[2px] text-[11px] rounded-full bg-teal-100 text-teal-700
                                 dark:bg-teal-700 dark:text-white"
                                                    >
                                                        {fullName} ({p.role})
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Extra */}
                                    <div className="mt-3 text-xs space-y-[2px]">
                                        <span className="text-gray-500">Mode</span>
                                        <p className="font-medium">{i.interviewType}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};
export default CustomCalendar;