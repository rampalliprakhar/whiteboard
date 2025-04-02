import { useEffect, useRef, useState } from "react";
import { COLORS, MENU_OBJECTS } from "@/constant";
import { useSelector, useDispatch } from "react-redux";
import { changeColor, changeBrushSize } from "@/slice/toolsSlice";
import { clickMenuObject } from "@/slice/menuSlice";

export default function Single() {
  const dispatch = useDispatch();
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const activeMenuObject = useSelector((state) => state.menu.activeMenuObject);
  const { color, size } = useSelector((state) => state.tools[activeMenuObject]);

  useEffect(() => {
    setDimensions({
      width: window.innerWidth - 64,
      height: window.innerHeight,
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.strokeStyle = color;
    context.lineWidth = size;
  }, [color, size]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.beginPath();
    context.moveTo(
      e.clientX - canvas.offsetLeft,
      e.clientY - canvas.offsetTop
    );
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.lineTo(
      e.clientX - canvas.offsetLeft,
      e.clientY - canvas.offsetTop
    );
    context.stroke();
  };

  const stopDrawing = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.closePath();
    setIsDrawing(false);
  };

  const handleMenuClick = (menuItem) => {
    dispatch(clickMenuObject(menuItem));
  };

  const handleColorChange = (newColor) => {
    dispatch(changeColor({ object: activeMenuObject, color: newColor }));
  };

  const handleSizeChange = (newSize) => {
    dispatch(changeBrushSize({ object: activeMenuObject, size: newSize }));
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "whiteboard.png";
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="flex h-screen">
      <div className="w-16 bg-white p-4 flex flex-col gap-4">
        <button onClick={() => handleMenuClick(MENU_OBJECTS.PENCIL)}>Pencil</button>
        <button onClick={() => handleMenuClick(MENU_OBJECTS.ERASER)}>Eraser</button>
        <input 
          type="range" 
          min="1" 
          max="20" 
          value={size} 
          onChange={(e) => handleSizeChange(e.target.value)} 
        />
        <div className="flex flex-wrap gap-2">
          {Object.values(COLORS).map((colorOption) => (
            <div
              key={colorOption}
              className="w-6 h-6 rounded-full cursor-pointer"
              style={{ backgroundColor: colorOption }}
              onClick={() => handleColorChange(colorOption)}
            />
          ))}
        </div>
        <button onClick={handleClear}>Clear</button>
        <button onClick={handleSave}>Save</button>
      </div>
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        className="bg-white"
      />
    </div>
  );
}