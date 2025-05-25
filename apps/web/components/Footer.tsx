export default function Footer() {
  return (
    <footer className="py-8" style={{ backgroundColor: "#EAEFEF" }}>
      <div className="max-w-6xl mx-auto px-4">
        <p className="text-center text-sm text-gray-600">
          &copy; {new Date().getFullYear()} ilustraciones, made with ❤️ by{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/Shubbu03"
            className="underline"
          >
            shubham
          </a>
        </p>
      </div>
    </footer>
  );
}
