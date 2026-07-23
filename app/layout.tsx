import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QueryProvider from "@/components/QueryProvider";
import { TrailerProvider } from "@/context/TrailerContext";

export const metadata: Metadata = {
  title: "CineCurator | AI-Powered Movie Recommendations",
  description:
    "Discover your next cinematic masterpiece with AI-powered recommendations based on the movies you love.",
  keywords: "movies, recommendations, AI, cinema, films",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
        />
      </head>
      <body className="bg-background text-on-surface font-body selection:bg-primary-container selection:text-white overflow-x-hidden">
        <QueryProvider>
          <TrailerProvider>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </TrailerProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
