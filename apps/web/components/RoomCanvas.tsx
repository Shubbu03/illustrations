"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Canvas from "./Canvas";
import { Home, RefreshCw } from "lucide-react";

export function RoomCanvas({ slug }: { slug: string }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const wsToken = session?.user.wsToken;

  useEffect(() => {
    if (!wsToken) return;
    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}?token=${wsToken}`
    );

    ws.onopen = () => {
      setSocket(ws);
      const data = JSON.stringify({
        type: "join_room",
        slug,
      });
      ws.send(data);
    };

    ws.onerror = (error) => {
      setError("Failed to connect to the server. Please try again later.");
      console.error("WebSocket error:", error);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [slug, wsToken]);

  if (error) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: "#EAEFEF" }}
      >
        <div className="text-center">
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
          <div className="flex justify-center space-x-1.5">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
              style={{ backgroundColor: "#7F8CAA" }}
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Retry
            </button>
            <button
              onClick={() => window.location.replace("/dashboard")}
              className="flex items-center px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
              style={{ backgroundColor: "#7F8CAA" }}
            >
              <Home className="mr-2 h-4 w-4" /> Back Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!socket) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: "#EAEFEF" }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: "#7F8CAA" }}
          ></div>
          <p className="text-sm" style={{ color: "#333446", opacity: 0.8 }}>
            Loading canvas...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Canvas socket={socket} slug={slug} />
    </div>
  );
}
