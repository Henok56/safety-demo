import { useEffect, useState } from "react";
import { 
  FiShield, FiTrendingUp, FiUsers, FiAward, 
  FiGlobe, FiBarChart2, FiClock, FiCheckCircle,
  FiArrowRight, FiPlay, FiMapPin, FiMail, FiPhone
} from "react-icons/fi";
import "../styles/HomePage.css";

// Demo images - using Unsplash or placeholder images
const heroImage = "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80";
const slide1Image = "https://images.unsplash.com/photo-1540962351504-eca1ce9a5dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80";
const slide2Image = "https://images.unsplash.com/photo-1559302502-2b15507aae0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80";

const slides = [
  {
    image: slide1Image,
    title: "Flight Data Monitoring Excellence",
    text: "Leveraging advanced analytics to enhance operational safety and performance"
  },
  {
    image: slide2Image,
    title: "Safety Management System",
    text: "Proactive risk management and continuous improvement culture"
  }
];

export default function HomePage() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="homepage">
      {/* Hero Slider Section */}
      <div className="hero-slider">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`slide ${i === index ? "active" : ""}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="slide-overlay">
              <div className="slide-content">
                <h1>{slide.title}</h1>
                <p>{slide.text}</p>
                <button className="cta-button">
                  Learn More <FiArrowRight />
                </button>
              </div>
            </div>
          </div>
        ))}
        <div className="slider-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`dot ${i === index ? "active" : ""}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <FiGlobe />
              </div>
              <div className="stat-number">500+</div>
              <div className="stat-label">Aircraft Monitored</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <FiUsers />
              </div>
              <div className="stat-number">10K+</div>
              <div className="stat-label">Safety Reports Processed</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <FiAward />
              </div>
              <div className="stat-number">99.8%</div>
              <div className="stat-label">Data Integrity Rate</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <FiClock />
              </div>
              <div className="stat-number">24/7</div>
              <div className="stat-label">Real-time Monitoring</div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="about-section">
        <div className="container">
          <div className="about-grid">
            <div className="about-content">
              <span className="section-tag">About Us</span>
              <h2>Setting New Standards in Aviation Safety</h2>
              <p>
                Our Flight Operations Safety Office is dedicated to maintaining the highest 
                standards of aviation safety through continuous monitoring, analysis, and improvement.
              </p>
              <div className="about-features">
                <div className="feature">
                  <FiCheckCircle />
                  <span>Proactive Risk Management</span>
                </div>
                <div className="feature">
                  <FiCheckCircle />
                  <span>Data-Driven Decision Making</span>
                </div>
                <div className="feature">
                  <FiCheckCircle />
                  <span>Continuous Safety Culture</span>
                </div>
                <div className="feature">
                  <FiCheckCircle />
                  <span>Regulatory Compliance Excellence</span>
                </div>
              </div>
            </div>
            <div className="about-image">
              <img src={heroImage} alt="Aviation Safety" />
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="services-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Our Services</span>
            <h2>Comprehensive Safety Solutions</h2>
            <p>Delivering excellence across all aspects of flight operations safety</p>
          </div>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">
                <FiTrendingUp />
              </div>
              <h3>Flight Data Monitoring</h3>
              <p>Advanced analytics and trend identification for proactive safety management</p>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <FiShield />
              </div>
              <h3>Safety Management System</h3>
              <p>Comprehensive safety reporting, assurance, and promotion programs</p>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <FiBarChart2 />
              </div>
              <h3>Risk Assessment</h3>
              <p>Thorough hazard identification and risk mitigation strategies</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="contact-section">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info">
              <h2>Get in Touch</h2>
              <p>Have questions about our safety programs? Our team is ready to assist you.</p>
              <div className="contact-details">
                <div className="contact-item">
                  <FiMapPin />
                  <span>Addis Ababa, Ethiopia</span>
                </div>
                <div className="contact-item">
                  <FiMail />
                  <span>safety@example.com</span>
                </div>
                <div className="contact-item">
                  <FiPhone />
                  <span>+251 11 234 56..</span>
                </div>
              </div>
            </div>
            <form className="contact-form">
              <input type="text" placeholder="Your Name" />
              <input type="email" placeholder="Your Email" />
              <textarea placeholder="Your Message" rows="4"></textarea>
              <button type="submit">Send Message</button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>Flight Operations Safety</h3>
              <p>Committed to aviation safety excellence</p>
            </div>
            <div className="footer-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Contact Us</a>
            </div>
            <div className="footer-copyright">
              <p>© 2024 Flight Operations Safety Office. All rights reserved.</p>
              <p className="demo-notice">Demonstration Version - For Presentation Only</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}