import { useState, useRef, useEffect } from "react";

interface JoinCanvasDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (slug: string) => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  showError?: boolean;
  isLoading?: boolean;
}

const JoinCanvasDropdown = ({
  isOpen,
  onClose,
  onJoin,
  buttonRef,
  showError = false,
  isLoading = false,
}: JoinCanvasDropdownProps) => {
  const [slug, setSlug] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, buttonRef]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (slug.trim() && !isLoading) {
      onJoin(slug);
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full mt-2 right-0 bg-white rounded-2xl p-4 shadow-lg border z-50 w-80"
      style={{
        borderColor: "#B8CFCE",
      }}
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="slug"
            className="block text-sm font-medium mb-2"
            style={{ color: "#333446" }}
          >
            Canvas Slug
          </label>
          <input
            type="text"
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#7F8CAA] transition-all"
            style={{
              backgroundColor: "rgba(127, 140, 170, 0.1)",
              borderColor: "#B8CFCE",
              color: "#333446",
            }}
            placeholder="Enter canvas slug"
            required
            autoFocus
          />
        </div>

        {showError && (
          <div className="mb-2 text-red-500 text-sm font-medium">
            Room doesn&apos;t exist
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 rounded-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          style={{
            backgroundColor: "#7F8CAA",
            color: "white",
          }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Joining...
            </div>
          ) : (
            "Join Canvas"
          )}
        </button>
      </form>
    </div>
  );
};

export default JoinCanvasDropdown;
