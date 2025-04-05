import { useRef, useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { socket } from "@/socket";
import { MENU_OBJECTS } from "@/constant";
import { clickActionObject } from "@/slice/menuSlice";

const Board = ({ sessionId }) => {
  const dispatch = useDispatch();
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isDrawingEnabled, setIsDrawingEnabled] = useState(false);
  const lastPoint = useRef(null);
  const drawHistory = useRef([]);
  const historyStep = useRef(-1);

  // Redux State
  const { activeMenuObject, actionMenuObject } = useSelector(
    (state) => state.menu
  );
  const { color, size, backgroundColor } = useSelector(
    (state) => state.tools[activeMenuObject]
  );

  // Coordinate system
  const getNormalizedCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: ((e.clientX || e.touches?.[0]?.clientX) - rect.left) * scaleX,
      y: ((e.clientY || e.touches?.[0]?.clientY) - rect.top) * scaleY,
    };
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

  // Initializing canvas with correct dimensions
  const initCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d", { willReadFrequently: true });

    // Standard dimensions
    canvas.width = 1920;
    canvas.height = 1080;

    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = color;
    context.lineWidth = size;

    saveCanvasState();
    return context;
  };

  // Drawing
  const drawLine = (start, end, drawColor, drawSize, emit = true) => {
    const context = canvasRef.current.getContext("2d");

    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.strokeStyle = drawColor;
    context.lineWidth = drawSize;
    context.stroke();
    context.closePath();

    if (emit) {
      socket.emit("draw", {
        start,
        end,
        color: drawColor,
        size: drawSize,
        sessionId,
      });
    }
  };

  // Event handlers
  const handlePointerDown = (e) => {
    if (!isDrawingEnabled) return;

    e.preventDefault();
    isDrawing.current = true;
    lastPoint.current = getNormalizedCoordinates(e);

    socket.emit("startDrawing", {
      point: lastPoint.current,
      sessionId,
    });
  };

  const handlePointerMove = (e) => {
    if (!isDrawing.current || !isDrawingEnabled) return;

    e.preventDefault();
    const coords = getNormalizedCoordinates(e);

    drawLine(lastPoint.current, coords, color, size);
    lastPoint.current = coords;
  };

  const handlePointerUp = () => {
    if (!isDrawingEnabled) return;

    isDrawing.current = false;
    lastPoint.current = null;
    saveCanvasState();
    socket.emit("stopDrawing", { sessionId });
  };

  // Action handlers
  const handleActions = {
    [MENU_OBJECTS.SAVE]: () => {
      const dataUrl = canvasRef.current.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `whiteboard-${sessionId}.png`;
      link.href = dataUrl;
      link.click();
    },
    [MENU_OBJECTS.CLEAR]: () => {
      const context = canvasRef.current.getContext("2d");
      context.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      saveCanvasState();
      socket.emit("clearCanvas", { sessionId });
    },
    [MENU_OBJECTS.UNDO]: () => {
      if (historyStep.current > 0) {
        historyStep.current--;
        const imageData = drawHistory.current[historyStep.current];
        const context = canvasRef.current.getContext("2d");
        context.putImageData(imageData, 0, 0);
        socket.emit("canvasState", {
          imageData: canvasRef.current.toDataURL(),
          sessionId,
        });
      }
    },
    [MENU_OBJECTS.REDO]: () => {
      if (historyStep.current < drawHistory.current.length - 1) {
        historyStep.current++;
        const imageData = drawHistory.current[historyStep.current];
        const context = canvasRef.current.getContext("2d");
        context.putImageData(imageData, 0, 0);
        socket.emit("canvasState", {
          imageData: canvasRef.current.toDataURL(),
          sessionId,
        });
      }
    },
    [MENU_OBJECTS.ERASER]: () => {
      const context = canvasRef.current.getContext("2d");
      context.globalCompositeOperation = "destination-out";
    },
  };

  // Socket event handlers
  useEffect(() => {
    const context = initCanvas();
    socket.emit("joinSession", { sessionId });

    const socketHandlers = {
      draw: ({ start, end, color, size }) => {
        drawLine(start, end, color, size, false);
      },
      clearCanvas: () => {
        context.clearRect(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
        saveCanvasState();
      },
      alert: ({ message }) => setAlertMessage(message),
      sessionState: ({ canvasData }) => {
        if (!canvasData) return;
        const img = new Image();
        img.onload = () => {
          context.drawImage(img, 0, 0);
          saveCanvasState();
        };
        img.src = canvasData;
      },
    };

    // Registering all socket events
    Object.entries(socketHandlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    // Cleanup
    return () => {
      Object.keys(socketHandlers).forEach((event) => {
        socket.off(event);
      });
      socket.emit("leaveSession", { sessionId });
    };
  }, [sessionId]);

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

  // Handling menu actions
  useEffect(() => {
    if (actionMenuObject && handleActions[actionMenuObject]) {
      handleActions[actionMenuObject]();
      dispatch(clickActionObject(null));
    }
  }, [actionMenuObject, dispatch]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.style.backgroundColor = backgroundColor;
  }, [backgroundColor]);

  return (
    <div
      className="board-container"
      style={{ width: "100vw", height: "100vh", overflow: "hidden" }}
    >
      {alertMessage && (
        <div
          className="alert"
          style={{
            position: "fixed",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
          }}
        >
          {alertMessage}
        </div>
      )}
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          backgroundColor,
          touchAction: "none",
          cursor: isDrawingEnabled ? "crosshair" : "default",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    </div>
  );
};

export default Board;
