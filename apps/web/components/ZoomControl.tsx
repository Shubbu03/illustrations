import { Minus, Plus } from "lucide-react";

interface ZoomControlProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export function ZoomControl({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: ZoomControlProps) {
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div
        className="flex items-center bg-white rounded-lg shadow-lg border mb-2"
        style={{
          borderColor: "#B8CFCE",
        }}
      >
        <button
          onClick={onZoomOut}
          disabled={zoom <= 10}
          className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg transition-colors"
          style={{
            color: "#333446",
          }}
          title="Zoom out (or use mouse wheel)"
        >
          <Minus className="w-4 h-4" />
        </button>

        <button
          onClick={onResetZoom}
          className="px-4 py-2 text-sm font-medium border-x hover:bg-gray-50 transition-colors cursor-pointer min-w-[60px]"
          style={{
            color: "#333446",
            borderColor: "#B8CFCE",
          }}
          title="Click to reset to 100%"
        >
          {Math.round(zoom)}%
        </button>

        <button
          onClick={onZoomIn}
          disabled={zoom >= 300}
          className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg transition-colors"
          style={{
            color: "#333446",
          }}
          title="Zoom in (or use mouse wheel)"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* <div
        className="text-xs px-3 py-2 bg-white rounded-lg shadow border"
        style={{
          color: "#333446",
          borderColor: "#B8CFCE",
          opacity: 0.8,
        }}
      >
        <div>🎯 Click & drag to draw shapes</div>
        <div>👆👆 Two-finger drag to pan</div>
        <div>⌨️ Spacebar + drag to zoom</div>
        <div>⚲ Mouse wheel to zoom</div>
      </div> */}
    </div>
  );
}
