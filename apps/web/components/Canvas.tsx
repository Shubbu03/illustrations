import { useRef, useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Game } from "../app/game/Game";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { ActionBar } from "./ActionBar";
import { Home, Share2, Download } from "lucide-react";
import ShareModal from "./ShareModal";

export type Tool =
  | "circle"
  | "rectangle"
  | "pencil"
  | "line"
  | "diamond"
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
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const router = useRouter();

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

  const handleGoHome = () => {
    if (socket && slug) {
      socket.send(
        JSON.stringify({
          type: "leave_room",
          roomID: canvasID,
        })
      );
    }

    router.replace("/dashboard");
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const handleDownload = () => {
    if (game) {
      game.downloadAsJPEG(slug);
    }
  };

  if (error) {
    return <div>Error loading canvas: {error.message}</div>;
  }

  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <button
        onClick={handleGoHome}
        className="absolute top-4 left-4 z-10 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 p-2 rounded-lg shadow-lg transition-colors duration-200 border border-gray-200 dark:border-gray-600 cursor-pointer"
        aria-label="Go to Dashboard"
      >
        <Home size={20} />
      </button>

      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={handleShare}
          className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 p-2 rounded-lg shadow-lg transition-colors duration-200 border border-gray-200 dark:border-gray-600 cursor-pointer"
          aria-label="Share Canvas"
        >
          <Share2 size={20} />
        </button>

        <button
          onClick={handleDownload}
          className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 p-2 rounded-lg shadow-lg transition-colors duration-200 border border-gray-200 dark:border-gray-600 cursor-pointer"
          aria-label="Download as JPEG"
        >
          <Download size={20} />
        </button>
      </div>

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

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        slug={slug}
      />
    </div>
  );
}
