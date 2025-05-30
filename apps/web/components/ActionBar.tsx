import {
  Pencil,
  RectangleHorizontalIcon,
  Circle,
  Minus,
  Type,
} from "lucide-react";
import { Tool } from "./Canvas";
import { IconButton } from "./IconButton";

export function ActionBar({
  selectedTool,
  setSelectedTool,
}: {
  selectedTool: Tool;
  setSelectedTool: (s: Tool) => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
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
        icon={<Minus size={20} />}
      />
      <IconButton
        onClick={() => {
          setSelectedTool("text");
        }}
        activated={selectedTool === "text"}
        icon={<Type size={20} />}
      />
    </div>
  );
}
