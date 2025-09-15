import { useRef, useEffect } from 'react';

const MINIMAP_SIZE = 200;

const Minimap = ({ mainCanvasRef, view }) => {
  const minimapCanvasRef = useRef(null);

  useEffect(() => {
    const mainCanvas = mainCanvasRef.current;
    const minimapCanvas = minimapCanvasRef.current;
    if (!mainCanvas || !minimapCanvas) return;

    const minimapCtx = minimapCanvas.getContext('2d');
    let animationFrameId;

    const draw = () => {
      const scale = MINIMAP_SIZE / mainCanvas.width;

      const viewX = -view.offset.x / view.zoom;
      const viewY = -view.offset.y / view.zoom;
      const viewWidth = window.innerWidth / view.zoom;
      const viewHeight = window.innerHeight / view.zoom;

      const rx = viewX * scale;
      const ry = viewY * scale;
      const rw = viewWidth * scale;
      const rh = viewHeight * scale;

      minimapCtx.clearRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);
      minimapCtx.drawImage(mainCanvas, 0, 0, MINIMAP_SIZE, MINIMAP_SIZE);

      minimapCtx.save();
      minimapCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      minimapCtx.beginPath();

      minimapCtx.rect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);

      minimapCtx.moveTo(rx, ry);
      minimapCtx.lineTo(rx, ry + rh);
      minimapCtx.lineTo(rx + rw, ry + rh);
      minimapCtx.lineTo(rx + rw, ry);
      minimapCtx.closePath();

      minimapCtx.fill('evenodd');
      minimapCtx.restore();

      minimapCtx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      minimapCtx.lineWidth = 1.5;
      minimapCtx.strokeRect(rx, ry, rw, rh);

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [mainCanvasRef, view]);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-1 pointer-events-none fixed top-5 right-5">
      <canvas
        ref={minimapCanvasRef}
        width={MINIMAP_SIZE}
        height={MINIMAP_SIZE}
        className="rounded"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
};

export default Minimap;