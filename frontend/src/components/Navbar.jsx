import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bell, CheckCheck } from "lucide-react";
import {
    fetchNotifications,
    markNotificationRead,
    markAllNotificationRead,
} from "../features/Notification/notificationSlice";
import ProfileIcon from "../components/common/ProfileIcon";

const Navbar = () => {
    const dispatch = useDispatch();
    const dropdownRef = useRef(null);

    const { user } = useSelector((s) => s.users);
    const { notifications, unread } = useSelector((s) => s.notificationData);

    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (user?.id) dispatch(fetchNotifications(user.id));
    }, [user]);

    // close popup outside click
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
                {/* ----------- Bell Icon ---------- */}
                <div className="relative" ref={dropdownRef}>
                    <button onClick={() => setOpen(!open)}>
                        <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                        {unread > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 
              text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                                {unread}
                            </span>
                        )}
                    </button>

                    {/* ----------- Dropdown ---------- */}
                    {open && (
                        <div className="absolute right-0 mt-3 w-80 max-h-96 bg-white dark:bg-gray-900 
            shadow-lg rounded-lg overflow-hidden z-50">

                            {/* Mark All Read Button */}
                            <div className="flex justify-between p-2 border-b">
                                <span className="font-bold">Notifications</span>
                                <button
                                    className="text-sm text-blue-600 flex items-center gap-1"
                                    onClick={() => dispatch(markAllNotificationRead(user.id))}
                                >
                                    <CheckCheck size={16} /> Mark all read
                                </button>
                            </div>

                            {notifications.length === 0 ? (
                                <div className="p-4 text-gray-500">No notifications</div>
                            ) : (
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        className={`p-3 cursor-pointer border-b 
                    hover:bg-gray-100 dark:hover:bg-gray-800 ${!n.isRead ? "bg-blue-50 dark:bg-blue-900/30" : ""
                                            }`}
                                        onClick={() => dispatch(markNotificationRead(n.id))}
                                    >
                                        <div className="font-semibold">{n.title}</div>
                                        <div className="text-sm">{n.message}</div>
                                        <div className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</div>
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
