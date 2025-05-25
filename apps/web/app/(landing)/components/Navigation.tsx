import { Palette } from "lucide-react";
import Link from "next/link";

const Navigation = () => {
  return (
    <nav
      className="sticky top-0 left-0 right-0 z-50 p-6 backdrop-blur-sm"
      style={{ backgroundColor: "#EAEFEF" }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
        >
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: "#7F8CAA" }}
          >
            <Palette className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold" style={{ color: "#333446" }}>
            ilustraciones
          </span>
        </Link>

        <Link
          href="/login"
          className="px-6 py-3 rounded-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          style={{
            backgroundColor: "#B8CFCE",
            color: "#333446",
          }}
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;
