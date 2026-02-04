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
import NotificationBell from "../components/common/NotificationBell";
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
            <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-300">
                Talent Gate
            </div>

            <div className="flex items-center gap-4">
                <NotificationBell />
                <ProfileIcon />
            </div>
        </nav>
    );
};

export default Navbar;
