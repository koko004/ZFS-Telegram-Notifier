import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Sidebar } from '@/components/layout/sidebar';

export const metadata: Metadata = {
  title: 'ZFS Notifier',
  description: 'Monitor your ZFS pools with ease.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <div className="flex min-h-screen w-full">
            <Sidebar />
            <main className="flex flex-1 flex-col bg-muted/20">
              {children}
            </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
