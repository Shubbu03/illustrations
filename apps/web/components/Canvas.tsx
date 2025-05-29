import { Pencil, RectangleHorizontalIcon, Circle } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { IconButton } from "./IconButton";
import { Game } from "../app/game/Game";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

export type Tool = "circle" | "rectangle" | "pencil" | "line";

const fetchCanvasID = async (slug: string) => {
  try {
    const response = await axios.get(`/api/get-canvasID/${slug}`);
    return response.data.id;
  } catch (error) {
    console.error("Error fetching canvas ID:", error);
    throw error;
  }
};

export default function Canvas({
  socket,
  slug,
}: {
  socket: WebSocket;
  slug: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<Game>();
  const [selectedTool, setSelectedTool] = useState<Tool>("circle");

  const {
    data: canvasID,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["canvasID", slug],
    queryFn: () => fetchCanvasID(slug),
    enabled: !!slug,
  });

  useEffect(() => {
    game?.setTool(selectedTool);
  }, [selectedTool, game]);

  useEffect(() => {
    if (canvasRef.current && canvasID && socket) {
      const g = new Game(canvasRef.current, canvasID, socket);
      setGame(g);

      return () => {
        g.destroy();
      };
    }
  }, [canvasRef, canvasID, socket]);

  if (isLoading) {
    return <div>Loading canvas...</div>;
  }

  if (error) {
    return <div>Error loading canvas: {error.message}</div>;
  }

  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
      />
      <Topbar setSelectedTool={setSelectedTool} selectedTool={selectedTool} />
    </div>
  );
}

function Topbar({
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
        top: 10,
        left: 10,
      }}
    >
      <div className="flex gap-t">
        <IconButton
          onClick={() => {
            setSelectedTool("pencil");
          }}
          activated={selectedTool === "pencil"}
          icon={<Pencil />}
        />
        <IconButton
          onClick={() => {
            setSelectedTool("rectangle");
          }}
          activated={selectedTool === "rectangle"}
          icon={<RectangleHorizontalIcon />}
        ></IconButton>
        <IconButton
          onClick={() => {
            setSelectedTool("circle");
          }}
          activated={selectedTool === "circle"}
          icon={<Circle />}
        ></IconButton>
        <IconButton
          onClick={() => {
            setSelectedTool("line");
          }}
          activated={selectedTool === "line"}
          icon={<div>L</div>}
        ></IconButton>
      </div>
    </div>
  );
}
