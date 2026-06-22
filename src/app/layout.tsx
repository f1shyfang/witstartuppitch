import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geologica, Lusitana } from "next/font/google";
import { SessionProvider } from "next-auth/react";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "WitStartupPitch",
  description:
    "Shape your startup story for demo day — clear narrative, founder-first workflow.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geologica = Geologica({
  subsets: ["latin"],
  variable: "--font-geologica",
  weight: ["400", "500", "600", "700"],
});

const lusitana = Lusitana({
  subsets: ["latin"],
  variable: "--font-lusitana",
  weight: ["400", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geologica.variable} ${lusitana.variable}`}
    >
      <body>
        <SessionProvider>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
