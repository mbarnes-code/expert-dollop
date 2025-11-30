import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'productivity-calendar',
  description: 'productivity domain application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
