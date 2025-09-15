import { useRef, useEffect, useCallback, useState } from 'react';
import { CANVAS_WIDTH, CANVAS_HEIGHT, API_URL, WS_URL } from '../constants/config.js';
import { useWebSocket } from '../hooks/useWebSocket.js';
import ColorPalette from './ColorPalette.jsx';
import { Hand, Minus, PenSquare, Plus } from 'lucide-react';
import Minimap from './Minimap.jsx';
import CanvasLoader from './CanvasLoader.jsx';

const LiveCanvas = ({ appView, setAppView, getButtonStyle }) => {
  const canvasRef = useRef(null);
  const { lastMessage, sendMessage } = useWebSocket(WS_URL);

  const [mode, setMode] = useState('view');
  const [selectedColor, setSelectedColor] = useState('#87CEEB');
  const [isPaletteVisible, setPaletteVisible] = useState(false);
  const [cooldownMs, setCooldownMs] = useState(0);

  const [isInitialized, setInitialized] = useState(false);
  const [view, setView] = useState({ zoom: 1, offset: { x: 0, y: 0 } });
  const [isPanning, setIsPanning] = useState(false);
  const lastPanPoint = useRef({ x: 0, y: 0 });
  const panOccurred = useRef(false);

  const drawPixel = useCallback((ctx, x, y, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
  }, []);

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    fetch(`${API_URL}/api/canvas`)
      .then(res => res.json())
      .then(data => {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        data.forEach(pixel => drawPixel(ctx, pixel.x, pixel.y, pixel.color));
        setInitialized(true);
      });
  }, [drawPixel]);

  useEffect(() => {
    if (lastMessage && isInitialized) {
      try {
        const { type, payload } = JSON.parse(lastMessage);
        if (type === 'updatePixel') {
          const ctx = canvasRef.current.getContext('2d');
          drawPixel(ctx, payload.x, payload.y, payload.color);
        } else if (type === 'startCooldown') {
          setCooldownMs(payload.duration);
        } else if (type === 'cooldownViolation') {
          setCooldownMs(payload.remaining);
        }
      } catch (error) { console.error("Failed to process message:", error); }
    }
  }, [lastMessage, drawPixel, isInitialized]);

  useEffect(() => {
    if (cooldownMs > 0) {
      const timerId = setTimeout(() => {
        setCooldownMs(prev => Math.max(0, prev - 100));
      }, 100);
      return () => clearTimeout(timerId);
    }
  }, [cooldownMs]);

  const calculateAndSetView = useCallback(() => {
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const zoomX = screenW / CANVAS_WIDTH;
    const zoomY = screenH / CANVAS_HEIGHT;
    const newMinZoom = Math.max(zoomX, zoomY);
    const newOffsetX = (screenW - CANVAS_WIDTH * newMinZoom) / 2;
    const newOffsetY = (screenH - CANVAS_HEIGHT * newMinZoom) / 2;
    setView({ zoom: newMinZoom, offset: { x: newOffsetX, y: newOffsetY } });
  }, []);

  useEffect(() => {
    calculateAndSetView();
    window.addEventListener('resize', calculateAndSetView);
    return () => window.removeEventListener('resize', calculateAndSetView);
  }, [calculateAndSetView]);

  const getClampedView = useCallback((newView) => {
    const { zoom, offset } = newView;
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const clampedX = Math.min(0, Math.max(screenW - CANVAS_WIDTH * zoom, offset.x));
    const clampedY = Math.min(0, Math.max(screenH - CANVAS_HEIGHT * zoom, offset.y));
    return { zoom, offset: { x: clampedX, y: clampedY } };
  }, []);

  const handleMouseDown = (e) => {
    panOccurred.current = false;
    if (mode === 'view') {
      setIsPanning(true);
      lastPanPoint.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e) => {
    if (!isPanning || mode !== 'view') return;
    panOccurred.current = true;
    const dx = e.clientX - lastPanPoint.current.x;
    const dy = e.clientY - lastPanPoint.current.y;
    setView(prev => getClampedView({
      ...prev,
      offset: { x: prev.offset.x + dx, y: prev.offset.y + dy }
    }));
    lastPanPoint.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = (e) => {
    if (mode === 'place' && !panOccurred.current && cooldownMs <= 0) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const gridX = Math.floor(mouseX / view.zoom);
      const gridY = Math.floor(mouseY / view.zoom);

      if (gridX >= 0 && gridX < CANVAS_WIDTH && gridY >= 0 && gridY < CANVAS_HEIGHT) {
        sendMessage({ type: 'placePixel', payload: { x: gridX, y: gridY, color: selectedColor, userId: 'user123' } });
      }
    }
    setIsPanning(false);
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setPaletteVisible(false);
  }

  const isReady = cooldownMs <= 0;
  const secondsLeft = Math.ceil(cooldownMs / 1000);

  return (
    <div className={`relative w-screen h-screen bg-gray-800 overflow-hidden ${mode === 'view' ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'}`}>
      {!isInitialized && <CanvasLoader />}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setIsPanning(false)}
        className="bg-white"
        style={{
          imageRendering: 'pixelated',
          transformOrigin: '0 0',
          transform: `translate(${view.offset.x}px, ${view.offset.y}px) scale(${view.zoom})`,
        }}
      />

      {view.zoom > 5 && (
        <div
          className="absolute top-0 left-0 pointer-events-none"
          style={{
            width: `${CANVAS_WIDTH}px`,
            height: `${CANVAS_HEIGHT}px`,
            transformOrigin: '0 0',
            transform: `translate(${view.offset.x}px, ${view.offset.y}px) scale(${view.zoom})`,
            backgroundSize: `1px 1px`,
            boxShadow: 'inset 0 0 0 1000px rgba(0,0,0,0.05)',
            imageRendering: 'pixelated'
          }}
        />
      )}

      <div className="fixed bottom-5 right-5 z-20 flex items-center gap-3 justify-center" >
        <div className="flex items-center gap-2 p-1.5 bg-white rounded-lg shadow-lg">
          <button
            onClick={() => setMode('view')}
            className={`p-2 rounded-md ${mode === 'view' ? 'bg-black text-white' : 'hover:bg-gray-200 cursor-pointer'} transition-all duration-200 ease-in-out`}
          >
            <Hand className="w-6 h-6" />
          </button>
          <button
            onClick={() => setMode('place')}
            className={`p-2 rounded-md ${mode === 'place' ? 'bg-black text-white' : 'hover:bg-gray-200 cursor-pointer'} transition-all duration-200 ease-in-out`}
          >
            <PenSquare className="w-6 h-6" />
          </button>

          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all ${isReady ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}
          >
            {isReady ? 'R' : secondsLeft}
          </div>

          <div className="w-px h-8 bg-gray-300 mx-1"></div>

          <div className="relative flex items-center">
            <ColorPalette
              isVisible={isPaletteVisible}
              onColorSelect={handleColorSelect}
              onClose={() => setPaletteVisible(false)}
            />
            <button
              onClick={() => setPaletteVisible(true)}
              className="w-10 h-10 rounded-md border-2 border-gray-300 cursor-pointer"
              style={{ backgroundColor: selectedColor }}
            ></button>
          </div>
        </div>

        <div className="flex gap-2 p-1.5 bg-white rounded-lg shadow-lg">
          <button onClick={() => setAppView('canvas')} className={getButtonStyle('canvas')}>
            Live
          </button>
          <button onClick={() => setAppView('timelapse')} className={getButtonStyle('timelapse')}>
            Timelapse
          </button>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-white rounded-lg shadow-lg">
          <button
            onClick={() => setView(prev => getClampedView({ ...prev, zoom: prev.zoom * 1.2 }))}
            className="px-3 py-1 rounded-md hover:bg-gray-200 hover:text-gray-700 bg-black w-10 h-10 text-white transition-all duration-200 ease-in-out flex items-center cursor-pointer"
          >
            <Plus strokeWidth={4} />
          </button>
          <button
            onClick={() => setView(prev => getClampedView({ ...prev, zoom: prev.zoom / 1.2 }))}
            className="px-3 py-1 rounded-md hover:bg-gray-200 hover:text-gray-700 bg-black w-10 h-10 text-white transition-all duration-200 ease-in-out flex items-center cursor-pointer"
          >
            <Minus strokeWidth={4} />
          </button>
          <button
            onClick={calculateAndSetView}
            className="rounded-md px-5 py-2 text-md font-semibold transition-all duration-200 ease-in-out bg-black text-white shadow-md cursor-pointer"
          >
            Reset
          </button>
        </div>

        <Minimap mainCanvasRef={canvasRef} view={view} />

      </div>

    </div>
  );
};

export default LiveCanvas;