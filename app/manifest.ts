import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RE Running",
    short_name: "RE Running",
    description: "Assessoria premium para corrida de rua.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0F1115",
    theme_color: "#0F1115",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
