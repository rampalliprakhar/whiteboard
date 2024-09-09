import { useSelector } from 'react-redux';
import styles from './index.module.css';
import {COLORS, MENU_OBJECTS} from '@/constant'
const Tools = () => {
    // Access active menu object
    const activeMenuObject = useSelector((state) => {state.menu.activeMenuObject})
    const showStrokeToolOption = activeMenuObject === MENU_OBJECTS.PENCIL
    const showBrushToolOption = activeMenuObject === MENU_OBJECTS.PENCIL || activeMenuObject === MENU_OBJECTS.ERASER
    
    const changeBrushSize = (e) =>{}
    return (
        // Container for tools
        <div className={styles.toolsContainer}>
            {/* Container for individual items */}
            
            {showStrokeToolOption  && <div className={styles.toolItems}>
                    {/* Colors */}
                    <h4 className={styles.toolScript}> Brush Colors </h4>
                    <div className={styles.itemsContainer}>
                        <div className={styles.colorOptions} style={{backgroundColor: COLORS.BLACK}} />
                        <div className={styles.colorOptions} style={{backgroundColor: COLORS.BLUE}} />
                        <div className={styles.colorOptions} style={{backgroundColor: COLORS.GREEN}} />
                        <div className={styles.colorOptions} style={{backgroundColor: COLORS.ORANGE}} />
                        <div className={styles.colorOptions} style={{backgroundColor: COLORS.RED}} />
                        <div className={styles.colorOptions} style={{backgroundColor: COLORS.YELLOW}} />
                    </div>
                </div>
            }
            {showBrushToolOption &&  <div className={styles.toolItems}>
                    {/* Size */}
                    <h4 className={styles.toolScript}> Brush Size </h4>
                    <div>
                        <input type='range' min={1} max={10} step={1} onChange={changeBrushSize}/>
                    </div>
                </div>
            }
        </div>
    )
}
export default Tools;