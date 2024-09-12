import cx from 'classnames';
import { useSelector, useDispatch } from 'react-redux';
import styles from './index.module.css';
import { COLORS, MENU_OBJECTS } from '@/constant'
import { changeColor, changeBrushSize } from '@/slice/toolsSlice';
const Tools = () => {
    const dispatch = useDispatch();
    // Access active menu object
    const activeMenuObject = useSelector((state) => state.menu.activeMenuObject)
    const {color, size} = useSelector((state) => state.tools[activeMenuObject])
    const showStrokeToolOption = activeMenuObject === MENU_OBJECTS.PENCIL
    const showBrushToolOption = activeMenuObject === MENU_OBJECTS.PENCIL || activeMenuObject === MENU_OBJECTS.ERASER
    
    const updateBrushSize = (e) => {
        dispatch(changeBrushSize({object: activeMenuObject, size: e.target.value}))
    }
    const updateBrushColor = (newColor) => {
        dispatch(changeColor({object: activeMenuObject, color: newColor}))
    }
        // Container for tools
        /* Container for individual items */
    return (<div className={styles.toolsContainer}>
            {(showStrokeToolOption) && <div className={styles.toolItems}>
                    <h4 className={styles.toolScript}> Brush Colors </h4>
                    <div className={styles.itemsContainer}>
                        <div className={cx(styles.colorOptions, {[styles.active]:color === COLORS.BLACK})} style={{backgroundColor: COLORS.BLACK}} onClick={() => updateBrushColor(COLORS.BLACK)} />
                        <div className={cx(styles.colorOptions, {[styles.active]:color === COLORS.BLUE})} style={{backgroundColor: COLORS.BLUE}} onClick={() => updateBrushColor(COLORS.BLUE)} />
                        <div className={cx(styles.colorOptions, {[styles.active]:color === COLORS.GREEN})} style={{backgroundColor: COLORS.GREEN}} onClick={() => updateBrushColor(COLORS.GREEN)} />
                        <div className={cx(styles.colorOptions, {[styles.active]:color === COLORS.ORANGE})} style={{backgroundColor: COLORS.ORANGE}} onClick={() => updateBrushColor(COLORS.ORANGE)} />
                        <div className={cx(styles.colorOptions, {[styles.active]:color === COLORS.RED})} style={{backgroundColor: COLORS.RED}} onClick={() => updateBrushColor(COLORS.RED)} />
                        <div className={cx(styles.colorOptions, {[styles.active]:color === COLORS.YELLOW})} style={{backgroundColor: COLORS.YELLOW}} onClick={() => updateBrushColor(COLORS.YELLOW)} />
                    </div>
            </div>}
            {(showBrushToolOption) && <div className={styles.toolItems}>
                    <h4 className={styles.toolScript}> Brush Size </h4>
                    <div className={styles.itemsContainer}>
                        <input type='range' min={1} max={10} step={1} onChange={updateBrushSize} value={size}/>
                    </div>
            </div>}
    </div>)
}
export default Tools;