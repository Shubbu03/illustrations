import {
  Pencil,
  RectangleHorizontalIcon,
  Circle,
  Eraser,
  MoveUpRight,
  Diamond,
  PaintBucket,
} from "lucide-react";
import { Tool } from "./Canvas";
import { IconButton } from "./IconButton";
import ThemeToggle from "./ThemeToggle";
import { useState } from "react";

export function ActionBar({
  selectedTool,
  setSelectedTool,
  selectedColor,
  setSelectedColor,
}: {
  selectedTool: Tool;
  setSelectedTool: (s: Tool) => void;
  selectedColor: string | null;
  setSelectedColor: (color: string | null) => void;
}) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const colors = [
    "#ff6b6b",
    "#4ecdc4",
    "#45b7d1",
    "#96ceb4",
    "#ffeaa7",
    "#dda0dd",
    "#98d8c8",
    "#f7dc6f",
    "#bb8fce",
    "#85c1e9",
  ];

  const handleFillClick = () => {
    setSelectedTool("fill");
    setShowColorPicker(!showColorPicker);
  };

  const handleColorSelect = (color: string | null) => {
    setSelectedColor(color);
    setSelectedTool("fill");
    setShowColorPicker(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.5rem",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "0.25rem",
          padding: "0.5rem",
          background: "rgba(40, 40, 40, 0.95)",
          borderRadius: "0.75rem",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        }}
      >
        <IconButton
          onClick={() => {
            setSelectedTool("pencil");
          }}
          activated={selectedTool === "pencil"}
          icon={<Pencil size={20} />}
        />
        <IconButton
          onClick={() => {
            setSelectedTool("rectangle");
          }}
          activated={selectedTool === "rectangle"}
          icon={<RectangleHorizontalIcon size={20} />}
        />
        <IconButton
          onClick={() => {
            setSelectedTool("circle");
          }}
          activated={selectedTool === "circle"}
          icon={<Circle size={20} />}
        />
        <IconButton
          onClick={() => {
            setSelectedTool("line");
          }}
          activated={selectedTool === "line"}
          icon={<MoveUpRight size={20} />}
        />
        <IconButton
          onClick={() => {
            setSelectedTool("diamond");
          }}
          activated={selectedTool === "diamond"}
          icon={<Diamond size={20} />}
        />

        <div
          style={{
            width: "1px",
            height: "34px",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            margin: "0 0.25rem",
          }}
        />

        <IconButton
          onClick={() => {
            setSelectedTool("eraser");
          }}
          activated={selectedTool === "eraser"}
          icon={<Eraser size={20} />}
        />

        <div style={{ position: "relative" }}>
          <IconButton
            onClick={handleFillClick}
            activated={selectedTool === "fill"}
            icon={
              <div style={{ position: "relative" }}>
                <PaintBucket size={20} />
                {selectedColor && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: -2,
                      right: -2,
                      width: 8,
                      height: 8,
                      backgroundColor: selectedColor,
                      borderRadius: "50%",
                      border: "1px solid rgba(255, 255, 255, 0.8)",
                    }}
                  />
                )}
              </div>
            }
          />
        </div>

        <div
          style={{
            width: "1px",
            height: "34px",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            margin: "0 0.25rem",
          }}
        />

        <ThemeToggle />
      </div>

      {showColorPicker && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            padding: "0.75rem",
            background: "rgba(40, 40, 40, 0.95)",
            borderRadius: "0.75rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "0.25rem",
              flexWrap: "wrap",
              maxWidth: "200px",
            }}
          >
            <button
              onClick={() => handleColorSelect(null)}
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "4px",
                border:
                  selectedColor === null
                    ? "2px solid #fff"
                    : "1px solid rgba(255, 255, 255, 0.3)",
                background: "transparent",
                position: "relative",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="No Fill"
            >
              <div
                style={{
                  width: "16px",
                  height: "2px",
                  backgroundColor: "#ff4444",
                  transform: "rotate(45deg)",
                }}
              />
            </button>

            {colors.map((color) => (
              <button
                key={color}
                onClick={() => handleColorSelect(color)}
                style={{
                  width: "24px",
                  height: "24px",
                  backgroundColor: color,
                  borderRadius: "4px",
                  border:
                    selectedColor === color
                      ? "2px solid #fff"
                      : "1px solid rgba(255, 255, 255, 0.3)",
                  cursor: "pointer",
                }}
                title={`${color}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
