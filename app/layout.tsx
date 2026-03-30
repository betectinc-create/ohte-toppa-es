import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import Script from 'next/script';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "大手突破ES | AIで大手企業のESを自動生成",
  description: "AIが大手企業50社のデータを元に、企業が求める人物像に最適化したES・志望動機・ガクチカを自動生成。三菱商事、トヨタ、ソニーなど大手企業の通過率を上げる就活AIツール。",
  keywords: ["ES作成", "就活", "AI", "エントリーシート", "志望動機", "ガクチカ", "大手企業", "就活ツール", "ES自動生成"],
  verification: {
    google: "lJa3pMfkahu6su93mqUMfdN848y63EV7iL5FXdM4FCo",
  },
  openGraph: {
    title: "大手突破ES | AIで大手企業のESを自動生成",
    description: "50社以上の企業データでESを最適化。企業が求める人物像に合わせたES・志望動機・ガクチカをAIが自動生成。",
    url: "https://www.ohte-toppa-es.com",
    siteName: "大手突破ES",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "https://www.ohte-toppa-es.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "大手突破ES - AIで大手企業のESを自動生成",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "大手突破ES | AIで大手企業のESを自動生成",
    description: "50社以上の企業データでESを最適化。AIが自動生成する就活ツール。",
    images: ["https://www.ohte-toppa-es.com/og-image.png"],
  },
  metadataBase: new URL("https://www.ohte-toppa-es.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="ja">
        <head>
          {/* Google Analytics */}
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-YEJKE2N90F"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-YEJKE2N90F');
            `}
          </Script>
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}