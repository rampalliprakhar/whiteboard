import { UserProfile } from "./UserProfile";

export const UsersList = ({ connectedUsers }) => {
    return (
        <div 
            className="users-list"
            style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                display: 'flex',
                gap: '10px',
                padding: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '30px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                zIndex: 1000,
            }}
        >
            {connectedUsers.map(userId => (
                <UserProfile key={userId} userId={userId} />
            ))}
        </div>
    );
};