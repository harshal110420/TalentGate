import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../../../features/users/userSlice";
import UserPermissionForm from "./UserPermissionForm";

const UserPermissionWrapper = () => {
    const { userId } = useParams();        // ✅ Correct param
    const dispatch = useDispatch();
    const { userList } = useSelector((state) => state.users);

    useEffect(() => {
        if (!userList || userList.length === 0) {
            dispatch(fetchUsers());
        }
    }, [dispatch, userList]);

    const selectedUser = userList.find(
        (u) => String(u.id) === String(userId)
    );
    console.log("selected user:", selectedUser)
    if (!selectedUser) {
        return <div className="p-6 text-center">Loading user...</div>;
    }

    return <UserPermissionForm selectedUser={selectedUser} />;
};

export default UserPermissionWrapper;
