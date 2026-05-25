import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeInitScript } from "@/components/shared/theme-init-script";
import { AppProviders } from "@/providers/app-providers";
import { APP_CONFIG } from "@/constants/config";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: APP_CONFIG.appName,
    template: `%s | ${APP_CONFIG.appName}`,
  },
  description: "Modern repair shop point-of-sale dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeInitScript />
      </head>
      <body className={`${inter.variable} min-h-screen antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
