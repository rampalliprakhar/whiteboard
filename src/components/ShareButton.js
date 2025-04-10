import { useState } from "react";
import { useSelector } from 'react-redux';
import { generateSessionId } from "@/socket";

export const ShareButton = () => {
    const [copied, setCopied] = useState(false);
    const sessionId = useSelector(state => state.session.sessionId) || generateSessionId();

    const handleShare = () => {
        const shareableLink = `${window.location.origin}/whiteboard?session=${sessionId}`;
        navigator.clipboard.writeText(shareableLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button 
            onClick={handleShare}
            className="share-button"
            style={{
                position: 'fixed',
                top: '20px',
                left: '20px',
                padding: '10px 20px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease',
                fontSize: '16px',
                fontWeight: '500',
                zIndex: 1000,
            }}
        >
            {copied ? '✓ Copied!' : '🔗 Share'}
        </button>
    );
};