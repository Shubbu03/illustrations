import { useRef, useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Game } from "../app/game/Game";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { ActionBar } from "./ActionBar";

export type Tool =
  | "circle"
  | "rectangle"
  | "pencil"
  | "line"
  | "text"
  | "eraser";

const fetchCanvasID = async (slug: string) => {
  try {
    const response = await axios.get(`/api/get-canvasID/${slug}`);
    return response.data.id;
  } catch (error) {
    console.error("Error fetching canvas ID:", error);
    throw error;
  }
};

const setupHighDPICanvas = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return 1;

  const devicePixelRatio = window.devicePixelRatio || 1;
  const displayWidth = window.innerWidth;
  const displayHeight = window.innerHeight;

  canvas.width = displayWidth * devicePixelRatio;
  canvas.height = displayHeight * devicePixelRatio;

  canvas.style.width = displayWidth + "px";
  canvas.style.height = displayHeight + "px";

  ctx.scale(devicePixelRatio, devicePixelRatio);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  return devicePixelRatio;
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
  const { resolvedTheme } = useTheme();

  const { data: canvasID, error } = useQuery({
    queryKey: ["canvasID", slug],
    queryFn: () => fetchCanvasID(slug),
    enabled: !!slug,
  });

  useEffect(() => {
    game?.setTool(selectedTool);
  }, [selectedTool, game]);

  useEffect(() => {
    if (game && resolvedTheme) {
      game.setTheme(resolvedTheme as "light" | "dark");
    }
  }, [resolvedTheme, game]);

  useEffect(() => {
    if (canvasRef.current && canvasID && socket && resolvedTheme) {
      const devicePixelRatio = setupHighDPICanvas(canvasRef.current);

      const g = new Game(
        canvasRef.current,
        canvasID,
        socket,
        devicePixelRatio,
        resolvedTheme as "light" | "dark"
      );
      setGame(g);

      const handleResize = () => {
        if (canvasRef.current) {
          setupHighDPICanvas(canvasRef.current);
          g.handleResize();
        }
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        g.destroy();
      };
    }
  }, [canvasRef, canvasID, socket, resolvedTheme]);

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
        style={{
          display: "block",
          touchAction: "none",
        }}
      />
      <ActionBar
        setSelectedTool={setSelectedTool}
        selectedTool={selectedTool}
      />
    </div>
  );
}
