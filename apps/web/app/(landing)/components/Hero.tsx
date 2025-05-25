import { Palette, Users, Zap } from "lucide-react";
import Link from "next/link";
import ShapesBackground from "../../../components/ShapesBackground";

const Hero = () => {
  return (
    <section
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: "#EAEFEF" }}
    >
      <ShapesBackground />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <div className="space-y-8">
          <h1
            className="text-6xl md:text-7xl font-bold leading-tight"
            style={{ color: "#333446" }}
          >
            <span style={{ color: "#7F8CAA" }}>Draw</span> together,
            <br />
            <span style={{ color: "#B8CFCE" }}>create</span> forever
          </h1>

          <p
            className="text-xl md:text-2xl max-w-2xl mx-auto font-medium"
            style={{ color: "#333446", opacity: 0.8 }}
          >
            A collaborative whiteboard where ideas come to life through
            illustrations
          </p>

          <div className="flex flex-wrap justify-center gap-6 py-8">
            <div
              className="flex items-center space-x-2 backdrop-blur-sm px-4 py-2 rounded-full border"
              style={{
                backgroundColor: "rgba(184, 207, 206, 0.6)",
                borderColor: "#B8CFCE",
              }}
            >
              <Palette className="w-5 h-5" style={{ color: "#7F8CAA" }} />
              <span className="font-medium" style={{ color: "#333446" }}>
                Draw & Sketch
              </span>
            </div>
            <div
              className="flex items-center space-x-2 backdrop-blur-sm px-4 py-2 rounded-full border"
              style={{
                backgroundColor: "rgba(127, 140, 170, 0.6)",
                borderColor: "#7F8CAA",
              }}
            >
              <Users className="w-5 h-5" style={{ color: "#B8CFCE" }} />
              <span className="font-medium text-white">
                Real-time Collaboration
              </span>
            </div>
            <div
              className="flex items-center space-x-2 backdrop-blur-sm px-4 py-2 rounded-full border"
              style={{
                backgroundColor: "rgba(184, 207, 206, 0.6)",
                borderColor: "#B8CFCE",
              }}
            >
              <Zap className="w-5 h-5" style={{ color: "#7F8CAA" }} />
              <span className="font-medium" style={{ color: "#333446" }}>
                Instant Sync
              </span>
            </div>
          </div>

          <div className="pt-4">
            <Link
              href="/login"
              className="inline-block text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              style={{ backgroundColor: "#7F8CAA" }}
            >
              Start Drawing Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
