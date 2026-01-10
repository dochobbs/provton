import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { ProfileProvider } from "@/context/ProfileContext";

const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "ProviderTone | Capture Your Communication Style",
  description: "A tool to capture your unique communication style for AI-generated content.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} ${roboto.className} antialiased`}>
        <ProfileProvider>
          {children}
        </ProfileProvider>
      </body>
    </html>
  );
}
