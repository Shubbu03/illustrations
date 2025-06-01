import { useState, useEffect } from "react";
import { X, Copy, Check, Share2 } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
}

const ShareModal = ({ isOpen, onClose, slug }: ShareModalProps) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/canvas/${slug}`;

  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-opacity-15 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div
        className="rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 border w-full max-w-md mx-4"
        style={{
          backgroundColor: "rgba(184, 207, 206, 0.95)",
          borderColor: "#B8CFCE",
          backdropFilter: "blur(10px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: "rgba(127, 140, 170, 0.1)" }}
            >
              <Share2 className="w-5 h-5" style={{ color: "#7F8CAA" }} />
            </div>
            <h2 className="text-xl font-semibold" style={{ color: "#333446" }}>
              Share Canvas
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" style={{ color: "#333446" }} />
          </button>
        </div>

        <div className="mb-6">
          <label
            className="block text-sm font-medium mb-3"
            style={{ color: "#333446" }}
          >
            Anyone with this link can view and edit the canvas
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#7F8CAA] transition-all text-sm"
              style={{
                backgroundColor: "rgba(234, 239, 239, 0.8)",
                borderColor: "#B8CFCE",
                color: "#333446",
              }}
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-pointer flex items-center gap-2 min-w-[80px] justify-center"
              style={{
                backgroundColor: copied ? "#10B981" : "#7F8CAA",
                color: "white",
              }}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span className="text-sm">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="text-sm">Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div
          className="p-3 rounded-lg text-sm"
          style={{
            backgroundColor: "rgba(127, 140, 170, 0.1)",
            color: "#333446",
          }}
        >
          <p className="opacity-80">
            <strong>Tip:</strong> Share this link with others to collaborate in
            real-time on the same canvas!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
