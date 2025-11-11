import { useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface PanZoomCanvasProps {
  children: React.ReactNode;
  contentWidth: number;
  contentHeight: number;
}

export function PanZoomCanvas({ children, contentWidth, contentHeight }: PanZoomCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  // Calculate fit-to-screen zoom
  const calculateFitZoom = () => {
    if (!containerRef.current) return 1;
    const container = containerRef.current;
    const padding = 80; // Padding around content
    const availableWidth = container.clientWidth - padding * 2;
    const availableHeight = container.clientHeight - padding * 2;
    
    const scaleX = availableWidth / contentWidth;
    const scaleY = availableHeight / contentHeight;
    
    return Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%
  };

  // Fit to screen on mount and window resize
  useEffect(() => {
    const fitToScreen = () => {
      const fitZoom = calculateFitZoom();
      setZoom(fitZoom);
      setPan({ x: 0, y: 0 }); // Center content
    };

    fitToScreen();
    window.addEventListener('resize', fitToScreen);
    return () => window.removeEventListener('resize', fitToScreen);
  }, [contentWidth, contentHeight]);

  // Mark as interacted and fade out instructions
  const markInteracted = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      setTimeout(() => setShowInstructions(false), 800);
    }
  };

  // Handle mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return; // Only zoom with Ctrl/Cmd + wheel
    
    e.preventDefault();
    markInteracted();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(3, zoom * delta));
    setZoom(newZoom);
  };

  // Handle mouse drag to pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    markInteracted();
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom controls
  const handleZoomIn = () => {
    markInteracted();
    setZoom(Math.min(3, zoom * 1.2));
  };

  const handleZoomOut = () => {
    markInteracted();
    setZoom(Math.max(0.1, zoom * 0.8));
  };

  const handleFitToScreen = () => {
    markInteracted();
    const fitZoom = calculateFitZoom();
    setZoom(fitZoom);
    setPan({ x: 0, y: 0 });
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-100">
      {/* Canvas */}
      <div
        ref={containerRef}
        className={`w-full h-full overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`,
            transformOrigin: 'center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
        >
          <div
            ref={contentRef}
            style={{
              width: `${contentWidth}px`,
              height: `${contentHeight}px`,
            }}
          >
            {children}
          </div>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="w-12 h-12 bg-white border-3 border-black rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
          title="Zoom In (Ctrl + Scroll)"
        >
          <ZoomIn className="h-5 w-5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-12 h-12 bg-white border-3 border-black rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
          title="Zoom Out (Ctrl + Scroll)"
        >
          <ZoomOut className="h-5 w-5" />
        </button>
        <button
          onClick={handleFitToScreen}
          className="w-12 h-12 bg-white border-3 border-black rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
          title="Fit to Screen"
        >
          <Maximize2 className="h-5 w-5" />
        </button>
        <div className="w-12 h-12 bg-white border-3 border-black rounded-full shadow-lg flex items-center justify-center">
          <span className="text-xs font-bold">{Math.round(zoom * 100)}%</span>
        </div>
      </div>

      {/* Instructions - Fade out after interaction */}
      {showInstructions && (
        <div 
          className={`absolute top-6 left-1/2 -translate-x-1/2 bg-white border-2 border-black rounded-full px-4 py-2 shadow-lg transition-opacity duration-700 ${
            hasInteracted ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <p className="text-xs font-bold uppercase">
            Drag to Pan • Ctrl+Scroll to Zoom
          </p>
        </div>
      )}
    </div>
  );
}
