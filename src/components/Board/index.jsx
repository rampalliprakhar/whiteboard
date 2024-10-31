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
        if (typeof window !== 'undefined') {
            setCanvasSize({ width: window.innerWidth, height: window.innerHeight });
        }
    }, []);

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

    const draw = (x, y) => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.lineWidth = size; // Use the current size from the state
        context.lineTo(x, y);
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
                if (displayHistory.current > 0) displayHistory.current -= 1;
                break;
            case MENU_OBJECTS.REDO:
                if (displayHistory.current < doodleHistory.current.length - 1) displayHistory.current += 1;
                break;
            case MENU_OBJECTS.CLEAR:
                clearDrawing(context);
                break;
            default:
                break;
        }
        dispatch(clickActionObject(null));
    };

    const handleMouseDown = (e) => {
        const mouseX = e.clientX || (e.touches && e.touches[0].clientX);
        const mouseY = e.clientY || (e.touches && e.touches[0].clientY);
        shouldPaint.current = true;
        startPosition(mouseX, mouseY);
        socket.emit('startPosition', { x: mouseX, y: mouseY }); // Emit start position
    };

    const handleMouseMove = (e) => {
        const mouseX = e.clientX || (e.touches && e.touches[0].clientX);
        const mouseY = e.clientY || (e.touches && e.touches[0].clientY);
        if (shouldPaint.current) {
            draw(mouseX, mouseY);
            socket.emit('draw', { x: mouseX, y: mouseY, color, size }); // Emit drawing data
        }
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
        socket.on('draw', ({ x, y, color, size }) => {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            context.strokeStyle = color;
            context.lineWidth = size;
            context.lineTo(x, y);
            context.stroke();
        });

        return () => {
            socket.off('draw'); // Clean up the listener
        };
    }, []);

    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Resuable method to manipulate color and brush size
        const changeConfig = (color, size) => {
            context.strokeStyle = color;
            context.lineWidth = size;
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
    }, [canvasSize, actionMenuObject, dispatch]);

    return (
        <div>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }}></canvas>
        </div>
    );
};

export default Board;