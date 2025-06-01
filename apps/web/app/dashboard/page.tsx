"use client";

import axios from "axios";
import {
  MoreHorizontal,
  Palette,
  Plus,
  UserSearch,
  Loader2,
  PackageOpen,
  Trash2,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import JoinCanvasDropdown from "../../components/JoinCanvasDropDown";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import Footer from "../../components/Footer";

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

const deleteCanvas = async (slug: string): Promise<void> => {
  const response = await axios.delete(`/api/delete-canvas/${slug}`);
  if (response.data.status !== 200) {
    throw new Error(response.data.message || "Failed to delete canvas");
  }
};

const handleLogout = () => {
  signOut();
};

const Dashboard = () => {
  const [isJoinDropdownOpen, setIsJoinDropdownOpen] = useState(false);
  const [roomNotFound, setRoomNotFound] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [deletingCanvasId, setDeletingCanvasId] = useState<string | null>(null);
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

  const deleteCanvasMutation = useMutation<void, Error, string>({
    mutationFn: deleteCanvas,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["canvases"] });
      setOpenDropdownId(null);
      setDeletingCanvasId(null);
    },
    onError: (error) => {
      console.error("Error occurred while deleting canvas", error);
      setDeletingCanvasId(null);
    },
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".canvas-dropdown")) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const handleDeleteCanvas = (slug: string, canvasId: string) => {
    setDeletingCanvasId(canvasId);
    deleteCanvasMutation.mutate(slug);
  };

  const toggleDropdown = (canvasId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenDropdownId(openDropdownId === canvasId ? null : canvasId);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#EAEFEF" }}
    >
      <header className="w-full py-4 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center">
            <div className="flex items-center gap-3 cursor-pointer">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: "#7F8CAA" }}
              >
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div className="group">
                <h1
                  className="text-2xl font-bold tracking-tight"
                  style={{ color: "#333446" }}
                >
                  ilustraciones
                </h1>
                <div
                  className="h-0.5 w-0 group-hover:w-full transition-all duration-300 ease-out"
                  style={{ backgroundColor: "#7F8CAA" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-3xl font-semibold"
                style={{ color: "#333446" }}
              >
                My Illustrations
              </h2>
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
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-pointer"
                  style={{
                    backgroundColor: "#7F8CAA",
                    color: "white",
                  }}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
            <p className="text-lg" style={{ color: "#333446", opacity: 0.7 }}>
              Create, collaborate, and bring your ideas to life
            </p>
          </div>

          <div className="mb-12">
            <h3
              className="text-xl font-semibold mb-6 flex items-center gap-2"
              style={{ color: "#333446" }}
            >
              <Palette className="w-5 h-5" />
              Canvas
            </h3>

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
                <h4
                  className="text-xl font-semibold mb-2"
                  style={{ color: "#333446" }}
                >
                  Error Fetching Canvas
                </h4>
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
                        <h4
                          className="font-semibold text-lg truncate"
                          style={{ color: "#333446" }}
                          title={canvas.slug}
                        >
                          {canvas.slug || `Canvas ${canvas.id.substring(0, 6)}`}
                        </h4>
                      </div>
                      <div className="relative canvas-dropdown">
                        <button
                          onClick={(e) => toggleDropdown(canvas.id, e)}
                          className="p-1 rounded-full hover:bg-white/50 transition-colors"
                          disabled={deletingCanvasId === canvas.id}
                        >
                          {deletingCanvasId === canvas.id ? (
                            <Loader2
                              className="w-4 h-4 animate-spin"
                              style={{ color: "#333446" }}
                            />
                          ) : (
                            <MoreHorizontal
                              className="w-4 h-4"
                              style={{ color: "#333446" }}
                            />
                          )}
                        </button>
                        {openDropdownId === canvas.id && (
                          <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px] cursor-pointer">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCanvas(canvas.slug, canvas.id);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1 text-red-600 hover:bg-gray-100 transition-colors text-sm cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
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
                <h4
                  className="text-xl font-semibold mb-2"
                  style={{ color: "#333446" }}
                >
                  No Canvas Yet
                </h4>
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

      <Footer />
    </div>
  );
};

export default Dashboard;
