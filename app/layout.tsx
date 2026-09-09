import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Building the Mind with Joss | Online Education Platform",
    template: "%s | Building the Mind with Joss",
  },
  description:
    "Master Full Stack Web Application Development and English (A1 to C2) with Joss. Supporting English, Tigrinya, and Amharic.",
  keywords: [
    "Full Stack Development",
    "English A1-C2",
    "Tigrinya courses",
    "Amharic courses",
    "Building the Mind with Joss",
    "Web Development Courses",
    "Online Education",
  ],
  openGraph: {
    title: "Building the Mind with Joss",
    description:
      "Master Full Stack Web Development and English A1–C2 with multilingual support.",
    type: "website",
    locale: "en_US",
    siteName: "Building the Mind with Joss",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
        <Navbar />
        <div className="flex-1 flex flex-col pt-16">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
