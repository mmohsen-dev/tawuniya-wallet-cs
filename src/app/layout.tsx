import type { Metadata } from "next";
import ClientProvider from "@/components/ClientProvider";

export const metadata: Metadata = {
  title: "Tawuniya Digital Wallet",
  description: "Manage your Tawuniya points and rewards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="emotion-insertion-point" content="" />
      </head>
      <body>
        <ClientProvider>
          {children}
        </ClientProvider>
      </body>
    </html>
  );
}
