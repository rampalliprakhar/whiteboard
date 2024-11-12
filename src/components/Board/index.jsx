import { useRef, useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { socket } from "@/socket";
import { MENU_OBJECTS } from '@/constant';
import { clickActionObject } from '@/slice/menuSlice';

const Board = () => {
    const dispatch = useDispatch();
    const canvasRef = useRef(null);
    const shouldPaint = useRef(false);
    const doodleHistory = useRef([]);
    const displayHistory = useRef(0);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const { activeMenuObject, actionMenuObject } = useSelector((state) => state.menu);
    const { color, size, backgroundColor } = useSelector((state) => state.tools[activeMenuObject]);
    const [alertMessage, setAlertMessage] = useState('');
    const [userId, setUserId] = useState(socket.id);

    const resizeCanvas = useCallback(() => {
        if (typeof window !== 'undefined' && canvasRef.current) {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            
            // Store the current drawing
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            
            // Update dimensions
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            // Restore the drawing
            context.putImageData(imageData, 0, 0);
            
            // Restore context settings
            context.strokeStyle = color;
            context.lineWidth = size;
            context.lineCap = 'round';
            context.lineJoin = 'round';
            
            setCanvasSize({ width: canvas.width, height: canvas.height });
        }
    }, [color, size]);

    useEffect(() => {
        socket.on('alert', ({ message }) => {
            setAlertMessage(message);
        });

        // Cleanup on component unmount
        return () => {
            socket.off('alert');
        };
    }, []);


    // Add a debounced resize handler to prevent too frequent updates
    useEffect(() => {
        let resizeTimeout;
        const debouncedResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(resizeCanvas, 100);
        };

        // Initial setup
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            setCanvasSize({ width: canvas.width, height: canvas.height });
        }

        window.addEventListener('resize', debouncedResize);
        return () => {
            window.removeEventListener('resize', debouncedResize);
            clearTimeout(resizeTimeout);
        };
    }, [resizeCanvas]);

    const redrawCanvas = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        if (doodleHistory.current.length > 0 && displayHistory.current >= 0) {
            const lastDoodle = doodleHistory.current[displayHistory.current];
            context.putImageData(lastDoodle, 0, 0);
        }
    };

    // Combined effect for color, size, and background changes
    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Store current drawing
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        // Update context settings
        context.strokeStyle = color;
        context.lineWidth = size;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        
        // Restore drawing
        context.putImageData(imageData, 0, 0);
        
        // Update background
        canvas.style.backgroundColor = backgroundColor;

        // Background handler
        const backgroundHandler = (config) => {
            canvas.style.backgroundColor = config.color;
        };

        socket.on('changeBackground', backgroundHandler);
        return () => socket.off('changeBackground', backgroundHandler);
    }, [color, size, backgroundColor]);

    const clearDrawing = (context) => {
        const canvas = canvasRef.current;
        context.clearRect(0, 0, canvas.width, canvas.height);
        doodleHistory.current = []; // Clear the history
        displayHistory.current = 0; // Reset display history
    };

    const saveImage = (canvas) => {
        const imgURL = canvas.toDataURL();
        const image = document.createElement('a');
        image.href = imgURL;
        image.download = 'image.jpg';
        image.click();
    };

    // Drawing functions remain the same but with simplified scaling
    const startPosition = (x, y) => {
        const context = canvasRef.current.getContext('2d');
        context.beginPath();
        context.moveTo(x, y);
    };

    const draw = (x, y, color) => {
        const context = canvasRef.current.getContext('2d');
        context.strokeStyle = color;
        context.lineWidth = size;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.lineTo(x, y);
        context.stroke();          
        context.beginPath();
        context.moveTo(x, y);
    };

    const endPosition = () => {
        shouldPaint.current = false;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const doodleInfo = context.getImageData(0, 0, canvas.width, canvas.height);
        context.beginPath();
        socket.emit('stopDrawing', userId);  // Notify server when the user stops drawing
    };

    const actionMenuHandler = (context) => {
        const canvas = canvasRef.current;
        switch (actionMenuObject) {
            case MENU_OBJECTS.SAVE:
                saveImage(canvas);
                break;
            case MENU_OBJECTS.UNDO:
                if (displayHistory.current > 0) {
                    displayHistory.current -= 1;
                    redrawCanvas(); // Add this
                }
                break;
            case MENU_OBJECTS.REDO:
                if (displayHistory.current < doodleHistory.current.length - 1) {
                    displayHistory.current += 1;
                    redrawCanvas(); // Add this
                }
                break;
            case MENU_OBJECTS.CLEAR:
                clearDrawing(context);
                socket.emit('clear'); // Add this to sync clearing
                break;
            default:
                break;
        }
        dispatch(clickActionObject(null));
    };

    // Update the color change effect to preserve drawing
    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Store current settings
        const currentImageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        // Update context settings
        context.strokeStyle = color;
        context.lineWidth = size;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        
        // Restore the drawing
        context.putImageData(currentImageData, 0, 0);

        // Update background
        canvas.style.backgroundColor = backgroundColor;
    }, [color, size, backgroundColor]);

    // Update mouse/touch event handlers to handle scaling
    // Mouse/touch event handlers with proper scaling
    const handleMouseDown = (e) => {
        e.preventDefault();
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;
        
        shouldPaint.current = true;
        startPosition(x, y);
        socket.emit('startPosition', { userId });
    };

    const handleMouseMove = (e) => {
        e.preventDefault();
        if (!shouldPaint.current) return;
        
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;
        
        const drawColor = alertMessage === 'Two users are drawing at the same time!' ? '#FF0000' : color;
        draw(x, y, drawColor);
        socket.emit('draw', { x, y, color:drawColor, size, userId });
    };

    const handleMouseUp = () => {
        shouldPaint.current = false;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const doodleInfo = context.getImageData(0, 0, canvas.width, canvas.height);
        doodleHistory.current.push(doodleInfo);
        displayHistory.current = doodleHistory.current.length - 1;
        context.beginPath();
        endPosition();
    };

    // Socket event handlers
    useEffect(() => {
        socket.on('startPosition', ({ x, y }) => {
            if (!canvasRef.current) return;
            startPosition(x, y);
        });

        socket.on('draw', ({ x, y, color, size }) => {
            if (!canvasRef.current) return;
            const context = canvasRef.current.getContext('2d');
            
            // Store current settings
            const currentColor = context.strokeStyle;
            const currentSize = context.lineWidth;
            
            // Apply received settings
            context.strokeStyle = color;
            context.lineWidth = size;
            
            // Draw
            context.lineTo(x, y);
            context.stroke();
            context.beginPath();
            context.moveTo(x, y);
            
            // Restore settings
            context.strokeStyle = currentColor;
            context.lineWidth = currentSize;
        });

        return () => {
            socket.off('startPosition');
            socket.off('draw');
        };
    }, []);


    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Resuable method to manipulate color and brush size
        const changeConfig = (color, size) => {
            context.strokeStyle = color; // Update stroke color
            context.lineWidth = size; // Update line width
        };

        canvas.style.backgroundColor = backgroundColor;

        // Background handler
        const backgroundHandler = (config) => {
            console.log('Changed background color: ', config);
            canvas.style.backgroundColor = config.color;
        };

        changeConfig(color, size);
        socket.on('changeBackground', backgroundHandler);

        return () => {
            socket.off('changeBackground', backgroundHandler);
        };
    }, [color, size, backgroundColor]);

    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Set canvas dimensions
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Draw the last doodle if available
        if (doodleHistory.current.length > 0 && displayHistory.current >= 0) {
            const lastDoodle = doodleHistory.current[displayHistory.current];
            context.putImageData(lastDoodle, 0, 0);
        }

        // Mouse control
        canvas.addEventListener("mousedown", handleMouseDown);
        canvas.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("mouseup", handleMouseUp);
        // Mobile control
        canvas.addEventListener("touchstart", handleMouseDown);
        canvas.addEventListener("touchmove", handleMouseMove);
        canvas.addEventListener("touchend", handleMouseUp);

        // Handle Action Menu
        actionMenuHandler(context);

        // Cleanup
        return () => {
            canvas.removeEventListener("mousedown", handleMouseDown);
            canvas.removeEventListener("mousemove", handleMouseMove);
            canvas.removeEventListener("mouseup", handleMouseUp);
            canvas.removeEventListener("touchstart", handleMouseDown);
            canvas.removeEventListener("touchmove", handleMouseMove);
            canvas.removeEventListener("touchend", handleMouseUp);
        };
    }, [canvasSize, actionMenuObject, dispatch, handleMouseDown, handleMouseMove, handleMouseUp]);

    return (
        <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
            {alertMessage && <div className="alert">{alertMessage}</div>}
            <canvas 
                ref={canvasRef} 
                style={{ 
                    width: '100%', 
                    height: '100%',
                    touchAction: 'none',
                    border: '2px solid black',
                }}
            />
        </div>
    );
};

export default Board;