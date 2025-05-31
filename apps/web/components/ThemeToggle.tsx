import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, Palette } from "lucide-react";
import { IconButton } from "./IconButton";

const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  if (!mounted) {
    return (
      <IconButton
        onClick={() => {}}
        activated={false}
        icon={<Palette size={20} />}
      />
    );
  }

  const getThemeIcon = () => {
    if (theme === "system") return <Monitor size={20} />;
    if (resolvedTheme === "dark") return <Moon size={20} />;
    return <Sun size={20} />;
  };

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <div style={{ position: "relative" }}>
      <IconButton
        ref={buttonRef}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        activated={isDropdownOpen}
        icon={getThemeIcon()}
      />

      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(40, 40, 40, 0.95)",
            borderRadius: "0.75rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            padding: "0.5rem",
            minWidth: "120px",
            zIndex: 1000,
            backdropFilter: "blur(10px)",
          }}
        >
          {themeOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => {
                  setTheme(option.value);
                  setIsDropdownOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "0.5rem",
                  background:
                    theme === option.value
                      ? "rgba(255, 255, 255, 0.1)"
                      : "transparent",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (theme !== option.value) {
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (theme !== option.value) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <IconComponent size={16} />
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
