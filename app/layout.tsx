import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Linkt — Your Personal Bookmark Shelf",
    template: "%s · Linkt",
  },
  description: "A tiny, personal place for your links. Think linktree meets pocket.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
