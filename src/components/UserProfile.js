import { useState } from 'react';

export const UserProfile = ({ userId }) => {
    const [color] = useState(() => 
        `#${Math.floor(Math.random()*16777215).toString(16)}`
    );

    return (
        <div 
            className="user-profile" 
            style={{ 
                backgroundColor: color,
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '16px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                margin: '0 5px',
                transition: 'transform 0.2s ease',
                cursor: 'pointer',
                ':hover': {
                    transform: 'scale(1.1)'
                }
            }}
        >
            {userId.slice(0, 2).toUpperCase()}
        </div>
    );
};