
import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCoverflow, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";

import "./styles.css";

import bed3 from "../../images_of_male_pg/bed3.png";
import bed5 from "../../images_of_male_pg/photo5.jpeg";
import bed8 from "../../images_of_male_pg/photo8.jpeg";
import bed13 from "../../images_of_male_pg/photo13.jpeg";
import bed16 from "../../images_of_male_pg/photo16.jpeg";
import bed20 from "../../images_of_male_pg/photo20.jpeg";
import bed25 from "../../images_of_male_pg/photo25.jpeg";
import gbed19 from "../../images_of_female_pg/photo19.jpeg";
import gbed2 from "../../images_of_female_pg/photo2.jpeg";
import gbed27 from "../../images_of_female_pg/photo27.jpeg";
import { Link } from "react-router-dom";
import googlePng from "../../logo/download_google-removebg-preview.png";
import documentPng from "../../logo/Document.png";
import clockPng from "../../logo/Clock.png";
import securedPng from "../../logo/Secured.png";
import INRPng from "../../logo/INR.png";
import GreenTickPng from "../../logo/GreenTick.png";

const Services = () => {
  const [swiperInstance, setSwiperInstance] = useState(null);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-out-cubic",
    });

    AOS.refresh();
  }, []);

  // ============================================================
  // TESTIMONIALS
  // ============================================================

  const TestemonialContent = [
    {
      name: "Vanshika Gupta",
      rating: 5,
      link: "https://maps.app.goo.gl/MCP7NWLN6r2cS9eK8",
      reviewText:
        "Very systematic, very professional and the housekeeping is really good, the staffs are also very helpful & polite. They take quick actions in case we face any issues. The safety of this PG is 100% assured by them. Happy with the services.👍💯.",
    },
    {
      name: "Apoorva Sharma",
      rating: 5,
      link: "https://maps.app.goo.gl/qMrQEaYJpifQowjG8",
      reviewText:
        "Good place to live. They provide fully furnished accommodation along with well equipped kitchens and washrooms. They immediately address issues related to stay. I recommend ladies to consider Gopal's paying guest Nerul.",
    },
    {
      name: "Obaidullah Molla",
      rating: 5,
      link: "https://maps.app.goo.gl/fdbhC4jn3rG61Pz6A",
      reviewText:
        "The best PG in Navi Mumbai. All the staffs are excellent. I stayed here for 2.5 months and my experience was amazing. All the facilities like cooking gas, refrigerator etc. are available here. Staffs are quick to resolve any problem. Thanks Gopal's PG for providing excellent service at reasonable price.",
    },
    {
      name: "Sangeeta Bhatia",
      rating: 5,
      link: "https://maps.app.goo.gl/cZJf5sHUGRws3svj7",
      reviewText:
        "Accommodation is very neat clean. Every day cleaning takes place. My daughter was very safe here. They even helped with medicine when my daughter was sick. I would recommend this accommodation to everyone.",
    },
    {
      name: "Mitali Wagh",
      rating: 4,
      link: "https://maps.app.goo.gl/6751PHtGVEULJYvXA",
      reviewText:
        "PG provides all the Facilities which are required and also the members of PG are available on single call if any problems arise and quick actions are taken.",
    },
    {
      name: "Anand Arora",
      rating: 5,
      link: "https://maps.app.goo.gl/C4EBqz6uaZqkLqdw9",
      reviewText:
        "I had a great experience staying at PG. The rooms were clean, well-maintained, and offered all the basic amenities needed for a comfortable stay. The management was professional and responsive, always ready to help with any issues.",
    },
    {
      name: "Anitha Manoharan",
      rating: 4,
      link: "https://maps.app.goo.gl/d8SthHtFSVxj7xgq9",
      reviewText:
        "1. Good maintenance 2. Safe and secured 3. Our concerns are taken and solved immediately.",
    },
    {
      name: "Vaishnavi Raut",
      rating: 5,
      link: "https://maps.app.goo.gl/bkPeyR1BYWHStGG29",
      reviewText:
        "Such a wonderful PG! Daily cleaning is well-maintained, and any issues raised by PG members are addressed immediately. I’ve never seen a PG like this before. Thank you for your excellent service!",
    },
    {
      name: "Vidit Solanki",
      rating: 4,
      link: "https://maps.app.goo.gl/KDsmiM8rhkd9yCnw6",
      reviewText:
        "Good service. Actively takes action on issues raised.",
    },
    {
      name: "Yogita Bhagat",
      rating: 5,
      link: "https://maps.app.goo.gl/nbicgnhuUhAt9NAw7",
      reviewText:
        "Best property I ever seen.. Very neat and clean.. All staff is very kind and prompt....Overall, it gives best PG experience...Thank you ☺️",
    },
    {
      name: "Arjun Arjun",
      rating: 4,
      link: "https://maps.app.goo.gl/Nnex8rhrPgYUeBkZ9",
      reviewText:
        "In Gopal's Paying Guest, I stayed for 4 months. Well maintained rooms. Especially the management very responsive and nice location with easy access to market, station and park.",
    },
    {
      name: "Wajahat Khan",
      rating: 4,
      link: "https://maps.app.goo.gl/ZiRcv4JWaVdkTa6i6",
      reviewText:
        "Good PG services. Responsive. Beautiful Environment. Proximity to all important things. Cleaned from time to time.",
    },
    {
      name: "Amey Patil",
      rating: 5,
      link: "https://maps.app.goo.gl/BwAsAiNisHJCAYDEA",
      reviewText:
        "It was very good experience to stay in the This facility. The management of this facility must deserve the appreciation for efforts they are taking to provide best service to guests",
    },
    {
      name: "Manas Meshram",
      rating: 4,
      link: "https://maps.app.goo.gl/FD5hN48uTQKHSmf17",
      reviewText:
        "Good Place to stay, Everything was clean- The Kitchen, The bedroom, The bedsheets etc. The service was also good.",
    },
    {
      name: "Shubhi Dehariya",
      rating: 5,
      link: "https://maps.app.goo.gl/s96BsR5KEedeqJUi7",
      reviewText:
        "The staff is very good and helpful and cleanliness is always maintained in the PG.",
    },
    {
      name: "Sachin",
      rating: 5,
      link: "https://maps.app.goo.gl/Nx1uroWRQw4A75KPA",
      reviewText:
        "Highly recommend! Excellent service, clean property, and daily housekeeping make it perfect for short or long-term stays in Navi Mumbai. If you are searching for PG accommodation then this is the best option.",
    },
    {
      name: "Remhlupuii",
      rating: 4,
      link: "https://maps.app.goo.gl/GuidG5g4tPb12kVi9",
      reviewText:
        "The customer service was efficient and prompt. I highly recommend this place. I stayed there for 11 months, and I believe it’s the best PG I’ve experienced.",
    },
    {
      name: "Ather Khan",
      rating: 5,
      link: "https://maps.app.goo.gl/E5PTkHaQ6gUoNchH8",
      reviewText:
        "Only Professional PG Service in Navi Mumbai, Affordable, On Spot Solution And The Best Part Is They Are Really Outstanding In Maintaining PG Housekeeping, which makes them better than any other PG.",
    },
    {
      name: "Anitha Meenakshi",
      rating: 5,
      link: "https://maps.app.goo.gl/3xmJC62ggz7S7eGM7",
      reviewText:
        "The PG was very comfortable to stay and any need is there they were attending immediately. It was very safe to stay.",
    },
    {
      name: "Vedant Karale",
      rating: 5,
      link: "https://maps.app.goo.gl/S3BQWUfBBSg7nnrX6",
      reviewText:
        "Amazing PGs. Unbelievably fast problem resolution. Plumbing and electricity problems would be resolved within 3-4 hours. The management shows commendable dedication for the well-being of those who stay here.",
    },
  ];

  // ============================================================
  // ROOM OPTIONS
  // ============================================================

  const roomOptions = [
    {
      title: "Private Room",
      subtitle: "Privacy & personal space",
      price: "₹10,000 – ₹28,000",
    },
    {
      title: "Double Sharing",
      subtitle: "Comfort & connections",
      price: "₹6,500 – ₹14,000",
    },
    {
      title: "Triple Sharing",
      subtitle: "Community & convenience",
      price: "₹6,500 – ₹12,000",
    },
    {
      title: "Quad Sharing",
      subtitle: "Affordable community living",
      price: "₹8,000 – ₹10,000",
    },
  ];

  // ============================================================
  // ROOM IMAGES
  // ============================================================

  const roomImages = [
    bed3,
    bed5,
    bed8,
    gbed19,
    bed13,
    bed16,
    bed20,
    bed25,
    gbed2,
    gbed27,
  ];

  return (
    <>
      {/* ==========================================================
          GOOGLE REVIEWS
      ========================================================== */}

      <section className="bg-[#f7f4ee] py-16 sm:py-20 overflow-hidden">

        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

          {/* Heading */}

          <div
            data-aos="fade-up"
            className="mb-10 flex flex-col items-center text-center"
          >
            <span className="mb-3 text-[11px] font-bold uppercase tracking-[0.25em] text-[#9b6845]">
              Real experiences
            </span>

            <h2 className="text-3xl font-semibold tracking-tight text-[#14223f] sm:text-4xl lg:text-5xl">
              Loved by our residents
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#6d6b66] sm:text-base">
              Discover what residents have to say about their experience
              staying with us.
            </p>

            {/* Google */}

            <a
              href="https://www.google.com/maps/place/Gopal's+Paying+Guest+Services/"
              target="_blank"
              rel="noopener noreferrer"
              className="
                mt-6
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-[#ddd6ca]
                bg-white
                px-5
                py-2.5
                text-sm
                font-medium
                text-[#14223f]
                shadow-sm
                transition-all
                hover:-translate-y-0.5
                hover:shadow-md
              "
            >
              <span>See us on</span>

              <img
                src={googlePng}
                alt="Google"
                className="h-7 w-auto"
              />
            </a>
          </div>

          {/* Reviews */}

          <div
            onMouseEnter={() => swiperInstance?.autoplay?.stop()}
            onMouseLeave={() => swiperInstance?.autoplay?.start()}
          >
            <Swiper
              effect="coverflow"
              grabCursor
              centeredSlides
              slidesPerView="auto"
              loop
              autoplay={{
                delay: 2800,
                disableOnInteraction: false,
              }}
              coverflowEffect={{
                rotate: 0,
                stretch: 0,
                depth: 80,
                modifier: 3,
                slideShadows: false,
              }}
              pagination={{
                clickable: true,
              }}
              modules={[
                EffectCoverflow,
                Pagination,
                Autoplay,
              ]}
              onSwiper={(swiper) =>
                setSwiperInstance(swiper)
              }
              className="premium-review-swiper"
            >
              {TestemonialContent.map((review, index) => (
                <SwiperSlide
                  key={index}
                  className="
                    !h-auto
                    !w-[300px]
                    sm:!w-[350px]
                  "
                >
                  <a
                    href={review.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      group
                      block
                      h-full
                      rounded-[24px]
                      border
                      border-[#e8e1d6]
                      bg-white
                      p-6
                      shadow-[0_12px_40px_rgba(44,36,28,0.07)]
                      transition-all
                      duration-500
                      hover:-translate-y-1
                      hover:shadow-[0_18px_45px_rgba(44,36,28,0.11)]
                    "
                  >
                    {/* User */}

                    <div className="flex items-center gap-3">

                      <div
                        className="
                          flex
                          h-11
                          w-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-[#efe8dd]
                          text-sm
                          font-bold
                          text-[#80694a]
                        "
                      >
                        {review.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">

                        <h3 className="truncate text-sm font-semibold text-[#14223f]">
                          {review.name}
                        </h3>

                        <div className="mt-1 flex gap-0.5 text-xs">
                          {Array.from({
                            length: review.rating,
                          }).map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                        </div>

                      </div>
                    </div>

                    {/* Review */}

                    <p className="mt-5 line-clamp-5 text-sm leading-6 text-[#66635e]">
                      {review.reviewText}
                    </p>

                    <div className="mt-5 text-xs font-medium text-[#9b6845]">
                      Read on Google →
                    </div>
                  </a>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      {/* ==========================================================
          SERVICES & ROOM OPTIONS
      ========================================================== */}

      <section
        id="services"
        className="bg-white py-20 sm:py-24 lg:py-28"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

          {/* Section Heading */}

          <div
            data-aos="fade-up"
            className="mb-14 max-w-3xl"
          >
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#9b6845]">
              Stay your way
            </span>

            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-[#14223f] sm:text-5xl">
              Everything you need.
              <br />
              Nothing you don't.
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-7 text-[#6d6b66]">
              Thoughtfully designed spaces with the comfort,
              convenience and services you need for a better
              everyday stay.
            </p>
          </div>

          {/* Main Grid */}

          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">

            {/* ======================================================
                IMAGE CAROUSEL
            ====================================================== */}

            <div
              data-aos="fade-right"
              className="
                overflow-hidden
                rounded-[28px]
                bg-[#f7f4ee]
                p-3
                shadow-[0_15px_50px_rgba(44,36,28,0.08)]
              "
            >
              <div className="overflow-hidden rounded-[22px]">

                <Swiper
                  modules={[Autoplay]}
                  autoplay={{
                    delay: 2600,
                    disableOnInteraction: false,
                  }}
                  loop
                  slidesPerView={1}
                >
                  {roomImages.map((src, index) => (
                    <SwiperSlide key={index}>
                      <img
                        src={src}
                        alt={`Premium PG room ${index + 1}`}
                        className="
                          h-[330px]
                          w-full
                          object-cover
                          sm:h-[430px]
                          lg:h-[500px]
                        "
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>

              </div>

              {/* Image Bottom Card */}

              <div className="px-4 pb-3 pt-5 sm:px-6">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9b6845]">
                      Your next home
                    </p>

                    <h3 className="mt-1 text-xl font-semibold text-[#14223f]">
                      Find a space that feels right.
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
                      bg-[#14223f]
                      px-6
                      py-3
                      text-sm
                      font-semibold
                      text-white
                      transition-all
                      hover:-translate-y-0.5
                      hover:bg-[#1d3155]
                    "
                  >
                    Reserve a Spot
                  </Link>

                </div>
              </div>
            </div>

            {/* ======================================================
                ROOM TYPES
            ====================================================== */}

            <div
              data-aos="fade-left"
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            >
              {roomOptions.map((room, index) => (
                <div
                  key={index}
                  className="
                    group
                    relative
                    flex
                    min-h-[220px]
                    flex-col
                    justify-between
                    overflow-hidden
                    rounded-[24px]
                    border
                    border-[#e8e1d6]
                    bg-[#f7f4ee]
                    p-6
                    transition-all
                    duration-500
                    hover:-translate-y-1
                    hover:bg-[#f1ede6]
                    hover:shadow-[0_15px_35px_rgba(44,36,28,0.08)]
                  "
                >
                  {/* Number */}

                  <div className="flex items-center justify-between">

                    <span className="text-xs font-bold tracking-[0.15em] text-[#a58b70]">
                      0{index + 1}
                    </span>

                    <span
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-full
                        bg-white
                        text-sm
                        text-[#9b6845]
                        shadow-sm
                      "
                    >
                      ↗
                    </span>
                  </div>

                  <div>

                    <h3 className="text-xl font-semibold text-[#14223f]">
                      {room.title}
                    </h3>

                    <p className="mt-2 text-sm text-[#77736c]">
                      {room.subtitle}
                    </p>

                    <div className="mt-5">

                      <p className="text-xs uppercase tracking-[0.12em] text-[#a19a91]">
                        Starting from
                      </p>

                      <p className="mt-1 text-lg font-semibold text-[#9b6845]">
                        {room.price}
                        <span className="text-xs font-normal text-[#77736c]">
                          {" "}
                          / month
                        </span>
                      </p>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          INCLUDED SERVICES
      ========================================================== */}

      <section className="bg-[#f7f4ee] py-20 sm:py-24">

        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

          <div className="grid gap-10 lg:grid-cols-2">

            {/* Services */}

            <div
              data-aos="fade-up"
              className="
                rounded-[28px]
                bg-white
                p-7
                shadow-[0_12px_40px_rgba(44,36,28,0.06)]
                sm:p-9
              "
            >
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9b6845]">
                Included
              </span>

              <h3 className="mt-3 text-2xl font-semibold text-[#14223f] sm:text-3xl">
                Services that make life easier.
              </h3>

              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">

                {/* WiFi */}

                <div className="flex items-center gap-3 rounded-2xl bg-[#f7f4ee] p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white">
                    <span className="text-lg">⌁</span>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#14223f]">
                      High-Speed WiFi
                    </p>

                    <p className="mt-0.5 text-xs text-[#88847d]">
                      Stay connected
                    </p>
                  </div>
                </div>

                {/* Housekeeping */}

                <div className="flex items-center gap-3 rounded-2xl bg-[#f7f4ee] p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white">
                    <span className="text-lg">✦</span>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#14223f]">
                      Housekeeping
                    </p>

                    <p className="mt-0.5 text-xs text-[#88847d]">
                      Clean & maintained
                    </p>
                  </div>
                </div>

                {/* Maintenance */}

                <div className="flex items-center gap-3 rounded-2xl bg-[#f7f4ee] p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white">
                    <span className="text-lg">⌘</span>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#14223f]">
                      Maintenance
                    </p>

                    <p className="mt-0.5 text-xs text-[#88847d]">
                      Quick assistance
                    </p>
                  </div>
                </div>

                {/* Cooking Gas */}

                <div className="flex items-center gap-3 rounded-2xl bg-[#f7f4ee] p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white">
                    <span className="text-lg">◌</span>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#14223f]">
                      Cooking Gas
                    </p>

                    <p className="mt-0.5 text-xs text-[#88847d]">
                      Everyday convenience
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Premium Amenities */}

            <div
              data-aos="fade-up"
              className="
                rounded-[28px]
                bg-[#14223f]
                p-7
                text-white
                shadow-[0_15px_50px_rgba(20,34,63,0.12)]
                sm:p-9
              "
            >

              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#d4a06e]">
                Premium amenities
              </span>

              <h3 className="mt-3 text-2xl font-semibold sm:text-3xl">
                Designed around your comfort.
              </h3>

              <div className="mt-8 space-y-6">

                {/* Item 1 */}

                <div className="flex gap-4">

                  <img
                    src={GreenTickPng}
                    alt=""
                    className="mt-1 h-5 w-5 shrink-0"
                  />

                  <div>
                    <p className="font-semibold">
                      Fully Furnished Rooms
                    </p>

                    <p className="mt-1 text-sm leading-6 text-white/60">
                      Full-size bed, quality mattress,
                      wardrobe and bedside table.
                    </p>
                  </div>

                </div>

                {/* Item 2 */}

                <div className="flex gap-4">

                  <img
                    src={GreenTickPng}
                    alt=""
                    className="mt-1 h-5 w-5 shrink-0"
                  />

                  <div>
                    <p className="font-semibold">
                      Modern Kitchen
                    </p>

                    <p className="mt-1 text-sm leading-6 text-white/60">
                      Gas stove, microwave, toaster,
                      mixer grinder and water purifier.
                    </p>
                  </div>

                </div>

                {/* Item 3 */}

                <div className="flex gap-4">

                  <img
                    src={GreenTickPng}
                    alt=""
                    className="mt-1 h-5 w-5 shrink-0"
                  />

                  <div>
                    <p className="font-semibold">
                      Laundry & Utilities
                    </p>

                    <p className="mt-1 text-sm leading-6 text-white/60">
                      Fully automatic washing machine,
                      geyser and refrigerator.
                    </p>
                  </div>

                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          ADDITIONAL INFORMATION
      ========================================================== */}

      <section className="bg-white py-20 sm:py-24">

        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

          <div
            data-aos="fade-up"
            className="
              overflow-hidden
              rounded-[30px]
              bg-[#f7f4ee]
              p-7
              sm:p-10
              lg:p-12
            "
          >

            {/* Heading */}

            <div className="mb-10">

              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9b6845]">
                Good to know
              </span>

              <h2 className="mt-3 text-3xl font-semibold text-[#14223f] sm:text-4xl">
                Simple, transparent living.
              </h2>

            </div>

            <div className="grid gap-12 md:grid-cols-2">

              {/* Monthly Expenses */}

              <div>

                <h3 className="text-xl font-semibold text-[#14223f]">
                  Monthly Expenses
                </h3>

                <div className="mt-6 flex items-start gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white">
                    <img
                      src={INRPng}
                      alt=""
                      className="h-7 w-7"
                    />
                  </div>

                  <div>
                    <p className="font-medium text-[#14223f]">
                      Rent + Electricity Bill
                    </p>

                    <p className="mt-1 text-sm leading-6 text-[#77736c]">
                      Electricity expenses are the resident's
                      responsibility and may vary by property.
                    </p>
                  </div>

                </div>

              </div>

              {/* Security */}

              <div>

                <h3 className="text-xl font-semibold text-[#14223f]">
                  Security Deposit
                </h3>

                <div className="mt-6 space-y-5">

                  {/* Deposit */}

                  <div className="flex gap-4">

                    <img
                      src={securedPng}
                      alt=""
                      className="mt-0.5 h-5 w-5 shrink-0"
                    />

                    <p className="text-sm leading-6 text-[#77736c]">
                      1.5–2 months rent, depending on the
                      property.
                    </p>

                  </div>

                  {/* Refund */}

                  <div className="flex gap-4">

                    <img
                      src={clockPng}
                      alt=""
                      className="mt-0.5 h-5 w-5 shrink-0"
                    />

                    <p className="text-sm leading-6 text-[#77736c]">
                      Fully refundable with 1 month notice.
                    </p>

                  </div>

                  {/* Documentation */}

                  <div className="flex gap-4">

                    <img
                      src={documentPng}
                      alt=""
                      className="mt-0.5 h-5 w-5 shrink-0"
                    />

                    <p className="text-sm leading-6 text-[#77736c]">
                      Documentation charges: ₹500 one-time.
                    </p>

                  </div>

                </div>
              </div>
            </div>

            {/* Bottom CTA */}

            <div
              className="
                mt-10
                flex
                flex-col
                gap-5
                border-t
                border-[#e2dbd0]
                pt-8
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >

              <div>
                <p className="font-semibold text-[#14223f]">
                  Ready to find your next home?
                </p>

                <p className="mt-1 text-sm text-[#77736c]">
                  Explore our available PG spaces.
                </p>
              </div>

              <Link
                to="/contact"
                className="
                  inline-flex
                  items-center
                  justify-center
                  rounded-full
                  bg-[#14223f]
                  px-7
                  py-3.5
                  text-sm
                  font-semibold
                  text-white
                  transition-all
                  hover:-translate-y-0.5
                  hover:bg-[#1d3155]
                "
              >
                Explore Your Stay →
              </Link>

            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Services;

