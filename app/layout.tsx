import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Lexend } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const lexend = Lexend({ variable: "--font-lexend", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EaseRead — Read anything, your way",
  description:
    "EaseRead is an AI reading assistant that rewrites hard text into plain, easy-to-read language for people with dyslexia, ADHD, and low literacy.",
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${lexend.variable} bg-background`}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
