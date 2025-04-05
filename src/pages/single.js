import { useEffect, useRef, useState } from "react";
import { COLORS, MENU_OBJECTS } from "@/constant";
import { useSelector, useDispatch } from "react-redux";
import { changeColor, changeBrushSize } from "@/slice/toolsSlice";
import { clickMenuObject } from "@/slice/menuSlice";

export default function Single() {
  const dispatch = useDispatch();
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef(null);
  const drawHistory = useRef([]);
  const historyStep = useRef(-1);
  const [isDrawingEnabled, setIsDrawingEnabled] = useState(false);

  const activeMenuObject = useSelector((state) => state.menu.activeMenuObject);
  const { color, size } = useSelector((state) => state.tools[activeMenuObject]);


  const initCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d", { willReadFrequently: true });

    canvas.width = 1920;
    canvas.height = 1080;

    canvas.lineCap = "round";
    canvas.lineJoin = "round";
    canvas.strokeStyle = color;
    canvas.lineWidth = size;

    saveCanvasState();
    return context;
  };


  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    historyStep.current++;
    if (historyStep.current < drawHistory.current.length) {
      drawHistory.current.length = historyStep.current;
    }
    drawHistory.current.push(context.getImageData(0, 0, canvas.width, canvas.height));
  };

  const getCanvasPoint = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: ((e.clientX || e.touches?.[0]?.clientX) - rect.left) * scaleX,
      y: ((e.clientY || e.touches?.[0]?.clientY) - rect.top) * scaleY
    };
  };

  const draw = (start, end) => {
    const context = canvasRef.current.getContext("2d");
    
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.strokeStyle = color;
    context.lineWidth = size;
    context.stroke();
    context.closePath();
  };

  const handlePointerDown = (e) => {
    if (!isDrawingEnabled) return;
    
    e.preventDefault();
    isDrawing.current = true;
    lastPoint.current = getCanvasPoint(e);
  };

  const handlePointerMove = (e) => {
    if (!isDrawing.current || !isDrawingEnabled) return;
    
    e.preventDefault();
    const currentPoint = getCanvasPoint(e);
    
    draw(lastPoint.current, currentPoint);
    lastPoint.current = currentPoint;
  };

  const handlePointerUp = () => {
    if (!isDrawingEnabled) return;
    
    isDrawing.current = false;
    lastPoint.current = null;
    saveCanvasState();
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
    const context = canvasRef.current.getContext("2d");
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    saveCanvasState();
  };

  const handleUndo = () => {
    if (historyStep.current > 0) {
      historyStep.current--;
      const imageData = drawHistory.current[historyStep.current];
      const context = canvasRef.current.getContext('2d');
      context.putImageData(imageData, 0, 0);
    }
  };

  const handleRedo = () => {
    if (historyStep.current < drawHistory.current.length - 1) {
      historyStep.current++;
      const imageData = drawHistory.current[historyStep.current];
      const context = canvasRef.current.getContext('2d');
      context.putImageData(imageData, 0, 0);
    }
  };

  const handleSave = () => {
    const dataUrl = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "whiteboard.png";
    link.href = dataUrl;
    link.click();
  };

  useEffect(() => {
    initCanvas();
  }, []);

  useEffect(() => {
    const context = canvasRef.current.getContext('2d');
    if (activeMenuObject === MENU_OBJECTS.PENCIL) {
      setIsDrawingEnabled(true);
      context.globalCompositeOperation = 'source-over';
    } else if (activeMenuObject === MENU_OBJECTS.ERASER) {
      setIsDrawingEnabled(true);
      context.globalCompositeOperation = 'destination-out';
    } else {
      setIsDrawingEnabled(false);
    }
  }, [activeMenuObject]);

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
        <button onClick={handleUndo}>Undo</button>
        <button onClick={handleRedo}>Redo</button>
        <button onClick={handleClear}>Clear</button>
        <button onClick={handleSave}>Save</button>
      </div>
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          touchAction: "none",
          cursor: isDrawingEnabled ? "crosshair" : "default"
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="bg-white"
      />
    </div>
  );
}