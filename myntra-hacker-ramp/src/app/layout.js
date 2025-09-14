// src/app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Myntra Clone",
  description: "A Myntra UI clone for a hackathon project.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="bg-gray-50 font-sans">
          <Header />
          <main>{children}</main> {/* Page content will be rendered here */}
          <Footer />
        </div>
      </body>
    </html>
  );
}