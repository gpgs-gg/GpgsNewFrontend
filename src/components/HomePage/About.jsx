import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/autoplay";

import bed7 from "../../images_of_male_pg/photo7.jpeg";
import bed14 from "../../images_of_male_pg/photo14.jpeg";
import bed15 from "../../images_of_male_pg/photo15.jpeg";
import bed18 from "../../images_of_male_pg/photo18.jpeg";

import gbed2 from "../../images_of_female_pg/photo2.jpeg";
import gbed7 from "../../images_of_female_pg/photo7.jpeg";
import gbed18 from "../../images_of_female_pg/photo18.jpeg";
import gbed25 from "../../images_of_female_pg/photo25.jpeg";
import gbed26 from "../../images_of_female_pg/photo26.jpeg";
import gbed30 from "../../images_of_female_pg/photo30.jpeg";

import TeamPng from "../../logo/Team.png";
import ArrowBulbPng from "../../logo/Arrow-Bulb.png";

import { Link } from "react-router-dom";

const About = () => {
  const [swiperInstance, setSwiperInstance] = useState(null);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-out-cubic",
    });

    AOS.refresh();
  }, []);

  const galleryImages = [
    bed18,
    gbed26,
    bed7,
    gbed7,
    bed14,
    bed15,
    gbed2,
    gbed18,
    gbed25,
    gbed30,
  ];

  const reasons = [
    "Non-compromising service quality",
    "Daily housekeeping",
    "Prime residential locations",
    "In-house maintenance team",
    "Safe & secure premises",
    "Dedicated customer support",
    "Branded furniture & appliances",
    "Scheduled appliance servicing",
    "Transparent pricing",
    "Quarterly deep cleaning & pest control",
  ];

  return (
    <section id="about" className="bg-white py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* ==========================================================
            SECTION HEADER
        ========================================================== */}

        <div data-aos="fade-up" className="mb-14 max-w-3xl">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#9b6845]">
            About us
          </span>

          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-[#14223f] sm:text-5xl lg:text-6xl">
            More than a room.
            <br />A place to call home.
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-7 text-[#6d6b66] sm:text-lg">
            We create thoughtfully managed living spaces where comfort, safety
            and service come together to make everyday living easier.
          </p>
        </div>

        {/* ==========================================================
            MAIN ABOUT GRID
        ========================================================== */}

        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          {/* ========================================================
              LEFT — STORY
          ======================================================== */}

          <div
            data-aos="fade-right"
            className="relative overflow-hidden rounded-[30px] bg-[#f7f4ee] p-7 sm:p-9 lg:p-10"
          >
            {/* Experience Badge */}

            <div
              className="
                absolute
                right-6
                top-6
                flex
                h-28
                w-28
                flex-col
                items-center
                justify-center
                rounded-full
                bg-[#14223f]
                text-center
                text-white
                shadow-lg
                sm:h-32
                sm:w-32
              "
            >
              <span className="text-3xl font-semibold">10+</span>

              <span className="mt-1 text-[10px] uppercase tracking-[0.15em] text-white/60">
                Years
              </span>

              <span className="text-[10px] text-white/70">Experience</span>
            </div>

            {/* Intro */}

            <div className="max-w-[80%] pt-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9b6845]">
                Our story
              </span>

              <h3 className="mt-3 text-2xl font-semibold leading-tight text-[#14223f] sm:text-3xl">
                Built around people,
                <br />
                not just properties.
              </h3>
            </div>

            {/* Who We Are */}

            <div
              data-aos="fade-up"
              className="
                mt-10
                rounded-[24px]
                bg-white
                p-6
                shadow-[0_12px_35px_rgba(44,36,28,0.05)]
                sm:p-7
              "
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f7f4ee]">
                  <img
                    src={TeamPng}
                    alt=""
                    className="h-7 w-7 object-contain"
                  />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9b6845]">
                    Who we are
                  </p>

                  <h4 className="mt-1 text-lg font-semibold text-[#14223f]">
                    Experienced accommodation professionals
                  </h4>
                </div>
              </div>

              <p className="mt-5 text-sm leading-7 text-[#6d6b66]">
                We are a team of dedicated and qualified professionals with 10+
                years of experience in accommodation and maintenance services.
                Our structured departments and refined processes ensure the best
                possible experience for our residents.
              </p>
            </div>

            {/* Mission */}

            <div
              data-aos="fade-up"
              className="
                mt-4
                rounded-[24px]
                bg-white
                p-6
                shadow-[0_12px_35px_rgba(44,36,28,0.05)]
                sm:p-7
              "
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f7f4ee]">
                  <img
                    src={ArrowBulbPng}
                    alt=""
                    className="h-7 w-7 object-contain"
                  />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9b6845]">
                    Our mission
                  </p>

                  <h4 className="mt-1 text-lg font-semibold text-[#14223f]">
                    Make every stay feel like home
                  </h4>
                </div>
              </div>

              <p className="mt-5 text-sm leading-7 text-[#6d6b66]">
                We believe in providing comfortable homes for everyone —
                creating spaces that feel just like your own. We serve beyond
                business with prompt issue resolution and professional services
                tailored to every need.
              </p>
            </div>
          </div>

          {/* ========================================================
              RIGHT — PROPERTY GALLERY
          ======================================================== */}

          <div
            data-aos="fade-left"
            className="
              overflow-hidden
              rounded-[30px]
              bg-[#14223f]
              p-3
              shadow-[0_18px_55px_rgba(20,34,63,0.10)]
              sm:p-4
            "
          >
            {/* Gallery */}

            <div
              onMouseEnter={() => swiperInstance?.autoplay?.stop()}
              onMouseLeave={() => swiperInstance?.autoplay?.start()}
              className="overflow-hidden rounded-[24px]"
            >
              <Swiper
                modules={[Autoplay]}
                autoplay={{
                  delay: 2800,
                  disableOnInteraction: false,
                }}
                loop
                slidesPerView={1}
                onSwiper={(swiper) => setSwiperInstance(swiper)}
              >
                {galleryImages.map((image, index) => (
                  <SwiperSlide key={index}>
                    <div className="relative">
                      <img
                        src={image}
                        alt={`Gopal's PG property ${index + 1}`}
                        className="
                          h-[360px]
                          w-full
                          object-cover
                          sm:h-[460px]
                          lg:h-[580px]
                        "
                      />

                      {/* Image Overlay */}

                      <div
                        className="
                          absolute
                          inset-x-0
                          bottom-0
                          bg-gradient-to-t
                          from-black/60
                          via-black/10
                          to-transparent
                          p-6
                          sm:p-8
                        "
                      >
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
                          Gopal's Paying Guest
                        </p>

                        <p className="mt-1 text-lg font-medium text-white sm:text-xl">
                          Spaces designed for comfortable living.
                        </p>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Gallery Footer */}

            <div className="flex flex-col gap-5 px-3 pb-3 pt-6 sm:flex-row sm:items-center sm:justify-between sm:px-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4a06e]">
                  Our spaces
                </p>

                <h3 className="mt-1 text-xl font-semibold text-white">
                  Designed for modern living.
                </h3>
              </div>

              <Link
                to="/contact"
                className="
                  inline-flex
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  px-6
                  py-3
                  text-sm
                  font-semibold
                  text-[#14223f]
                  transition-all
                  hover:-translate-y-0.5
                  hover:bg-[#f7f4ee]
                "
              >
                Connect With Us →
              </Link>
            </div>
          </div>
        </div>

        {/* ==========================================================
            WHY CHOOSE US
        ========================================================== */}

        <div
          data-aos="fade-up"
          className="
            mt-8
            rounded-[30px]
            bg-[#f7f4ee]
            p-7
            sm:p-9
            lg:p-11
          "
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9b6845]">
                The difference
              </span>

              <h3 className="mt-3 text-3xl font-semibold text-[#14223f] sm:text-4xl">
                Why residents choose us.
              </h3>
            </div>

            <p className="max-w-md text-sm leading-6 text-[#77736c]">
              From daily housekeeping to responsive maintenance, every detail is
              managed to make your stay simpler and more comfortable.
            </p>
          </div>

          {/* Feature Grid */}

          <div className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {reasons.map((reason, index) => (
              <div
                key={index}
                className="
                  group
                  flex
                  items-center
                  gap-3
                  rounded-2xl
                  bg-white
                  p-4
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:shadow-[0_10px_25px_rgba(44,36,28,0.06)]
                "
              >
                <span
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-[#14223f]
                    text-xs
                    text-white
                    transition-transform
                    duration-300
                    group-hover:scale-105
                  "
                >
                  ✓
                </span>

                <span className="text-sm font-medium leading-5 text-[#4f4c47]">
                  {reason}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ==========================================================
            BOTTOM STATEMENT / CTA
        ========================================================== */}

        <div
          data-aos="fade-up"
          className="
            mt-8
            overflow-hidden
            rounded-[30px]
            bg-[#14223f]
            px-7
            py-10
            sm:px-10
            lg:px-12
          "
        >
          <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4a06e]">
                Your next chapter
              </span>

              <h3 className="mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">
                Find a place that feels
                <br className="hidden sm:block" />
                like your own.
              </h3>

              <p className="mt-4 text-sm leading-6 text-white/60">
                Comfortable spaces, reliable services and a community that makes
                living easier.
              </p>
            </div>

            <Link
              to="/contact"
              className="
                inline-flex
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-white
                px-7
                py-3.5
                text-sm
                font-semibold
                text-[#14223f]
                transition-all
                hover:-translate-y-0.5
                hover:bg-[#f7f4ee]
              "
            >
              Upgrade Your Living →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
