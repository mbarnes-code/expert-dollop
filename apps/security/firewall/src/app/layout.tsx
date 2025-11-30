import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'security-firewall',
  description: 'security domain application',
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
