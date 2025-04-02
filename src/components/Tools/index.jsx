import cx from "classnames";
import { socket } from "@/socket";
import { useSelector, useDispatch } from "react-redux";
import styles from "./index.module.css";
import { COLORS, MENU_OBJECTS } from "@/constant";
import {
  changeColor,
  changeBrushSize,
  changeActiveMenuObject,
  changeBackgroundColor,
} from "@/slice/toolsSlice";
import { useEffect } from "react";
const Tools = () => {
  const dispatch = useDispatch();
  const { activeMenuObject, color, size, backgroundColor } = useSelector(
    (state) => state.tools
  );
  const showStrokeToolOption = activeMenuObject === MENU_OBJECTS.PENCIL;
  const showBrushToolOption =
    activeMenuObject === MENU_OBJECTS.PENCIL ||
    activeMenuObject === MENU_OBJECTS.ERASER;

  const emitColorAndSizeChange = (color, size) => {
    socket.emit("changeConfig", { color, size }); // Emit the new color and size
  };

  const updateBrushSize = (e) => {
    const newSize = e.target.value;
    dispatch(changeBrushSize({ object: activeMenuObject, size: newSize })); // Update Redux state
    emitColorAndSizeChange(color, newSize); // Emit the new size
  };

  const updateBrushColor = (newColor) => {
    dispatch(changeColor({ object: activeMenuObject, color: newColor })); // Update Redux state
    emitColorAndSizeChange(newColor, size); // Emit the new color
  };

  const updateBackground = (newColor) => {
    // Updating local state
    dispatch(changeBackgroundColor(newColor));
    // Emitting the new color to the server
    socket.emit("changeBackground", { color: newColor });
    // Updating the background color in the server
    document.querySelector("canvas").style.backgroundColor = newColor;
  };
  // Container for tools
  /* Container for individual items */
  return (
    <div className={styles.toolsContainer}>
      {showStrokeToolOption && (
        <div className={styles.toolItems}>
          <h4 className={styles.toolScript}> Brush Colors </h4>
          <div className={styles.itemsContainer}>
            <div
              className={cx(styles.colorOptions, {
                [styles.active]: color === COLORS.BLACK,
              })}
              style={{ backgroundColor: COLORS.BLACK }}
              onClick={() => updateBrushColor(COLORS.BLACK)}
            />
            <div
              className={cx(styles.colorOptions, {
                [styles.active]: color === COLORS.BLUE,
              })}
              style={{ backgroundColor: COLORS.BLUE }}
              onClick={() => updateBrushColor(COLORS.BLUE)}
            />
            <div
              className={cx(styles.colorOptions, {
                [styles.active]: color === COLORS.GREEN,
              })}
              style={{ backgroundColor: COLORS.GREEN }}
              onClick={() => updateBrushColor(COLORS.GREEN)}
            />
            <div
              className={cx(styles.colorOptions, {
                [styles.active]: color === COLORS.ORANGE,
              })}
              style={{ backgroundColor: COLORS.ORANGE }}
              onClick={() => updateBrushColor(COLORS.ORANGE)}
            />
            <div
              className={cx(styles.colorOptions, {
                [styles.active]: color === COLORS.RED,
              })}
              style={{ backgroundColor: COLORS.RED }}
              onClick={() => updateBrushColor(COLORS.RED)}
            />
            <div
              className={cx(styles.colorOptions, {
                [styles.active]: color === COLORS.YELLOW,
              })}
              style={{ backgroundColor: COLORS.YELLOW }}
              onClick={() => updateBrushColor(COLORS.YELLOW)}
            />
          </div>
        </div>
      )}
      {showBrushToolOption && (
        <div className={styles.toolItems}>
          <h4 className={styles.toolScript}> Brush Size </h4>
          <div className={styles.itemsContainer}>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              onChange={updateBrushSize}
              value={size[activeMenuObject]}
              className={styles.sizeSlider}
            />
          </div>
          <br></br>
          <div>
            <h4 className={styles.toolScript}>Background Color</h4>
            <div className={styles.itemsContainer}>
              <div
                className={cx(styles.colorOptions, {
                  [styles.active]: backgroundColor === COLORS.WHITE,
                })}
                style={{
                  backgroundColor: COLORS.WHITE,
                  border: "1px solid #000",
                }}
                onClick={() => updateBackground(COLORS.WHITE)}
              />
              <div
                className={cx(styles.colorOptions, {
                  [styles.active]: backgroundColor === COLORS.BLACK,
                })}
                style={{ backgroundColor: COLORS.BLACK }}
                onClick={() => updateBackground(COLORS.BLACK)}
              />
              <div
                className={cx(styles.colorOptions, {
                  [styles.active]: backgroundColor === COLORS.BLUE,
                })}
                style={{ backgroundColor: COLORS.BLUE }}
                onClick={() => updateBackground(COLORS.BLUE)}
              />
              <div
                className={cx(styles.colorOptions, {
                  [styles.active]: backgroundColor === COLORS.GREEN,
                })}
                style={{ backgroundColor: COLORS.GREEN }}
                onClick={() => updateBackground(COLORS.GREEN)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Tools;
