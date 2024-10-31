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

    const [imageProps, setImageProps] = useState({
        img: null,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        isDragging: false,
        isResizing: false,
    });

    const imageLoadHandler = (img) => {
        setImageProps({
            img,
            x: 50,
            y: 50,
            width: img.width,
            height: img.height,
            isDragging: false,
            isResizing: false,
        });
        redrawCanvas();
    };

    const fileChangeHandler = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => imageLoadHandler(img);
            };
            reader.readAsDataURL(file);
        }
    };

    const dropHandler = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => imageLoadHandler(img);
            };
            reader.readAsDataURL(file);
        }
    };

    const dragOverHandler = (e) => {
        e.preventDefault();
    };

    const drawImage = (context) => {
        if (imageProps.img) {
            context.drawImage(imageProps.img, imageProps.x, imageProps.y, imageProps.width, imageProps.height);
        }
    };

    const redrawCanvas = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawImage(context);
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
            case MENU_OBJECTS.IMPORT:
                document.getElementById('inputFile').click();
                break;
            default:
                break;
        }
        dispatch(clickActionObject(null));
    };

    const handleMouseDown = (e) => {
        const mouseX = e.clientX || (e.touches && e.touches[0].clientX);
        const mouseY = e.clientY || (e.touches && e.touches[0].clientY);
        if (mouseX >= imageProps.x && mouseX <= imageProps.x + imageProps.width &&
            mouseY >= imageProps.y && mouseY <= imageProps.y + imageProps.height) {
            setImageProps((prev) => ({ ...prev, isDragging: true }));
        } else {
            shouldPaint.current = true;
            startPosition(mouseX, mouseY);
            socket.emit('startPosition', { x: mouseX, y: mouseY }); // Emit start position
        }
    };

    const handleMouseMove = (e) => {
        const mouseX = e.clientX || (e.touches && e.touches[0].clientX);
        const mouseY = e.clientY || (e.touches && e.touches[0].clientY);
        if (imageProps.isDragging) {
            setImageProps((prev) => ({
                ...prev,
                x: mouseX - imageProps.width / 2,
                y: mouseY - imageProps.height / 2,
            }));
        } else if (shouldPaint.current) {
            draw(mouseX, mouseY);
            socket.emit('draw', { x: mouseX, y: mouseY, color, size }); // Emit drawing data
        }
    };

    const handleMouseUp = () => {
        if (imageProps.isDragging) {
            setImageProps((prev) => ({ ...prev, isDragging: false }));
        } else {
            shouldPaint.current = false;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            const doodleInfo = context.getImageData(0, 0, canvas.width, canvas.height);
            doodleHistory.current.push(doodleInfo);
            displayHistory.current = doodleHistory.current.length - 1;
            endPosition();
        }
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

        // Emit color and size changes
        const emitColorAndSizeChange = () => {
            socket.emit('changeConfig', { color, size });
        };

        const configHandler = (config) => {
            console.log("config", config);
            changeConfig(config.color, config.size);
        };

        canvas.style.backgroundColor = backgroundColor;

        // Background handler
        const backgroundHandler = (config) => {
            console.log('Changed background color: ', config);
            canvas.style.backgroundColor = config.color;
        };

        changeConfig(color, size);
        socket.on('changeConfig', configHandler);
        socket.on('changeBackground', backgroundHandler);

        return () => {
            socket.off('changeConfig', configHandler);
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
        // Drag and drop
        canvas.addEventListener("dragover", dragOverHandler);
        canvas.addEventListener("drop", dropHandler);

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
            canvas.removeEventListener("dragover", dragOverHandler);
            canvas.removeEventListener("drop", dropHandler);
        };
    }, [canvasSize, imageProps, actionMenuObject, dispatch]);

    return (
        <div>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }}></canvas>
            <input type="file" id="inputFile" style={{ display: 'none' }} onChange={fileChangeHandler} />
            <button onClick={() => document.getElementById('inputFile').click()}>Import Image</button>
        </div>
    );
};

export default Board;