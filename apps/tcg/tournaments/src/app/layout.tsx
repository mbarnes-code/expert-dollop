import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'tcg-tournaments',
  description: 'tcg domain application',
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
