import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ZoomMaster Pro',
  description: 'Enterprise screen recording tool with smart zoom capabilities',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
