import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
} from "react-icons/fa";
import { Mail, Phone, MapPin, ArrowUpRight, MessageCircle } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#0b0b0b] text-white">
      {/* ================= BACKGROUND ================= */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-white/[0.04] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-white/[0.04] blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ================= TOP CTA ================= */}
        <div className="border-b border-white/10 py-10 sm:py-12">
          <div className="flex flex-col gap-6 rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">
            <div className="max-w-2xl">
              <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                Your next home awaits
              </span>

              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                Ready to find your
                <span className="text-gray-500"> perfect stay?</span>
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400 sm:text-base">
                Explore our comfortable PG accommodations across Navi Mumbai and
                choose a space that feels like home.
              </p>
            </div>

            <Link
              to="/contact"
              className="group inline-flex shrink-0 items-center justify-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black transition-all duration-300 hover:-translate-y-1 hover:bg-gray-200 hover:shadow-xl sm:px-7 sm:text-base"
            >
              Book Your Stay
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-white transition-transform duration-300 group-hover:translate-x-1">
                <ArrowUpRight size={14} />
              </span>
            </Link>
          </div>
        </div>

        {/* ================= MAIN FOOTER ================= */}
        <div className="grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1fr_1fr] lg:gap-10">
          {/* ================= BRAND ================= */}
          <div>
            <Link to="/" className="inline-block">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Gopal's
                <span className="ml-2 font-normal text-gray-500">
                  Paying Guest
                </span>
              </h2>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-6 text-gray-400 sm:text-base">
              Comfortable, secure and professionally managed PG accommodations
              designed to make every stay feel like home.
            </p>

            {/* Social */}
            <div className="mt-7 flex items-center gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-gray-400 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:text-black"
              >
                <FaFacebookF size={17} />
              </a>

              <a
                href="#"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-gray-400 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:text-black"
              >
                <FaInstagram size={17} />
              </a>

              {/* <a
                href="#"
                aria-label="YouTube"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-gray-400 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:text-black"
              >
                <Youtube size={17} />
              </a> */}
            </div>
          </div>

          {/* ================= EXPLORE ================= */}
          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-white">
              Explore
            </h3>

            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link
                  to="/"
                  className="transition-colors duration-200 hover:text-white"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  to="/gallery"
                  className="transition-colors duration-200 hover:text-white"
                >
                  Gallery
                </Link>
              </li>

              <li>
                <Link
                  to="/services"
                  className="transition-colors duration-200 hover:text-white"
                >
                  Facilities
                </Link>
              </li>

              <li>
                <Link
                  to="/locations"
                  className="transition-colors duration-200 hover:text-white"
                >
                  Locations
                </Link>
              </li>

              <li>
                <Link
                  to="/about"
                  className="transition-colors duration-200 hover:text-white"
                >
                  About Us
                </Link>
              </li>

              <li>
                <Link
                  to="/contact"
                  className="transition-colors duration-200 hover:text-white"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* ================= VENTURES ================= */}
          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-white">
              Upcoming Ventures
            </h3>

            <ul className="space-y-4 text-sm text-gray-400">
              <li className="group flex items-start gap-2">
                <ArrowUpRight
                  size={15}
                  className="mt-0.5 shrink-0 text-gray-600 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                />

                <span className="transition-colors duration-200 group-hover:text-white">
                  Gopal's Homestay Services
                </span>
              </li>

              <li className="group flex items-start gap-2">
                <ArrowUpRight
                  size={15}
                  className="mt-0.5 shrink-0 text-gray-600 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                />

                <span className="transition-colors duration-200 group-hover:text-white">
                  Gopal's Property Maintenance Services
                </span>
              </li>

              <li className="group flex items-start gap-2">
                <ArrowUpRight
                  size={15}
                  className="mt-0.5 shrink-0 text-gray-600 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                />

                <span className="transition-colors duration-200 group-hover:text-white">
                  Gopal's Realty Consultancy Services
                </span>
              </li>

              <li className="group flex items-start gap-2">
                <ArrowUpRight
                  size={15}
                  className="mt-0.5 shrink-0 text-gray-600 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                />

                <span className="transition-colors duration-200 group-hover:text-white">
                  Gopal's Innovative Tech Solutions
                </span>
              </li>
            </ul>
          </div>

          {/* ================= CONTACT ================= */}
          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-white">
              Get In Touch
            </h3>

            <div className="space-y-4">
              {/* Location */}
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
                  <MapPin size={16} className="text-gray-300" />
                </div>

                <div>
                  <p className="text-sm font-medium text-white">Navi Mumbai</p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Maharashtra, India
                  </p>
                </div>
              </div>

              {/* Phone */}
              <a
                href="tel:9326262292"
                className="flex items-center gap-3 group"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
                  <Phone size={16} className="text-gray-300" />
                </div>

                <div>
                  <p className="text-sm font-medium text-white transition-colors group-hover:text-gray-300">
                    9326262292
                  </p>

                  <p className="mt-1 text-xs text-gray-500">Sales & Bookings</p>
                </div>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/9326262292"
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-2 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.05] p-3 transition-all duration-300 hover:bg-white/[0.1]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black">
                    <MessageCircle size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-white">
                      WhatsApp Us
                    </p>

                    <p className="text-xs text-gray-500">Quick response</p>
                  </div>
                </div>

                
              </a>
            </div>
          </div>
        </div>

        {/* ================= BOTTOM ================= */}
        <div className="border-t border-white/10 py-6">
          <div className="flex flex-col gap-4 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {currentYear} Gopal's Paying Guest Services. All rights
              reserved.
            </p>

            <p>
              Developed by{" "}
              <span className="font-medium text-gray-300">
                Gopal's Innovative Tech Solutions
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
