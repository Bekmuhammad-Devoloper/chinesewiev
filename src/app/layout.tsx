import type { Metadata } from "next";
import { Be_Vietnam_Pro, Castoro_Titling } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const castoroTitling = Castoro_Titling({
  variable: "--font-castoro-titling",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Chinese Wave - Xitoy tili kurslari",
  description: "Xitoy tilini tez va samarali o'rganing. HSK 3.0 asosida zamonaviy kurslar.",
  icons: {
    icon: "/assets/logo.png",
    shortcut: "/assets/logo.png",
    apple: "/assets/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uz"
      className={`${beVietnamPro.variable} ${castoroTitling.variable} antialiased`}
    >
      <body className="min-h-screen">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
