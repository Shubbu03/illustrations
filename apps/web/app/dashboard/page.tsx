"use client";

import axios from "axios";
import {
  MoreHorizontal,
  Palette,
  Plus,
  UserSearch,
  Loader2,
  PackageOpen,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import JoinCanvasDropdown from "../../components/JoinCanvasDropDown";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface CanvasItem {
  id: string;
  slug: string;
  createdAt: string;
}

const fetchCanvas = async (): Promise<CanvasItem[]> => {
  const response = await axios.get<{ canvas: CanvasItem[] }>(
    "/api/fetch-existing-canvas"
  );
  return response.data.canvas || [];
};

const createCanvas = async (): Promise<{ slug: string }> => {
  const response = await axios.post("/api/create-canvas");
  if (response.data.status === 200 && response.data.slug) {
    return { slug: response.data.slug };
  }
  throw new Error(response.data.message || "Failed to create canvas");
};

const Dashboard = () => {
  const [isJoinDropdownOpen, setIsJoinDropdownOpen] = useState(false);
  const [roomNotFound, setRoomNotFound] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const joinButtonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: canvases = [],
    isLoading: isLoadingCanvases,
    isError: isErrorFetchingCanvases,
  } = useQuery<CanvasItem[], Error>({
    queryKey: ["canvases"],
    queryFn: fetchCanvas,
  });

  const createCanvasMutation = useMutation<
    {
      slug: string;
    },
    Error,
    void
  >({
    mutationFn: createCanvas,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["canvases"] });
      router.push(`/canvas/${data.slug}`);
    },
    onError: (error) => {
      console.error("Error occurred while creating room", error);
    },
  });

  const handleAddNew = () => {
    createCanvasMutation.mutate();
  };

  const handleJoinCanvasDropDownOpen = () => {
    setIsJoinDropdownOpen(!isJoinDropdownOpen);
    if (!isJoinDropdownOpen) {
      setRoomNotFound(false);
      setIsJoining(false);
    }
  };

  const handleJoinCanvas = async (roomSlug: string) => {
    try {
      setIsJoining(true);
      setRoomNotFound(false);
      const response = await axios.get(`/api/check-canvas-exist/${roomSlug}`);

      if (response.data.roomExist === true) {
        router.push(`/canvas/${roomSlug}`);
        setIsJoinDropdownOpen(false);
      } else {
        setRoomNotFound(true);
      }
    } catch (error) {
      console.error("Error occured while joining room:", error);
      setRoomNotFound(true);
    } finally {
      setIsJoining(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#EAEFEF" }}>
      <div className="pt-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold" style={{ color: "#333446" }}>
                My Illustrations
              </h1>
              <div className="flex space-x-2">
                <div className="relative">
                  <button
                    ref={joinButtonRef}
                    onClick={handleJoinCanvasDropDownOpen}
                    className="flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-pointer"
                    style={{
                      backgroundColor: "#7F8CAA",
                      color: "white",
                    }}
                  >
                    <UserSearch className="w-5 h-5" />
                    Join Canvas
                  </button>
                  <JoinCanvasDropdown
                    isOpen={isJoinDropdownOpen}
                    onClose={() => setIsJoinDropdownOpen(false)}
                    onJoin={handleJoinCanvas}
                    buttonRef={joinButtonRef}
                    showError={roomNotFound}
                    isLoading={isJoining}
                  />
                </div>
                <button
                  onClick={handleAddNew}
                  disabled={createCanvasMutation.isPending}
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: "#7F8CAA",
                    color: "white",
                  }}
                >
                  {createCanvasMutation.isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      New Illustration
                    </>
                  )}
                </button>
              </div>
            </div>
            <p className="text-lg" style={{ color: "#333446", opacity: 0.7 }}>
              Create, collaborate, and bring your ideas to life
            </p>
          </div>

          <div className="mb-12">
            <h2
              className="text-xl font-semibold mb-6 flex items-center gap-2"
              style={{ color: "#333446" }}
            >
              <Palette className="w-5 h-5" />
              Canvas
            </h2>

            {isLoadingCanvases ? (
              <div className="flex justify-center items-center h-64">
                <Loader2
                  className="w-12 h-12 animate-spin"
                  style={{ color: "#7F8CAA" }}
                />
              </div>
            ) : isErrorFetchingCanvases ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <PackageOpen className="w-16 h-16 mb-4 text-red-500" />
                <h3
                  className="text-xl font-semibold mb-2"
                  style={{ color: "#333446" }}
                >
                  Error Fetching Canvas
                </h3>
                <p
                  className="text-md"
                  style={{ color: "#333446", opacity: 0.7 }}
                >
                  Could not load your canvas. Please try again later.
                </p>
              </div>
            ) : canvases.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {canvases.map((canvas) => (
                  <div
                    key={canvas.id}
                    onClick={() => router.push(`/canvas/${canvas.slug}`)}
                    className="p-6 rounded-3xl border hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                    style={{
                      backgroundColor: "rgba(184, 207, 206, 0.3)",
                      borderColor: "#B8CFCE",
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center mr-2"
                          style={{ backgroundColor: "#7F8CAA" }}
                        >
                          <Palette className="w-4 h-4 text-white" />
                        </div>
                        <h3
                          className="font-semibold text-lg truncate"
                          style={{ color: "#333446" }}
                          title={canvas.slug}
                        >
                          {canvas.slug || `Canvas ${canvas.id.substring(0, 6)}`}
                        </h3>
                      </div>
                      <button className="p-1 rounded-full hover:bg-white/50 transition-colors">
                        <MoreHorizontal
                          className="w-4 h-4"
                          style={{ color: "#333446" }}
                        />
                      </button>
                    </div>
                    {canvas.createdAt && (
                      <p
                        className="text-xs"
                        style={{ color: "#333446", opacity: 0.6 }}
                      >
                       Created at: {formatDate(canvas.createdAt)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <PackageOpen
                  className="w-16 h-16 mb-4"
                  style={{ color: "#7F8CAA" }}
                />
                <h3
                  className="text-xl font-semibold mb-2"
                  style={{ color: "#333446" }}
                >
                  No Canvas Yet
                </h3>
                <p
                  className="text-md"
                  style={{ color: "#333446", opacity: 0.7 }}
                >
                  Click &quot;New Illustration&quot; to start creating!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
