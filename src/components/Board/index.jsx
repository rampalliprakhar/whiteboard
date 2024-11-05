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

    const resizeCanvas = useCallback(() => {
        if (typeof window !== 'undefined' && canvasRef.current) {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            const tempCanvas = document.createElement('canvas');
            const tempContext = tempCanvas.getContext('2d');
            
            // Save the current drawing
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            tempContext.drawImage(canvas, 0, 0);
            
            // Get the new dimensions
            const newWidth = window.innerWidth;
            const newHeight = window.innerHeight;
            
            // Calculate scale factors
            const scaleX = newWidth / canvas.width;
            const scaleY = newHeight / canvas.height;
            
            // Resize canvas
            canvas.width = newWidth;
            canvas.height = newHeight;
            
            // Scale and restore the drawing
            context.scale(scaleX, scaleY);
            context.drawImage(tempCanvas, 0, 0);
            context.scale(1/scaleX, 1/scaleY); // Reset scale
            
            // Restore context settings
            context.strokeStyle = color;
            context.lineWidth = size;
            context.lineCap = 'round';
            context.lineJoin = 'round';
            
            // Update canvas size state
            setCanvasSize({ width: newWidth, height: newHeight });
        }
    }, [color, size]);

    // Add a debounced resize handler to prevent too frequent updates
    useEffect(() => {
        let resizeTimeout;
        const debouncedResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(resizeCanvas, 100);
        };

        window.addEventListener('resize', debouncedResize);
        return () => {
            window.removeEventListener('resize', debouncedResize);
            clearTimeout(resizeTimeout);
        };
    }, [resizeCanvas]);

    useEffect(() => {
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        return () => {
            window.removeEventListener('resize', resizeCanvas);
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

    const startPosition = (x, y) => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.beginPath();
        context.moveTo(x, y);
    };

    // Update the draw function to handle scaling
    const draw = (x, y) => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        // Calculate scale factors
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        // Apply scaling to coordinates
        const scaledX = x * scaleX;
        const scaledY = y * scaleY;
        
        context.strokeStyle = color;
        context.lineWidth = size;
        context.lineTo(scaledX, scaledY);
        context.stroke();
    };

    const endPosition = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.beginPath();
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

    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        // Set initial drawing settings
        context.strokeStyle = color;
        context.lineWidth = size;
        context.lineCap = 'round';
        context.lineJoin = 'round';
    }, [color, size]);

    // Update mouse/touch event handlers to handle scaling
    const handleMouseDown = (e) => {
        e.preventDefault();
        const rect = canvasRef.current.getBoundingClientRect();
        const scaleX = canvasRef.current.width / rect.width;
        const scaleY = canvasRef.current.height / rect.height;
        
        const mouseX = ((e.clientX || (e.touches && e.touches[0].clientX)) - rect.left);
        const mouseY = ((e.clientY || (e.touches && e.touches[0].clientY)) - rect.top);
        
        shouldPaint.current = true;
        startPosition(mouseX * scaleX, mouseY * scaleY);
        socket.emit('startPosition', { x: mouseX * scaleX, y: mouseY * scaleY });
    };

    const handleMouseMove = (e) => {
        e.preventDefault();
        if (!shouldPaint.current) return;
        
        const rect = canvasRef.current.getBoundingClientRect();
        const scaleX = canvasRef.current.width / rect.width;
        const scaleY = canvasRef.current.height / rect.height;
        
        const mouseX = ((e.clientX || (e.touches && e.touches[0].clientX)) - rect.left);
        const mouseY = ((e.clientY || (e.touches && e.touches[0].clientY)) - rect.top);
        
        draw(mouseX, mouseY);
        socket.emit('draw', { 
            x: mouseX * scaleX, 
            y: mouseY * scaleY, 
            color, 
            size 
        });
    };

    const handleMouseUp = () => {
        shouldPaint.current = false;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const doodleInfo = context.getImageData(0, 0, canvas.width, canvas.height);
        doodleHistory.current.push(doodleInfo);
        displayHistory.current = doodleHistory.current.length - 1;
        endPosition();
    };

    useEffect(() => {
        socket.on('startPosition', ({ x, y }) => {
            const rect = canvasRef.current.getBoundingClientRect();
            const scaleX = rect.width / canvasRef.current.width;
            const scaleY = rect.height / canvasRef.current.height;
            startPosition(x * scaleX, y * scaleY);
        });

        socket.on('draw', ({ x, y, color, size }) => {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            const rect = canvas.getBoundingClientRect();
            const scaleX = rect.width / canvas.width;
            const scaleY = rect.height / canvas.height;
            
            context.strokeStyle = color;
            context.lineWidth = size;
            context.lineTo(x * scaleX, y * scaleY);
            context.stroke();
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
            <canvas 
                ref={canvasRef} 
                style={{ 
                    width: '100%', 
                    height: '100%',
                    touchAction: 'none' // Prevent default touch actions
                }}
            />
        </div>
    );
};

export default Board;