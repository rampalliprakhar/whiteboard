import { useRef, useEffect} from 'react';
import { useSelector, useDispatch} from 'react-redux';
import { socket } from "@/socket";
import { MENU_OBJECTS } from '@/constant';
import { clickActionObject } from '@/slice/menuSlice';

const Board = () => {
    const dispatch = useDispatch()
    const canvasRef = useRef(null)
    const shouldPaint = useRef(false)
    const doodleHistory = useRef([])
    const displayHistory = useRef(0)
    const {activeMenuObject, actionMenuObject} = useSelector((state) => state.menu)
    const {color, size, backgroundColor} = useSelector((state) => state.tools[activeMenuObject])
    
    useEffect(()=>{
        if(!canvasRef.current) return
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        // Function for reset
        const clearDrawing = () =>{
            context.clearRect(0,0,canvas.width, canvas.height)
        }
        // Check whether the save button is pressed
        if (actionMenuObject === MENU_OBJECTS.SAVE) 
        {
            // Create a constant object that converts the canvas data
            const imgURL = canvas.toDataURL()
            // Create an anchor
            const image = document.createElement('a')
            image.href = imgURL
            image.download = 'image.jpg'
            image.click()
        }
        // Check whether undo or redo button is pressed
        else if(actionMenuObject === MENU_OBJECTS.UNDO || actionMenuObject === MENU_OBJECTS.REDO)
        {
            // if more drawings are made other than empty, and user presses the Undo button, go back to the previous drawing stored
            if(displayHistory.current > 0 && actionMenuObject === MENU_OBJECTS.UNDO) displayHistory.current -= 1
            // if the previous amount of stroke is less than the current stroke, and the user presses the redo button, go to the recent drawing stored
            else if(displayHistory.current < doodleHistory.current.length-1 && actionMenuObject === MENU_OBJECTS.REDO) displayHistory.current += 1
            // make a variable that stores the stroke data
            const doodleData = doodleHistory.current[displayHistory.current]
            // returns an ImageData object (doodleData) representing the underlying pixel data for a specified portion of the canvas.
            context.putImageData(doodleData, 0, 0)
        }
        else if(actionMenuObject === MENU_OBJECTS.CLEAR)
        {
            clearDrawing()
        }
        dispatch(clickActionObject(null))
    }, [actionMenuObject, dispatch])

    useEffect(() => {
        if (!canvasRef.current) return
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d')

        // Resuable method to manipulate color and brush size
        const changeConfig = (color, size) => {
            context.strokeStyle = color
            context.lineWidth = size
        }
        const configHandler = (config) => {
            console.log("config", config)
            changeConfig(config.color, config.size)
        }
        canvas.style.backgroundColor = backgroundColor
        // background handler
        const backgroundHandler = (config) =>{
            console.log('Changed background color: ', config)
            canvas.style.backgroundColor = config.color
        }
        changeConfig(color, size)
        socket.on('changeConfig', configHandler)
        socket.on('changeBackground', backgroundHandler)
        // create background color

        return () => {
            socket.off('changeConfig', configHandler)
            socket.off('changeBackground', backgroundHandler)
        }

    }, [color, size, backgroundColor])

    useEffect(() => {
        if(!canvasRef.current) return
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // When adding elements in DOM
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const startPosition = (x, y) => {
            context.beginPath()
            context.moveTo(x, y)
        }
        const draw = (x, y) => {
            context.lineTo(x, y)
            context.stroke()
        }
        // ending point of the stroke
        const endPosition = (x, y) => {
            context.beginPath();
        }
        const handleMouseDown = (e) => {
            shouldPaint.current = true
            startPosition(e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY)
            socket.emit('startPosition', {x: e.clientX || e.touches[0].clientX, y: e.clientY || e.touches[0].clientY})
        }

        const handleMouseMove = (e) => {
            if (!shouldPaint.current) return
            draw(e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY)
            socket.emit('draw', {x: e.clientX || e.touches[0].clientX, y: e.clientY || e.touches[0].clientY})
        }

        const handleMouseUp = (e) => {
            shouldPaint.current = false
            const doodleInfo = context.getImageData(0, 0, canvas.width, canvas.height)
            doodleHistory.current.push(doodleInfo)
            displayHistory.current = doodleHistory.current.length - 1
            endPosition()
        }        
        
        const startPositionHandler = (path) => {
            startPosition(path.x, path.y)
        }

        const drawHandler = (path) => {
            draw(path.x, path.y)
        }

        // Mouse control
        canvas.addEventListener("mousedown", handleMouseDown)
        canvas.addEventListener("mousemove", handleMouseMove)
        canvas.addEventListener("mouseup", handleMouseUp)

        // Mobile control
        canvas.addEventListener("touchstart", handleMouseDown)
        canvas.addEventListener("touchmove", handleMouseMove)
        canvas.addEventListener("touchend", handleMouseUp)

        socket.on('startPosition', startPositionHandler)
        socket.on('draw', drawHandler)

        // Function to remove the listeners
        return () => {
            canvas.removeEventListener("mousedown", handleMouseDown)
            canvas.removeEventListener("mousemove", handleMouseMove)
            canvas.removeEventListener("mouseup", handleMouseUp)

            canvas.removeEventListener("touchstart", handleMouseDown)
            canvas.removeEventListener("touchmove", handleMouseMove)
            canvas.removeEventListener("touchend", handleMouseUp)

            socket.off('startPosition', startPositionHandler)
            socket.off('draw', drawHandler)
        }
    }, [])
    return (
        <canvas ref = {canvasRef}></canvas>
    )
}
export default Board;