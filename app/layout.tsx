import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://rs-running.vercel.app"),
  title: "RS Running App Beta",
  description:
    "Acompanhe seus treinos, evolução e cronograma diretamente pelo app da RS Running.",
  applicationName: "RS Running",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "RS Running App Beta",
    description:
      "Seu treino agora vai com você. Instale e acompanhe sua evolução no celular.",
    url: "https://app-rsrunning.vercel.app/student",
    siteName: "RS Running",
    images: [
      {
        url: "/rs-running-hero-mockup.png",
        width: 1536,
        height: 1024,
        alt: "Mockup do app RS Running"
      }
    ],
    locale: "pt_BR",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "RS Running App Beta",
    description:
      "Acompanhe treinos, evolução e cronograma diretamente pelo app da RS Running.",
    images: ["/rs-running-hero-mockup.png"]
  }
};

export const viewport: Viewport = {
  themeColor: "#050609",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
