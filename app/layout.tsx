import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BackgroundPattern from "@/components/BackgroundPattern/BackgroundPattern";
import Script from "next/script";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "What To Play?",
    description: "An app to decide what game to play",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <Script
                id="next"
                async
                src="https://www.googletagmanager.com/gtag/js?id=G-3HTXSNCCDG"
            ></Script>
            <Script id="next">
                {` window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());

                    gtag('config', 'G-3HTXSNCCDG');`}
            </Script>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <BackgroundPattern />
                {children}
            </body>
        </html>
    );
}
