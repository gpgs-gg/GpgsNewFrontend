import React, { useEffect, useRef, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import HousePng from "../../logo/House.png";

import { MapPin, Navigation, ArrowUpRight, Clock3, Info } from "lucide-react";

import "./styles.css";

// ---------------------------------------------------------
// Google Map
// ---------------------------------------------------------

const brightStyle = [];

const GoogleMapWithMarkers = ({ sectors }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!sectors || sectors.length === 0) return;

    const loadGoogleMapsScript = () => {
      if (!window.google) {
        const script = document.createElement("script");

        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_MAP_API_KEY}`;

        script.async = true;
        script.defer = true;

        script.onload = () => {
          initMap();
        };

        document.head.appendChild(script);
      } else {
        initMap();
      }
    };

    function initMap() {
      if (!mapRef.current || !window.google) return;

      const center = {
        lat: sectors[0].lat,
        lng: sectors[0].lng,
      };

      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 13,
        center,
        styles: brightStyle,

        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      });

      const bounds = new window.google.maps.LatLngBounds();

      sectors.forEach(({ name, lat, lng }) => {
        const position = {
          lat,
          lng,
        };

        bounds.extend(position);

        const marker = new window.google.maps.Marker({
          map,
          position,
          title: name,

          label: {
            text: name,
            color: "#14223f",
            fontWeight: "600",
            fontSize: "12px",
          },
        });

        const infowindow = new window.google.maps.InfoWindow({
          content: `
              <div style="
                padding:8px 12px;
                font-family:Arial,sans-serif;
                color:#14223f;
              ">
                <strong>${name}</strong>
              </div>
            `,
        });

        marker.addListener("click", () => {
          infowindow.open(map, marker);
        });
      });

      if (sectors.length > 1) {
        map.fitBounds(bounds);
      }
    }

    loadGoogleMapsScript();
  }, [sectors]);

  return <div ref={mapRef} className="h-full min-h-[380px] w-full" />;
};

// ---------------------------------------------------------
// Location Component
// ---------------------------------------------------------

const Location = () => {
  const [hoveredLocation, setHoveredLocation] = useState({
    title: "Nerul East",

    sector: [
      {
        name: "Sector 17",
        lat: 19.0773,
        lng: 73.0153,
      },
      {
        name: "Sector 19",
        lat: 19.0822,
        lng: 73.0139,
      },
      {
        name: "Sector 21",
        lat: 19.0868,
        lng: 73.012,
      },
    ],

    sectors: [
      {
        name: "Sector 17",
        lat: 19.0773,
        lng: 73.0153,
      },
      {
        name: "Sector 19",
        lat: 19.0822,
        lng: 73.0139,
      },
      {
        name: "Sector 21",
        lat: 19.0868,
        lng: 73.012,
      },
    ],
  });

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-out-cubic",
    });

    AOS.refresh();
  }, []);

  const locations = [
    {
      title: "Nerul East",

      description:
        "Comfortable PG accommodation in one of Navi Mumbai's well-connected residential areas.",

      status: "Available",

      sector: [
        {
          name: "Sector 17",
          lat: 19.0773,
          lng: 73.0153,
        },
        {
          name: "Sector 19",
          lat: 19.0822,
          lng: 73.0139,
        },
        {
          name: "Sector 21",
          lat: 19.0868,
          lng: 73.012,
        },
      ],

      sectors: [
        {
          name: "Sector 17",
          lat: 19.0773,
          lng: 73.0153,
        },
        {
          name: "Sector 19",
          lat: 19.0822,
          lng: 73.0139,
        },
        {
          name: "Sector 21",
          lat: 19.0868,
          lng: 73.012,
        },
      ],
    },

    {
      title: "Nerul West",

      description:
        "Well-connected residential locations offering convenient access to everyday essentials.",

      status: "Available",

      sector: [
        {
          name: "Sector 2",
          lat: 19.0707,
          lng: 73.0087,
        },
        {
          name: "Sector 14",
          lat: 19.0731,
          lng: 73.0104,
        },
        {
          name: "Sector 20",
          lat: 19.0683,
          lng: 73.0075,
        },
      ],

      sectors: [
        {
          name: "Sector 2",
          lat: 19.0707,
          lng: 73.0087,
        },
        {
          name: "Sector 14",
          lat: 19.0731,
          lng: 73.0104,
        },
        {
          name: "Sector 20",
          lat: 19.0683,
          lng: 73.0075,
        },
      ],
    },

    {
      title: "CBD Belapur",

      description:
        "A prime Navi Mumbai location with easy access to business and commercial areas.",

      status: "Available",

      sectors: [
        {
          name: "Sector 14",
          lat: 19.0845,
          lng: 73.017,
        },
        {
          name: "Sector 19",
          lat: 19.0887,
          lng: 73.0185,
        },
        {
          name: "Sector 20",
          lat: 19.086,
          lng: 73.015,
        },
      ],

      sector: [
        {
          name: "Sector 14",
          lat: 19.0845,
          lng: 73.017,
        },
        {
          name: "Sector 19",
          lat: 19.0887,
          lng: 73.0185,
        },
        {
          name: "Sector 20",
          lat: 19.086,
          lng: 73.015,
        },
      ],
    },

    {
      title: "Kharghar",

      description:
        "A new location coming soon for residents looking for premium PG accommodation.",

      status: "Coming Soon",

      sectors: [
        {
          name: "Coming soon",
          lat: 19.0401,
          lng: 73.0715,
        },
      ],

      sector: [
        {
          name: "Coming soon",
          lat: 19.0401,
          lng: 73.0715,
        },
      ],
    },

    {
      title: "Kopar Khairane",

      description:
        "Conveniently located accommodation for a comfortable everyday lifestyle.",

      status: "Available",

      sector: [
        {
          name: "Sector 3",
          lat: 19.1035,
          lng: 72.9967,
        },
      ],

      sectors: [
        {
          name: "Sector 3",
          lat: 19.1035,
          lng: 72.9967,
        },
      ],
    },

    {
      title: "Ghansoli",

      description:
        "A well-connected residential destination with convenient access to nearby areas.",

      status: "Available",

      sector: [
        {
          name: "Sector 16",
          lat: 19.1055,
          lng: 72.9983,
        },
      ],

      sectors: [
        {
          name: "Sector 16",
          lat: 19.1055,
          lng: 72.9983,
        },
      ],
    },
  ];

  return (
    <section id="locations" className="bg-[#f7f4ee] py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* =====================================================
            SECTION HEADER
        ===================================================== */}

        <div
          data-aos="fade-up"
          className="mb-14 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#9b6845]">
              Find your place
            </span>

            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-[#14223f] sm:text-5xl lg:text-6xl">
              Prime locations.
              <br />
              Easy everyday living.
            </h2>
          </div>

          <div className="max-w-md">
            <p className="text-base leading-7 text-[#6d6b66] sm:text-lg">
              Explore our carefully selected PG locations across Navi Mumbai —
              chosen for connectivity, convenience and comfortable living.
            </p>

            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[#14223f]">
              <MapPin className="h-4 w-4" />
              Navi Mumbai, Maharashtra
            </div>
          </div>
        </div>

        {/* =====================================================
            MAIN GRID
        ===================================================== */}

        <div className="grid gap-7 lg:grid-cols-[1.15fr_0.85fr]">
          {/* ===================================================
              MAP
          =================================================== */}

          <div
            data-aos="fade-right"
            className="
              overflow-hidden
              rounded-[30px]
              bg-white
              shadow-[0_18px_50px_rgba(44,36,28,0.07)]
            "
          >
            {/* Map Header */}

            <div className="flex flex-col gap-4 bg-[#14223f] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                    <MapPin className="h-4 w-4 text-white" />
                  </span>

                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
                    Explore locations
                  </span>
                </div>

                <h3 className="mt-3 text-xl font-semibold text-white sm:text-2xl">
                  {hoveredLocation?.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs text-white/70">
                <span className="h-2 w-2 rounded-full bg-[#d4a06e]" />
                {hoveredLocation?.sectors?.length || 0} locations
              </div>
            </div>

            {/* Map */}

            <div className="relative h-[400px] overflow-hidden sm:h-[500px]">
              {hoveredLocation ? (
                <GoogleMapWithMarkers sectors={hoveredLocation.sector} />
              ) : (
                <div className="flex h-full items-center justify-center bg-[#f7f4ee]">
                  <p className="text-sm text-gray-500">
                    Select a location to view the map.
                  </p>
                </div>
              )}

              {/* Floating Location Label */}

              <div
                className="
                  absolute
                  bottom-5
                  left-5
                  rounded-2xl
                  bg-white/95
                  px-5
                  py-4
                  shadow-lg
                  backdrop-blur
                "
              >
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#9b6845]">
                  Selected area
                </p>

                <p className="mt-1 text-sm font-semibold text-[#14223f]">
                  {hoveredLocation?.title}
                </p>
              </div>
            </div>
          </div>

          {/* ===================================================
              LOCATION LIST
          =================================================== */}

          <div
            data-aos="fade-left"
            className="
              rounded-[30px]
              bg-[#14223f]
              p-5
              sm:p-7
            "
          >
            <div className="mb-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4a06e]">
                Our presence
              </span>

              <h3 className="mt-2 text-2xl font-semibold text-white">
                Choose your location
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/50">
                Hover over a location to explore the available sectors on the
                map.
              </p>
            </div>

            <div className="space-y-3">
              {locations.map((location, index) => {
                const isActive = hoveredLocation?.title === location.title;

                const isComingSoon = location.status === "Coming Soon";

                return (
                  <button
                    type="button"
                    key={index}
                    onMouseEnter={() => setHoveredLocation(location)}
                    onFocus={() => setHoveredLocation(location)}
                    className={`
                      group
                      relative
                      w-full
                      overflow-hidden
                      rounded-2xl
                      p-4
                      text-left
                      transition-all
                      duration-300

                      ${
                        isActive
                          ? "bg-white"
                          : "bg-white/[0.07] hover:bg-white/[0.12]"
                      }
                    `}
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon */}

                      <div
                        className={`
                          flex
                          h-11
                          w-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          transition-all
                          ${isActive ? "bg-[#f7f4ee]" : "bg-white/10"}
                        `}
                      >
                        <img
                          src={HousePng}
                          alt=""
                          className="h-6 w-6 object-contain"
                        />
                      </div>

                      {/* Content */}

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4
                            className={`
                              text-sm
                              font-semibold
                              ${isActive ? "text-[#14223f]" : "text-white"}
                            `}
                          >
                            {location.title}
                          </h4>

                          <span
                            className={`
                              rounded-full
                              px-2
                              py-0.5
                              text-[8px]
                              font-bold
                              uppercase
                              tracking-wider
                              ${
                                isComingSoon
                                  ? isActive
                                    ? "bg-[#f7f4ee] text-[#9b6845]"
                                    : "bg-[#d4a06e]/20 text-[#d4a06e]"
                                  : isActive
                                    ? "bg-[#e8f3ed] text-[#4d8065]"
                                    : "bg-white/10 text-white/50"
                              }
                            `}
                          >
                            {location.status}
                          </span>
                        </div>

                        <p
                          className={`
                            mt-1
                            line-clamp-1
                            text-xs
                            ${isActive ? "text-[#77736c]" : "text-white/40"}
                          `}
                        >
                          {location.description}
                        </p>
                      </div>

                      {/* Arrow */}

                      <div
                        className={`
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          transition-all
                          ${
                            isActive
                              ? "bg-[#14223f] text-white"
                              : "bg-white/10 text-white/50"
                          }
                        `}
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom info */}

            <div className="mt-6 border-t border-white/10 pt-5">
              <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[#d4a06e]" />

                <p className="text-xs leading-5 text-white/45">
                  Planning to visit? Please inform us at least 30 minutes in
                  advance so we can arrange a smooth visit experience.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            LOCATION HIGHLIGHTS
        ===================================================== */}

        <div data-aos="fade-up" className="mt-7 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[24px] bg-white p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f4ee]">
              <Navigation className="h-5 w-5 text-[#14223f]" />
            </div>

            <h4 className="mt-5 text-lg font-semibold text-[#14223f]">
              Well Connected
            </h4>

            <p className="mt-2 text-sm leading-6 text-[#77736c]">
              Locations selected for convenient access to transport, markets and
              everyday essentials.
            </p>
          </div>

          <div className="rounded-[24px] bg-white p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f4ee]">
              <MapPin className="h-5 w-5 text-[#14223f]" />
            </div>

            <h4 className="mt-5 text-lg font-semibold text-[#14223f]">
              Prime Areas
            </h4>

            <p className="mt-2 text-sm leading-6 text-[#77736c]">
              Carefully chosen residential neighbourhoods across Navi Mumbai.
            </p>
          </div>

          <div className="rounded-[24px] bg-white p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f4ee]">
              <Clock3 className="h-5 w-5 text-[#14223f]" />
            </div>

            <h4 className="mt-5 text-lg font-semibold text-[#14223f]">
              Easy Visit
            </h4>

            <p className="mt-2 text-sm leading-6 text-[#77736c]">
              Schedule your visit in advance and let our team help you find the
              right space.
            </p>
          </div>
        </div>

        {/* =====================================================
            FINAL NOTE
        ===================================================== */}

        <div
          data-aos="fade-up"
          className="
            mt-7
            flex
            flex-col
            gap-5
            rounded-[26px]
            bg-[#ede8df]
            p-6
            sm:flex-row
            sm:items-center
            sm:justify-between
            sm:p-7
          "
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
              <Info className="h-4 w-4 text-[#14223f]" />
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[#14223f]">
                Before you visit
              </h4>

              <p className="mt-1 max-w-2xl text-xs leading-5 text-[#77736c] sm:text-sm">
                Please inform us a minimum of 30 minutes in advance for a smooth
                visit experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Location;
