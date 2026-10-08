// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import tailwindcss from "@tailwindcss/vite";
// import { VitePWA } from "vite-plugin-pwa";
// export default defineConfig({
//   plugins: [
//     react(),
//     VitePWA({
//       registerType: "autoUpdate",
//       manifest: {
//         name: "GPGS",
//         short_name: "GPGS",
//         description: "Gopal's Paying guest Services",
//         theme_color: "#ffffff",
//         background_color: "#ffffff",
//         display: "standalone",
//         start_url: "/",
//         scope: "/",
//         icons: [
//           {
//             src: "/pwa-192x192.png",
//             sizes: "192x192",
//             type: "image/png",
//           },
//           {
//             src: "/pwa-512x512.png",
//             sizes: "512x512",
//             type: "image/png",
//           },
//         ],
//       },

//       workbox: {
//         cleanupOutdatedCaches: true,
//       },
//     }),
//     tailwindcss(),
//   ],
//   server: {
//     watch: {
//       usePolling: true,
//       interval: 100,
//     },
//   },
// });



import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      manifest: {
        name: "GPGS",
        short_name: "GPGS",
        description: "Gopal's Paying guest Services",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        scope: "/",

        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },

      workbox: {
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
    }),

    tailwindcss(),
  ],

  server: {
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
});

