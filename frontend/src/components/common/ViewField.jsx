const ViewField = ({ label, value }) => (
    <div>
        <label className="block text-sm font-medium mb-1">
            {label}
        </label>
        <div className="w-full rounded-md border px-2 py-1 text-sm bg-gray-50 dark:bg-gray-800">
            {value || "—"}
        </div>
    </div>
);

const ViewTextarea = ({ label, value }) => (
    <div>
        <label className="block text-sm font-medium mb-1">
            {label}
        </label>
        <div className="w-full min-h-[90px] rounded-md border px-2 py-1 text-sm bg-gray-50 dark:bg-gray-800 whitespace-pre-wrap">
            {value || "—"}
        </div>
    </div>
);
export { ViewField, ViewTextarea };