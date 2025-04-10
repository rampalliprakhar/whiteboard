import { UserProfile } from "./UserProfile";

export const UsersList = ({ connectedUsers }) => {
    return (
        <div className="users-list">
            {connectedUsers.map(userId => (
                <UserProfile key={userId} userId={userId} />
            ))}
        </div>
    );
};