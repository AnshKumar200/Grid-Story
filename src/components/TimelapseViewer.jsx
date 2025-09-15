import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CANVAS_WIDTH, CANVAS_HEIGHT, API_URL } from '../constants/config.js';
import { Play, Pause, RotateCcw, Plus, Minus } from 'lucide-react';
import Minimap from './Minimap.jsx';
import CanvasLoader from './CanvasLoader.jsx';

const TimelapseViewer = ({ appView, setAppView, getButtonStyle }) => {
  const canvasRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [speed, setSpeed] = useState(150);

  const [view, setView] = useState({ zoom: 1, offset: { x: 0, y: 0 } });
  const [isPanning, setIsPanning] = useState(false);
  const lastPanPoint = useRef({ x: 0, y: 0 });

  useEffect(() => {
    fetch(`${API_URL}/api/timelapse`)
      .then(res => res.json())
      .then(data => setHistory(data))
      .catch(err => console.error("Failed to fetch timelapse data:", err))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!isPlaying || history.length === 0) return;
    const ctx = canvasRef.current.getContext('2d');
    const interval = 1000 / speed;

    const timer = setTimeout(() => {
      if (playbackIndex < history.length) {
        const pixel = history[playbackIndex];
        ctx.fillStyle = pixel.color;
        ctx.fillRect(pixel.x, pixel.y, 1, 1);
        setPlaybackIndex(playbackIndex + 1);
      } else {
        setIsPlaying(false);
      }
    }, interval);

    return () => clearTimeout(timer);
  }, [isPlaying, playbackIndex, history, speed]);

  const handlePlay = () => {
    if (playbackIndex >= history.length) {
      handleReset();
    }
    setIsPlaying(true);
  };

  const handlePause = () => setIsPlaying(false);

  const handleReset = () => {
    setIsPlaying(false);
    setPlaybackIndex(0);
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

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
    setIsPanning(true);
    lastPanPoint.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    const dx = e.clientX - lastPanPoint.current.x;
    const dy = e.clientY - lastPanPoint.current.y;
    setView(prev => getClampedView({
      ...prev,
      offset: { x: prev.offset.x + dx, y: prev.offset.y + dy }
    }));
    lastPanPoint.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => setIsPanning(false);

  return (
    <div className="relative w-screen h-screen bg-gray-800 overflow-hidden cursor-grab active:cursor-grabbing">
      {isLoading && <CanvasLoader />}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
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
            boxShadow: 'inset 0 0 0 1000px rgba(0,0,0,0.05)',
          }}
        />
      )}

      <div className="fixed bottom-5 right-5 z-20 flex items-end gap-3">
        <div className="p-4 bg-white rounded-xl shadow-lg flex flex-col items-center gap-3 w-60">
          <div className="flex items-center gap-4">
            <button onClick={handlePlay} disabled={isPlaying} className="p-3 bg-black text-white rounded-full disabled:bg-gray-400 transition not-disabled:cursor-pointer">
              <Play className="w-6 h-6" />
            </button>
            <button onClick={handlePause} disabled={!isPlaying} className="p-3 bg-yellow-500 text-white rounded-full disabled:bg-gray-400 hover:bg-yellow-600 transition not-disabled:cursor-pointer">
              <Pause className="w-6 h-6" />
            </button>
            <button onClick={handleReset} className="p-3 bg-red-500 text-white rounded-full disabled:bg-gray-400 hover:bg-red-600 transition cursor-pointer">
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>
          <div className='w-full text-center'>
            <label htmlFor="speed" className="block mb-1 text-sm font-medium text-gray-700">Speed: {speed} pixels/sec</label>
            <input
              id="speed" type="range" min="10" max="500"
              value={speed} onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full"
              _ />
          </div>
          <p className="text-gray-600 font-mono text-sm bg-gray-100 px-3 py-1 rounded-md">{playbackIndex} / {history.length}</p>
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

export default TimelapseViewer;