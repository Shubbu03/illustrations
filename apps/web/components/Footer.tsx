export default function Footer() {
  return (
    <footer
      className="py-6 sm:py-8 lg:py-10"
      style={{ backgroundColor: "#EAEFEF" }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 sm:gap-4">
          <p className="text-center sm:text-left text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed">
            &copy; {new Date().getFullYear()} ilustraciones
          </p>
          <p className="text-center sm:text-right text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed">
            made with{" "}
            <span className="text-red-500" aria-label="love">
              ❤️
            </span>{" "}
            by{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/Shubbu03"
              className="underline hover:text-gray-800 transition-colors duration-200 font-medium cursor-pointer"
            >
              shubham
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
