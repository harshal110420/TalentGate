import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import {
    fetchNotifications,
    markNotificationRead,
    markAllNotificationRead,
    deleteNotification,
} from "../features/Notification/notificationSlice";
import ProfileIcon from "../components/common/ProfileIcon";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
    const dispatch = useDispatch();
    const dropdownRef = useRef(null);
    const { user } = useAuth();
    const fetchedRef = useRef(false);
    const { notifications, unread } = useSelector(
        (state) => state.notificationData
    );

    const [open, setOpen] = useState(false);
    const [deletedIds, setDeletedIds] = useState([]);

    // Animation → then delete
    const handleDelete = (id) => {
        setDeletedIds((prev) => [...prev, id]);
        setTimeout(() => dispatch(deleteNotification(id)), 300);
    };

    // Load notifications on mount
    useEffect(() => {
        if (user?.id && !fetchedRef.current) {
            dispatch(fetchNotifications(user.id));
            fetchedRef.current = true;
        }
    }, [user?.id, dispatch]);

    // Close dropdown on outside click
    useEffect(() => {
        const close = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-md py-3 px-6 flex justify-between items-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                Talent Gate
            </div>

            <div className="flex items-center gap-4 relative">
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setOpen(!open)}
                        className="relative flex items-center"
                    >
                        <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                        {unread > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                                {unread}
                            </span>
                        )}
                    </button>

                    {/* Dropdown */}
                    {open && (
                        <div className="absolute right-0 mt-3 w-80 max-h-96 bg-white dark:bg-gray-900 shadow-lg rounded-lg overflow-auto z-50">
                            {/* Header */}
                            <div className="flex justify-between p-2 border-b">
                                <span className="font-bold">Notifications</span>
                                <button
                                    className="text-sm text-blue-600 flex items-center gap-1"
                                    onClick={() => dispatch(markAllNotificationRead(user.id))}
                                >
                                    <CheckCheck size={16} /> Mark all read
                                </button>
                            </div>

                            {/* List */}
                            {notifications.length === 0 ? (
                                <div className="p-4 text-gray-500">No notifications</div>
                            ) : (
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        className={`notification-card flex justify-between items-start gap-3 p-3 border-b
                                        hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150
                                        ${!n.isRead ? "bg-blue-50 dark:bg-blue-900/30" : ""}
                                        ${deletedIds.includes(n.id) ? "slide-delete" : ""}`}
                                    >
                                        <div
                                            className="flex-1 cursor-pointer"
                                            onClick={() => dispatch(markNotificationRead(n.id))}
                                        >
                                            <div className="font-semibold">{n.title}</div>
                                            <div className="text-sm">{n.message}</div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(n.createdAt).toLocaleString()}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleDelete(n.id)}
                                            className="text-red-500 hover:text-red-700 transition-transform duration-200 hover:scale-110"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                <ProfileIcon />
            </div>
        </nav>
    );
};

export default Navbar;
