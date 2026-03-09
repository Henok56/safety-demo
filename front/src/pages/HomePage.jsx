import { useEffect, useState } from "react";
import "../styles/HomePage.css";

// Images (ORDER MATTERS)
import img1 from "../assets/images/fdmtraining.jpg";
import img2 from "../assets/images/fltops.jpg";
import img3 from "../assets/images/Groundhandling.jpg";
import img4 from "../assets/images/line-maintenance-min.jpg";
import img5 from "../assets/images/atc.jpg";
import img6 from "../assets/images/cabinservice.jpg";
import img7 from "../assets/images/cargo.jpg";

const slides = [
  {
    image: img1,
    title: "FDM Team",
    text: "Enhancing flight safety through data-driven monitoring and continuous training."
  },
  {
    image: img2,
    title: "Flight Operations Safety",
    text: "Ensuring safe, efficient, and compliant flight operations at all times."
  },

];

export default function HomePage() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000); // 5 seconds per slide

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="home-slider">
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`slide ${i === index ? "active" : ""}`}
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          <div className="overlay">
            <h1>{slide.title}</h1>
            <p>{slide.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
