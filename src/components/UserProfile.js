import { useState, useEffect } from 'react';

export const UserProfile = ({ userId }) => {
    const [color] = useState(() => 
        `#${Math.floor(Math.random()*16777215).toString(16)}`
    );

    return (
        <div className="user-profile" style={{ backgroundColor: color }}>
            {userId.slice(0, 2).toUpperCase()}
        </div>
    );
};