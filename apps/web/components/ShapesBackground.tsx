export default function ShapesBackground() {
  return (
    <div className="absolute inset-0">
      <div
        className="absolute top-20 left-10 w-24 h-24 rounded-full"
        style={{ backgroundColor: "#B8CFCE", opacity: 0.6 }}
      ></div>
      <div
        className="absolute top-40 right-20 w-32 h-32 rounded-3xl rotate-12"
        style={{ backgroundColor: "#7F8CAA", opacity: 0.4 }}
      ></div>
      <div
        className="absolute bottom-20 right-10 w-20 h-20 rounded-full"
        style={{ backgroundColor: "#B8CFCE", opacity: 0.5 }}
      ></div>
      <div
        className="absolute  bottom-12 left-1/4 w-28 h-28 rounded-2xl -rotate-12"
        style={{ backgroundColor: "#7F8CAA", opacity: 0.3 }}
      ></div>
    </div>
  );
}
