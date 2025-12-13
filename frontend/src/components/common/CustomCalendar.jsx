import { useState } from "react";

const CustomCalendar = ({ selectedDate, onSelect }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];

    // Empty slots before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null);
    }

    // Actual days
    for (let d = 1; d <= daysInMonth; d++) {
        days.push(d);
    }

    const isSelected = (day) => {
        if (!day || !selectedDate) return false;
        const d = new Date(selectedDate);
        return (
            d.getDate() === day &&
            d.getMonth() === month &&
            d.getFullYear() === year
        );
    };

    const selectDate = (day) => {
        if (!day) return;

        const selected = new Date(year, month, day);

        const yyyy = selected.getFullYear();
        const mm = String(selected.getMonth() + 1).padStart(2, "0");
        const dd = String(selected.getDate()).padStart(2, "0");

        onSelect(`${yyyy}-${mm}-${dd}`);
    };


    return (
        <div className="rounded-lg border bg-white p-3">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-3">
                <button
                    onClick={() =>
                        setCurrentMonth(new Date(year, month - 1, 1))
                    }
                    className="px-2 py-1 text-sm hover:bg-gray-100 rounded"
                >
                    ‹
                </button>

                <span className="font-medium text-sm">
                    {currentMonth.toLocaleString("default", {
                        month: "long",
                    })}{" "}
                    {year}
                </span>

                <button
                    onClick={() =>
                        setCurrentMonth(new Date(year, month + 1, 1))
                    }
                    className="px-2 py-1 text-sm hover:bg-gray-100 rounded"
                >
                    ›
                </button>
            </div>

            {/* WEEK DAYS */}
            <div className="grid grid-cols-7 text-xs text-gray-500 mb-1">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                    <div key={d} className="text-center">
                        {d}
                    </div>
                ))}
            </div>

            {/* DATES */}
            <div className="grid grid-cols-7 gap-1 text-sm">
                {days.map((day, idx) => (
                    <button
                        key={idx}
                        onClick={() => selectDate(day)}
                        disabled={!day}
                        className={`h-9 rounded-md flex items-center justify-center
              ${!day ? "" : "hover:bg-teal-100"}
              ${isSelected(day)
                                ? "bg-teal-600 text-white"
                                : "text-gray-700"
                            }
            `}
                    >
                        {day}
                    </button>
                ))}
            </div>
        </div>
    );
};
export default CustomCalendar;