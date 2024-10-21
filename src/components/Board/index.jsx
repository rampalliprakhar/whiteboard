import { useRef, useEffect, useState, useCallback} from 'react';
import { useSelector, useDispatch} from 'react-redux';
import { socket } from "@/socket";
import { MENU_OBJECTS } from '@/constant';
import { clickActionObject } from '@/slice/menuSlice';

const Board = () => {
    const dispatch = useDispatch();
    const canvasRef = useRef(null);
    const shouldPaint = useRef(false);
    const doodleHistory = useRef([]);
    const displayHistory = useRef(0);
    const [canvasSize, setCanvasSize] = useState({width: 0, height: 0});
    const {activeMenuObject, actionMenuObject} = useSelector((state) => state.menu);
    const {color, size, backgroundColor} = useSelector((state) => state.tools[activeMenuObject]);
    
    const resizeCanvas = useCallback(() => {
        if (typeof window !== 'undefined') {
            setCanvasSize({ width: window.innerWidth, height: window.innerHeight });
        }
    }, []);

    useEffect(()=>{
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
        resizeCorner: null,
    });

    const fileChangeHandler = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => {
                    setImageProps({
                        img: img,
                        x: 50,
                        y: 50,
                        width: img.width,
                        height: img.height,
                        isDragging: false,
                        isResizing: false,
                        resizeCorner: null,
                    });
                };
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
                img.onload = () => {
                    setImageProps({
                        img: img,
                        x: 50,
                        y: 50,
                        width: img.width,
                        height: img.height,
                        isDragging: false,
                        isResizing: false,
                        resizeCorner: null,
                    });
                };
            };
            reader.readAsDataURL(file);
        }
    };

    const dragOverHandler = (e) => {
        e.preventDefault();
    };

    useEffect(()=>{
        if(actionMenuObject === MENU_OBJECTS.IMPORT){
            document.getElementById('inputFile').click();
        }
    },[actionMenuObject]);
    
    useEffect(()=>{
        if(!canvasRef.current) return;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Function for reset
        const clearDrawing = () =>{
            context.clearRect(0,0,canvas.width, canvas.height);
        };

        const drawImage = () => {
            if (imageProps.img) {
                context.drawImage(imageProps.img, imageProps.x, imageProps.y, imageProps.width, imageProps.height);
                drawResizeHandler();
            }
        };

        const drawResizeHandler = () => {
            if (imageProps.img) {
                const sizeHandle = 10;
                context.fillStyle = 'red';
                // Draw corners
                context.fillRect(imageProps.x - sizeHandle / 2, imageProps.y - sizeHandle / 2, sizeHandle, sizeHandle); // Top-left
                context.fillRect(imageProps.x + imageProps.width - sizeHandle / 2, imageProps.y - sizeHandle / 2, sizeHandle, sizeHandle); // Top-right
                context.fillRect(imageProps.x - sizeHandle / 2, imageProps.y + imageProps.height - sizeHandle / 2, sizeHandle, sizeHandle); // Bottom-left
                context.fillRect(imageProps.x + imageProps.width - sizeHandle / 2, imageProps.y + imageProps.height - sizeHandle / 2, sizeHandle, sizeHandle); // Bottom-right
            }
        };

        const redrawCanvas = () => {
            clearDrawing();
            drawImage();
        };

        // Check whether the save button is pressed
        if (actionMenuObject === MENU_OBJECTS.SAVE) 
        {
            // Create a constant object that converts the canvas data
            const imgURL = canvas.toDataURL();
            // Create an anchor
            const image = document.createElement('a');
            image.href = imgURL;
            image.download = 'image.jpg';
            image.click();
        }

        // Check whether undo or redo button is pressed
        else if(actionMenuObject === MENU_OBJECTS.UNDO || actionMenuObject === MENU_OBJECTS.REDO)
        {
            // if more drawings are made other than empty, and user presses the Undo button, go back to the previous drawing stored
            if(displayHistory.current > 0 && actionMenuObject === MENU_OBJECTS.UNDO) displayHistory.current -= 1;
            // if the previous amount of stroke is less than the current stroke, and the user presses the redo button, go to the recent drawing stored
            else if(displayHistory.current < doodleHistory.current.length-1 && actionMenuObject === MENU_OBJECTS.REDO) displayHistory.current += 1;
            // make a variable that stores the stroke data
            const doodleData = doodleHistory.current[displayHistory.current];
            // returns an ImageData object (doodleData) representing the underlying pixel data for a specified portion of the canvas.
            context.putImageData(doodleData, 0, 0);
        }
        else if(actionMenuObject === MENU_OBJECTS.CLEAR)
        {
            clearDrawing();
        }

        dispatch(clickActionObject(null));
        redrawCanvas();
    }, [actionMenuObject, dispatch, imageProps]);

    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Resuable method to manipulate color and brush size
        const changeConfig = (color, size) => {
            context.strokeStyle = color;
            context.lineWidth = size;
        };

        const configHandler = (config) => {
            console.log("config", config);
            changeConfig(config.color, config.size);
        };

        // create background color
        canvas.style.backgroundColor = backgroundColor;
        // background handler
        const backgroundHandler = (config) =>{
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
        if(!canvasRef.current) return;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // When adding elements in DOM
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Redraw content if necessary
        if (doodleHistory.current.length > 0) {
            const lastDoodle = doodleHistory.current[displayHistory.current];
            context.putImageData(lastDoodle, 0, 0);
        };

        const startPosition = (x, y) => {
            context.beginPath();
            context.moveTo(x, y);
        };

        const draw = (x, y) => {
            context.lineTo(x, y);
            context.strokeStyle = color; // Set the stroke color
            context.lineWidth = size; // Set the stroke size
            context.stroke();
        };

        // ending point of the stroke
        const endPosition = (x, y) => {
            context.beginPath();
        };
        
        const handleMouseDown = (e) => {
            const mouseX = e.clientX || e.touches[0].clientX;
            const mouseY = e.clientY || e.touches[0].clientY;

            if (imageProps.img) {
                if (mouseX >= imageProps.x && mouseX <= imageProps.x + imageProps.width &&
                    mouseY >= imageProps.y && mouseY <= imageProps.y + imageProps.height) {
                    if (isOverResizeHandle(mouseX, mouseY)) {
                        setImageProps((prev) => ({
                            ...prev,
                            isResizing: true,
                            resizeCorner: getResizeCorner(mouseX, mouseY),
                        }));
                    } else {
                        setImageProps((prev) => ({
                            ...prev,
                            isDragging: true,
                        }));
                    }
                }
            } else {
                shouldPaint.current = true;
                startPosition(mouseX, mouseY);
                socket.emit('startPosition', { x: mouseX, y: mouseY });
            }
        };

        const handleMouseMove = (e) => {
            const mouseX = e.clientX || e.touches[0].clientX;
            const mouseY = e.clientY || e.touches[0].clientY;

            if (imageProps.isDragging) {
                setImageProps((prev) => ({
                    ...prev,
                    x: mouseX - imageProps.width / 2,
                    y: mouseY - imageProps.height / 2,
                }));
            } else if (imageProps.isResizing) {
                resizeImage(mouseX, mouseY);
            } else if (shouldPaint.current) {
                draw(mouseX, mouseY);
                socket.emit('draw', { x: mouseX, y: mouseY });
            }
        };

        const handleMouseUp = () => {
            if (imageProps.isDragging) {
                setImageProps((prev) => ({ ...prev, isDragging: false }));
            } else if (imageProps.isResizing) {
                setImageProps((prev) => ({ ...prev, isResizing: false }));
            } else {
                shouldPaint.current = false;
                const doodleInfo = context.getImageData(0, 0, canvas.width, canvas.height);
                doodleHistory.current.push(doodleInfo);
                displayHistory.current = doodleHistory.current.length - 1;
                endPosition();
            }
        }; 
        
        const startPositionHandler = (path) => {
            startPosition(path.x, path.y);
        };

        const drawHandler = (path) => {
            draw(path.x, path.y);
        };

        const isOverResizeHandle = (mouseX, mouseY) => {
            const sizeHandle = 10;
            return (
                (mouseX >= imageProps.x - sizeHandle / 2 && mouseY >= imageProps.y - sizeHandle / 2 && mouseX <= imageProps.x + sizeHandle / 2 && mouseY <= imageProps.y + sizeHandle / 2) || // Top-left
                (mouseX >= imageProps.x + imageProps.width - sizeHandle / 2 && mouseY >= imageProps.y - sizeHandle / 2 && mouseX <= imageProps.x + imageProps.width + sizeHandle / 2 && mouseY <= imageProps.y + sizeHandle / 2) || // Top-right
                (mouseX >= imageProps.x - sizeHandle / 2 && mouseY >= imageProps.y + imageProps.height - sizeHandle / 2 && mouseX <= imageProps.x + sizeHandle / 2 && mouseY <= imageProps.y + imageProps.height + sizeHandle / 2) || // Bottom-left
                (mouseX >= imageProps.x + imageProps.width - sizeHandle / 2 && mouseY >= imageProps.y + imageProps.height - sizeHandle / 2 && mouseX <= imageProps.x + imageProps.width + sizeHandle / 2 && mouseY <= imageProps.y + imageProps.height + sizeHandle / 2) // Bottom-right
            );
        };

        const getResizeCorner = (mouseX, mouseY) => {
            const sizeHandle = 10; // Size of the resize handles
            if (mouseX >= imageProps.x - sizeHandle / 2 && mouseY >= imageProps.y - sizeHandle / 2) return 'top-left';
            if (mouseX >= imageProps.x + imageProps.width - sizeHandle / 2 && mouseY >= imageProps.y - sizeHandle / 2) return 'top-right';
            if (mouseX >= imageProps.x - sizeHandle / 2 && mouseY >= imageProps.y + imageProps.height - sizeHandle / 2) return 'bottom-left';
            if (mouseX >= imageProps.x + imageProps.width - sizeHandle / 2 && mouseY >= imageProps.y + imageProps.height - sizeHandle / 2) return 'bottom-right';
            return null;
        };

        const resizeImage = (mouseX, mouseY) => {
            if (!imageProps.img) return; // Prevent resizing if image is not loaded

            const corner = imageProps.resizeCorner;
            if (corner === 'top-left') {
                const newWidth = imageProps.width - (mouseX - imageProps.x);
                const newHeight = imageProps.height - (mouseY - imageProps.y);
                setImageProps((prev) => ({
                    ...prev,
                    x: mouseX,
                    y: mouseY,
                    width: newWidth > 0 ? newWidth : 1, // Prevent negative width
                    height: newHeight > 0 ? newHeight : 1, // Prevent negative height
                }));
            } else if (corner === 'top-right') {
                const newWidth = mouseX - imageProps.x;
                const newHeight = imageProps.height - (mouseY - imageProps.y);
                setImageProps((prev) => ({
                    ...prev,
                    width: newWidth > 0 ? newWidth : 1,
                    height: newHeight > 0 ? newHeight : 1,
                }));
            } else if (corner === 'bottom-left') {
                const newWidth = imageProps.width - (mouseX - imageProps.x);
                const newHeight = mouseY - imageProps.y;
                setImageProps((prev) => ({
                    ...prev,
                    x: mouseX,
                    height: newHeight > 0 ? newHeight : 1,
                    width: newWidth > 0 ? newWidth : 1,
                }));
            } else if (corner === 'bottom-right') {
                const newWidth = mouseX - imageProps.x;
                const newHeight = mouseY - imageProps.y;
                setImageProps((prev) => ({
                    ...prev,
                    width: newWidth > 0 ? newWidth : 1,
                    height: newHeight > 0 ? newHeight : 1,
                }));
            }
        };

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

        socket.on('startPosition', startPositionHandler);
        socket.on('draw', drawHandler);

        // Function to remove the listeners
        return () => {
            canvas.removeEventListener("mousedown", handleMouseDown);
            canvas.removeEventListener("mousemove", handleMouseMove);
            canvas.removeEventListener("mouseup", handleMouseUp);

            canvas.removeEventListener("touchstart", handleMouseDown);
            canvas.removeEventListener("touchmove", handleMouseMove);
            canvas.removeEventListener("touchend", handleMouseUp);

            canvas.removeEventListener("dragover", dragOverHandler);
            canvas.removeEventListener("drop", dropHandler);

            socket.off('startPosition', startPositionHandler);
            socket.off('draw', drawHandler);
        }
    }, [canvasSize, imageProps, color, size]);
    return (
        <div>
            <canvas ref = {canvasRef} style={{width:'100%', height:'100%'}}></canvas>
            <input type="file" id="inputFile" style={{display: 'none'}} onChange={fileChangeHandler}/>
            <button onClick={() => document.getElementById('inputFile').click()}>Import Image</button>
        </div>
    );
};
export default Board;