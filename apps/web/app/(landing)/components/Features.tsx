import { Palette, Users, Heart, Sparkles } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Palette,
      title: "Intuitive Drawing",
      description: "Simple tools that feel natural, just like drawing on paper",
    },
    {
      icon: Users,
      title: "Real-time Magic",
      description: "See everyone's strokes appear instantly as they draw",
    },
    {
      icon: Heart,
      title: "Share & Export",
      description: "Save your masterpieces and share them with the world",
    },
    {
      icon: Sparkles,
      title: "No Limits",
      description: "Infinite canvas for infinite creativity",
    },
  ];

  return (
    <section className="py-20" style={{ backgroundColor: "#EAEFEF" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: "#333446" }}
          >
            Why <span style={{ color: "#7F8CAA" }}>ilustraciones</span>?
          </h2>
          <p
            className="text-xl max-w-2xl mx-auto"
            style={{ color: "#333446", opacity: 0.8 }}
          >
            Everything you need to bring your ideas to life, together
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 backdrop-blur-sm rounded-3xl border hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
              style={{
                backgroundColor: "rgba(184, 207, 206, 0.5)",
                borderColor: "#B8CFCE",
              }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "#7F8CAA" }}
              >
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3
                className="text-xl font-semibold mb-3"
                style={{ color: "#333446" }}
              >
                {feature.title}
              </h3>
              <p style={{ color: "#333446", opacity: 0.8 }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
