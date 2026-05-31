import React from "react";
import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Mini Atoms Builder",
  description: "Agent-driven app generation demo for the ROOT full-stack challenge."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
