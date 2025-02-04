import "@/styles/globals.css";

import React from "react";
import { Toaster } from "react-hot-toast";

// TODO: add metadata
export const metadata = {
  title: `Next.js`,
  description: `Generated by Next.js`,
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Toaster />
        <div className="absolute inset-0 z-[-1] overflow-hidden bg-background ">
          <div
            className="absolute inset-0 scale-110 blur-md"
            style={{
              backgroundImage: `url('/background.png')`,
              backgroundSize: `cover`,
              backgroundPosition: `center`,
            }}
          />
          <div className="absolute inset-0 bg-background/[95%]" />
        </div>
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
