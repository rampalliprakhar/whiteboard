import { useRef, useEffect, useLayoutEffect } from 'react';
import styles from './index.module.css';
import { useSelector, useDispatch} from 'react-redux';
import { MENU_OBJECTS } from '@/constant';
import { clickActionObject } from '@/slice/menuSlice';

const Board = () => {
    const dispatch = useDispatch()
    const canvasRef = useRef(null)
    const shouldPaint = useRef(false)
    const doodleHistory = useRef([])
    const displayHistory = useRef(0)
    const {activeMenuObject, actionMenuObject} = useSelector((state) => state.menu)
    const {color, size} = useSelector((state) => state.tools[activeMenuObject])
    
    useEffect(()=>{
        if(!canvasRef.current) return
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (actionMenuObject === MENU_OBJECTS.SAVE) {
            const imgURL = canvas.toDataURL()
            const image = document.createElement('a')
            image.href = imgURL
            image.download = 'image.jpg'
            image.click()
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
    }, [color, size])


    useLayoutEffect(() => {
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
        }

        const handleMouseMove = (e) => {
            if (!shouldPaint.current) return
            draw(e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY)
        }

        const handleMouseUp = (e) => {
            shouldPaint.current = false
            const doodleInfo = context.getImageData(0, 0, canvas.width, canvas.height)
            doodleHistory.current.push(doodleInfo)
            displayHistory.current = doodleHistory.current.length - 1
            endPosition()
        }        
        
        canvas.addEventListener("mousedown", handleMouseDown)
        canvas.addEventListener("mousemove", handleMouseMove)
        canvas.addEventListener("mouseup", handleMouseUp)

        canvas.addEventListener("touchstart", handleMouseDown)
        canvas.addEventListener("touchmove", handleMouseMove)
        canvas.addEventListener("touchend", handleMouseUp)

        // Function to remove the listeners
        return () => {
            canvas.removeEventListener("mousedown", handleMouseDown)
            canvas.removeEventListener("mousemove", handleMouseMove)
            canvas.removeEventListener("mouseup", handleMouseUp)

            canvas.removeEventListener("touchstart", handleMouseDown)
            canvas.removeEventListener("touchmove", handleMouseMove)
            canvas.removeEventListener("touchend", handleMouseUp)
        }
    }, [])
    return (
        <canvas ref = {canvasRef}></canvas>

    )
}
export default Board;