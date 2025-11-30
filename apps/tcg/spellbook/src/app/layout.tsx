import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Commander Spellbook',
  description: 'Commander Spellbook - TCG combo database integration',
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
