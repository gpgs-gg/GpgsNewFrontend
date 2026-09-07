import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { Link } from "react-router-dom";
import {
  Phone,
  MessageCircle,
  Headphones,
  ArrowRight,
  MapPin,
  Clock3,
  ShieldCheck,
} from "lucide-react";

import "swiper/css";
import "swiper/css/pagination";

import bed2 from "../../images_of_male_pg/bed2.png";
import bed11 from "../../images_of_male_pg/photo11.jpeg";

import gbed1 from "../../images_of_female_pg/photo1.jpeg";
import gbed3 from "../../images_of_female_pg/photo3.jpeg";
import gbed14 from "../../images_of_female_pg/photo14.jpeg";
import gbed15 from "../../images_of_female_pg/photo15.jpeg";
import gbed16 from "../../images_of_female_pg/photo16.jpeg";
import gbed17 from "../../images_of_female_pg/photo17.jpeg";
import gbed20 from "../../images_of_female_pg/photo20.jpeg";
import gbed21 from "../../images_of_female_pg/photo21.jpeg";
import gbed23 from "../../images_of_female_pg/photo23.jpeg";

import Footer from "./Footer";

const galleryImages = [
  gbed1,
  gbed3,
  gbed20,
  gbed14,
  gbed15,
  gbed16,
  gbed17,
  gbed21,
  gbed23,
  bed2,
  bed11,
];

const salesContacts = [
  {
    name: "Sales Team",
    phone: "9326262292",
  },
  {
    name: "Sales Support",
    phone: "7021368623",
  },
];

const supportContacts = [
  {
    name: "Customer Care",
    phone: "8928191814",
  },
];

