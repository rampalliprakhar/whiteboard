import cx from 'classnames';
import { useRef, useEffect } from 'react';
import styles from './index.module.css';
import { useSelector } from 'react-redux';

const Board = () => {
    const canvasRef = useRef(null);
    const activeMenuObject = useSelector((state) => state.menu.activeMenuObject)
    const {color, size} = useSelector((state) => state.tools[activeMenuObject])
    useEffect(() => {
        if(!canvasRef.current) return
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // When adding elements in DOM
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }, [])
    return (
        <canvas ref = {canvasRef}></canvas>

    )
}
export default Board;