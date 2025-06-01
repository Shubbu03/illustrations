import { Github } from "lucide-react";

export default function Footer() {
  return (
    <footer
      className="w-full py-4 sm:py-6"
      style={{ backgroundColor: "#7F8CAA" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <p className="text-sm sm:text-base text-center text-white leading-relaxed flex items-center gap-2">
              made with{" "}
              <span className="text-red-400" aria-label="love">
                ❤️
              </span>{" "}
              by shubham
              <a
                href="https://github.com/Shubbu03"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 ml-1 hover:text-gray-200 transition-colors duration-200"
                aria-label="Visit Shubham's GitHub profile"
              >
                <Github className="w-4 h-4" />
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
