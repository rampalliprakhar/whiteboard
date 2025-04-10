import { useState } from "react";
import { useSelector } from 'react-redux';

export const ShareButton = () => {
    const [copied, setCopied] = useState(false);
    const sessionId = useSelector(state => state.session.sessionId);

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
        >
            {copied ? 'Copied!' : 'Share'}
        </button>
    );
};