const Contact = () => {
  return (
    <>
      <section
        id="contact"
        className="relative overflow-hidden bg-[#f7f7f5] py-20 sm:py-24 lg:py-28"
      >
        {/* Background decoration */}
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-gray-200/40 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-gray-300/30 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* ================= HEADER ================= */}
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-600 shadow-sm">
              <MessageCircle size={14} />
              We're here to help
            </span>

            <h2 className="text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl lg:text-6xl">
              Let’s Find Your
              <span className="block text-gray-500">Perfect Stay</span>
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
              Have a question about our PGs, rooms, pricing or availability? Our
              team is ready to help you find the right accommodation.
            </p>
          </div>

          {/* ================= MAIN CARD ================= */}
          <div className="overflow-hidden rounded-[2rem] bg-[#111111] shadow-[0_25px_80px_rgba(0,0,0,0.15)]">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
              {/* ================= LEFT ================= */}
              <div className="relative p-6 text-white sm:p-8 lg:p-12">
                {/* subtle background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_40%)]" />

                <div className="relative">
                  <div className="mb-8">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                      Contact Us
                    </p>

                    <h3 className="max-w-md text-3xl font-bold leading-tight sm:text-4xl">
                      Speak with our
                      <span className="text-gray-400"> team today.</span>
                    </h3>

                    <p className="mt-4 max-w-md text-sm leading-6 text-gray-400 sm:text-base">
                      Whether you're looking for a private room, shared
                      accommodation or simply want to schedule a visit, we're
                      just one call away.
                    </p>
                  </div>

                  {/* ================= SALES ================= */}
                  <div className="mb-6">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                        <Phone size={17} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-white">
                          Sales & Bookings
                        </p>
                        <p className="text-xs text-gray-500">
                          For rooms & property enquiries
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {salesContacts.map((contact, index) => (
                        <div
                          key={index}
                          className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.06] p-4 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.1]"
                        >
                          <div>
                            <p className="text-xs text-gray-500">
                              {contact.name}
                            </p>

                            <a
                              href={`tel:${contact.phone}`}
                              className="mt-1 block text-lg font-semibold text-white transition-colors hover:text-gray-300"
                            >
                              {contact.phone}
                            </a>
                          </div>

                          <a
                            href={`tel:${contact.phone}`}
                            aria-label={`Call ${contact.name}`}
                            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black transition-all duration-300 hover:scale-105 hover:bg-gray-200"
                          >
                            <Phone size={18} />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ================= CUSTOMER CARE ================= */}
                  <div className="mb-8">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                        <Headphones size={17} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-white">
                          Customer Care
                        </p>
                        <p className="text-xs text-gray-500">
                          Existing residents & support
                        </p>
                      </div>
                    </div>

                    {supportContacts.map((contact, index) => (
                      <div
                        key={index}
                        className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.06] p-4 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.1]"
                      >
                        <div>
                          <p className="text-xs text-gray-500">
                            {contact.name}
                          </p>

                          <a
                            href={`tel:${contact.phone}`}
                            className="mt-1 block text-lg font-semibold text-white transition-colors hover:text-gray-300"
                          >
                            {contact.phone}
                          </a>
                        </div>

                        <a
                          href={`tel:${contact.phone}`}
                          aria-label="Call Customer Care"
                          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black transition-all duration-300 hover:scale-105 hover:bg-gray-200"
                        >
                          <Phone size={18} />
                        </a>
                      </div>
                    ))}
                  </div>

                  {/* ================= WHATSAPP CTA ================= */}
                  <a
                    href="https://wa.me/9326262292"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex w-full items-center justify-between rounded-2xl bg-white p-4 text-black transition-all duration-300 hover:bg-gray-200 sm:p-5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-white">
                        <MessageCircle size={20} />
                      </div>

                      <div>
                        <p className="font-semibold">
                          Chat with us on WhatsApp
                        </p>

                        <p className="text-xs text-gray-500">
                          Quick response from our team
                        </p>
                      </div>
                    </div>

                    <ArrowRight
                      size={20}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </a>
                </div>
              </div>

              {/* ================= RIGHT IMAGE ================= */}
              <div className="relative min-h-[420px] overflow-hidden lg:min-h-[650px]">
                <Swiper
                  modules={[Autoplay, Pagination]}
                  autoplay={{
                    delay: 2500,
                    disableOnInteraction: false,
                  }}
                  pagination={{
                    clickable: true,
                  }}
                  loop
                  slidesPerView={1}
                  className="h-full w-full"
                >
                  {galleryImages.map((imgSrc, index) => (
                    <SwiperSlide key={index}>
                      <div className="relative h-full w-full">
                        <img
                          src={imgSrc}
                          alt={`Gopal's PG accommodation ${index + 1}`}
                          className="h-full w-full object-cover"
                        />

                        {/* Image overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                        {/* Image content */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8 lg:p-10">
                          <div className="mb-3 flex items-center gap-2">
                            <MapPin size={17} />

                            <span className="text-sm font-medium">
                              Navi Mumbai
                            </span>
                          </div>

                          <h3 className="text-2xl font-bold sm:text-3xl">
                            Comfortable spaces.
                          </h3>

                          <p className="mt-1 text-sm text-white/70 sm:text-base">
                            Designed to feel like home.
                          </p>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          </div>

          {/* ================= TRUST FEATURES ================= */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Feature */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <Clock3 size={19} className="text-gray-800" />
              </div>

              <h4 className="font-semibold text-gray-900">Quick Response</h4>

              <p className="mt-1 text-sm leading-5 text-gray-500">
                Our team responds quickly to your enquiries.
              </p>
            </div>

            {/* Feature */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <ShieldCheck size={19} className="text-gray-800" />
              </div>

              <h4 className="font-semibold text-gray-900">
                Trusted PG Service
              </h4>

              <p className="mt-1 text-sm leading-5 text-gray-500">
                Professional accommodation with reliable support.
              </p>
            </div>

            {/* Feature */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <MapPin size={19} className="text-gray-800" />
              </div>

              <h4 className="font-semibold text-gray-900">Prime Locations</h4>

              <p className="mt-1 text-sm leading-5 text-gray-500">
                Multiple convenient locations across Navi Mumbai.
              </p>
            </div>
          </div>

          {/* ================= BOTTOM CTA ================= */}
          <div className="mt-12 text-center">
            <p className="mb-4 text-sm text-gray-500">
              Ready to explore your next home?
            </p>

            <Link
              to="/contact"
              className="group inline-flex items-center gap-3 rounded-full bg-black px-7 py-4 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-gray-800 hover:shadow-xl sm:text-base"
            >
              Reserve Your Spot
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black transition-transform duration-300 group-hover:translate-x-1">
                <ArrowRight size={15} />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Contact;
