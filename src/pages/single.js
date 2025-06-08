import { useEffect, useRef, useState } from "react";
import { COLORS, MENU_OBJECTS } from "@/constant";
import { useSelector, useDispatch } from "react-redux";
import { changeColor, changeBrushSize } from "@/slice/toolsSlice";
import { clickMenuObject } from "@/slice/menuSlice";
import {
  EraserIcon,
  UndoIcon,
  RedoIcon,
  TrashIcon,
  SaveIcon,
  PencilIcon,
} from "lucide-react";

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
    const context = canvas.getContext("2d");
    historyStep.current++;
    if (historyStep.current < drawHistory.current.length) {
      drawHistory.current.length = historyStep.current;
    }
    drawHistory.current.push(
      context.getImageData(0, 0, canvas.width, canvas.height)
    );
  };

  const getCanvasPoint = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: ((e.clientX || e.touches?.[0]?.clientX) - rect.left) * scaleX,
      y: ((e.clientY || e.touches?.[0]?.clientY) - rect.top) * scaleY,
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
      const context = canvasRef.current.getContext("2d");
      context.putImageData(imageData, 0, 0);
    }
  };

  const handleRedo = () => {
    if (historyStep.current < drawHistory.current.length - 1) {
      historyStep.current++;
      const imageData = drawHistory.current[historyStep.current];
      const context = canvasRef.current.getContext("2d");
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
    const context = canvasRef.current.getContext("2d");
    if (activeMenuObject === MENU_OBJECTS.PENCIL) {
      setIsDrawingEnabled(true);
      context.globalCompositeOperation = "source-over";
    } else if (activeMenuObject === MENU_OBJECTS.ERASER) {
      setIsDrawingEnabled(true);
      context.globalCompositeOperation = "destination-out";
    } else {
      setIsDrawingEnabled(false);
    }
  }, [activeMenuObject]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Toolbar */}
      <div className="w-full md:w-72 lg:w-80 bg-white shadow-xl p-4 md:p-6 md:h-screen overflow-y-auto">
        {/* App Brand */}
        <div className="hidden md:block mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Whiteboard</h1>
          <p className="text-sm text-gray-500">Personal Drawing Space</p>
        </div>

        <div className="mb-6">
          <div className="grid grid-cols-4 gap-3">
            <button
              onClick={handleUndo}
              className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all shadow-sm hover:shadow"
            >
              <UndoIcon className="w-6 h-6 text-gray-700" />
              <span className="text-sm mt-1 font-medium">Undo</span>
            </button>
            <button
              onClick={handleRedo}
              className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all shadow-sm hover:shadow"
            >
              <RedoIcon className="w-6 h-6 text-gray-700" />
              <span className="text-sm mt-1 font-medium">Redo</span>
            </button>
            <button
              onClick={handleClear}
              className="flex flex-col items-center justify-center p-3 rounded-lg border border-red-200 bg-white hover:bg-red-50 transition-all shadow-sm hover:shadow"
            >
              <TrashIcon className="w-6 h-6 text-red-600" />
              <span className="text-sm mt-1 font-medium text-red-600">
                Clear
              </span>
            </button>
            <button
              onClick={handleSave}
              className="flex flex-col items-center justify-center p-3 rounded-lg border border-green-200 bg-white hover:bg-green-50 transition-all shadow-sm hover:shadow"
            >
              <SaveIcon className="w-6 h-6 text-green-600" />
              <span className="text-sm mt-1 font-medium text-green-600">
                Save
              </span>
            </button>
          </div>
        </div>

        {/* Drawing Tools Section */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-700">Tools</h2>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
            {[
              {
                id: MENU_OBJECTS.PENCIL,
                icon: <PencilIcon className="w-5 h-5" />,
                label: "Pencil",
              },
              {
                id: MENU_OBJECTS.ERASER,
                icon: <EraserIcon className="w-5 h-5" />,
                label: "Eraser",
              },
            ].map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleMenuClick(tool.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  activeMenuObject === tool.id
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tool.icon}
                <span className="font-medium">{tool.label}</span>
              </button>
            ))}
          </div>
          {/* Color Palette Section */}
          <div className="space-y-4 w-full">
            <h2 className="text-lg font-semibold text-gray-700">Colors</h2>
            <div className="grid grid-cols-6 md:grid-cols-4 gap-2">
              {Object.values(COLORS).map((colorOption) => (
                <button
                  key={colorOption}
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-lg transform hover:scale-110 transition-transform duration-200 ${
                    color === colorOption
                      ? "ring-2 ring-offset-2 ring-blue-500"
                      : ""
                  }`}
                  style={{ backgroundColor: colorOption }}
                  onClick={() => handleColorChange(colorOption)}
                />
              ))}
            </div>
          </div>

          {/* Brush Size Section */}
          <div className="space-y-4 w-full">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-700">
                Brush Size
              </h2>
              <span className="text-sm font-medium text-gray-500">
                {size}px
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={size}
              onChange={(e) => handleSizeChange(e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <main className="flex-1 p-4 md:p-6">
        <div className="h-full relative rounded-xl overflow-hidden bg-white shadow-lg">
          <canvas
            ref={canvasRef}
            style={{
              width: "100%",
              height: "100%",
              touchAction: "none",
              cursor: isDrawingEnabled ? "crosshair" : "default",
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />
        </div>
      </main>
    </div>
  );
}
