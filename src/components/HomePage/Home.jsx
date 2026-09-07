import { ReactTyped } from "react-typed";
import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Link } from "react-router-dom";
import {
  FaWhatsapp,
  FaPhoneAlt,
  FaArrowRight,
  FaMapMarkerAlt,
  FaStar,
} from "react-icons/fa";
import video1 from "../../videos/PV1NL21-privateR.mp4";
import "./Home.css";

const Home = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: "ease-out-cubic",
    });
  }, []);

  return (
    <>
      {/* ================= HERO ================= */}
      <section
        id="home"
        className="relative min-h-screen overflow-hidden bg-[#17120f]"
      >
        {/* Background Video */}
        <div className="absolute inset-0">
          <video
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src={video1} type="video/mp4" />
          </video>
        </div>

        {/* Premium Overlay */}
        <div className="absolute inset-0 " />

        <div className="absolute inset-0 bg-gradient-to-r from-black/110 via-black/50 to-black/20" />

        {/* Bottom Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/80 to-transparent" />

        {/* Hero Content */}
        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-5 pb-28 pt-32 sm:px-8 lg:px-10">
          <div className="w-full max-w-4xl">
            {/* Small Badge */}
            <div
              data-aos="fade-up"
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md"
            >
              <FaStar className="text-sm text-yellow-400" />

              <span className="text-sm font-medium tracking-wide text-white">
                Premium PG & Co-Living
              </span>
            </div>

            {/* Main Heading */}
            <h1
              data-aos="fade-up"
              data-aos-delay="100"
              className="max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl"
            >
              A better place
              <br />
              <span className="text-white/60">to call home.</span>
            </h1>

            {/* Description */}
            <p
              data-aos="fade-up"
              data-aos-delay="200"
              className="mt-7 max-w-2xl text-base leading-7 text-white/75 sm:text-lg"
            >
              Beautifully furnished PG spaces designed for comfortable,
              connected and hassle-free living.
            </p>

            {/* Typed Text */}
            <div
              data-aos="fade-up"
              data-aos-delay="300"
              className="mt-4 text-sm font-medium uppercase tracking-[0.2em] text-white/60"
            >
              <ReactTyped
                strings={[
                  "Luxury without the luxury price",
                  "Your space. Your comfort. Your community.",
                  "Move in. Feel at home.",
                ]}
                typeSpeed={35}
                backSpeed={20}
                loop
              />
            </div>

            {/* CTA */}
            <div
              data-aos="fade-up"
              data-aos-delay="400"
              className="mt-9 flex flex-col gap-3 sm:flex-row"
            >
              <Link
                to="/contact"
                className="group flex items-center justify-center gap-3 rounded-full bg-white px-7 py-4 text-sm font-semibold text-black transition-all duration-300 hover:bg-[#f2eee9] hover:shadow-2xl"
              >
                Explore Your Stay
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-white transition-transform duration-300 group-hover:translate-x-1">
                  <FaArrowRight className="text-xs" />
                </span>
              </Link>

              {/* <Link
                to="/properties"
                className="flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-7 py-4 text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:bg-white/20"
              >
                View Properties
              </Link> */}
            </div>
          </div>
        </div>

        {/* ================= FLOATING SEARCH ================= */}
        <div
          data-aos="fade-up"
          data-aos-delay="500"
          className="absolute bottom-7 left-1/2 z-20 w-[calc(100%-2rem)] max-w-5xl -translate-x-1/2"
        ></div>
      </section>

      {/* ================= STATS ================= */}
      <section className="bg-[#f7f5f2]  py-14 flex items-center justify-between gap-x-12">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 md:grid-cols-4">
          <div className="text-center md:text-left">
            <h3 className="text-3xl font-semibold text-[#1c1714] md:text-4xl">
              10+
            </h3>
            <p className="mt-2 text-sm text-gray-500">Years of Experience</p>
          </div>

          <div className="text-center md:text-left">
            <h3 className="text-3xl font-semibold text-[#1c1714] md:text-4xl">
              4K+
            </h3>
            <p className="mt-2 text-sm text-gray-500">Happy Residents</p>
          </div>

          <div className="text-center md:text-left">
            <h3 className="text-3xl font-semibold text-[#1c1714] md:text-4xl">
              500+
            </h3>
            <p className="mt-2 text-sm text-gray-500">Positive Reviews</p>
          </div>

          <div className="text-center md:text-left">
            <h3 className="text-3xl font-semibold text-[#1c1714] md:text-4xl">
              24/7
            </h3>
            <p className="mt-2 text-sm text-gray-500">Resident Support</p>
          </div>
        </div>
      </section>

      {/* ================= FLOATING CONTACT ================= */}
      <div className="fixed bottom-6 right-5 z-50 flex flex-col gap-3">
        <a
          href="https://wa.me/9326262292"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-xl text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105"
          title="Chat with us on WhatsApp"
          aria-label="WhatsApp Chat"
        >
          <FaWhatsapp />
        </a>

        <a
          href="tel:9326262292"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1c1714] text-lg text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105"
          title="Call us"
          aria-label="Call Us"
        >
          <FaPhoneAlt />
        </a>
      </div>
    </>
  );
};

export default Home;
