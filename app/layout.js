import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AddTreeModal from "@/components/AddTreeModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { AddTreeModalProvider } from "@/lib/ui/AddTreeModalContext";
import { ConfirmDialogProvider } from "@/lib/ui/ConfirmDialogContext";
import { ReferenceDataProvider } from "@/lib/reference/ReferenceDataProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "VAGDO — Tree Registry",
  description: "Save trees with image, location, and name",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport = {
  themeColor: "#16a34a",
};

const SW_REGISTER_SCRIPT = `
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("/sw.js").catch(function () {});
  });
}
`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]"
      >
        <AuthProvider>
          <ReferenceDataProvider>
            <ConfirmDialogProvider>
              <AddTreeModalProvider>
                <Navbar />
                <div className="flex-1 flex flex-col">{children}</div>
                <AddTreeModal />
              </AddTreeModalProvider>
              <ConfirmDialog />
            </ConfirmDialogProvider>
          </ReferenceDataProvider>
        </AuthProvider>
        <Script
          id="sw-register"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: SW_REGISTER_SCRIPT }}
        />
      </body>
    </html>
  );
}
