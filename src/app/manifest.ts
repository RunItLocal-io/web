import type { MetadataRoute } from "next";

// Makes the site installable. Installing opens straight into the Studio, which works offline.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RunItLocal.io Studio",
    short_name: "RunItLocal",
    description: "Make images and chat with AI models running on your own GPU. Works offline.",
    start_url: "/studio",
    // The app window is just the Studio; links back to the website open in the browser.
    scope: "/studio",
    display: "standalone",
    background_color: "#050608",
    theme_color: "#050608",
    icons: [
      { src: "/app-icon/192", sizes: "192x192", type: "image/png" },
      { src: "/app-icon/512", sizes: "512x512", type: "image/png" },
      { src: "/app-icon/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
