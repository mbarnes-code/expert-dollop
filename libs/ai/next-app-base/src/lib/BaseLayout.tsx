import type { Metadata } from 'next';

export interface BaseLayoutProps {
  children: React.ReactNode;
}

export function BaseLayout({ children }: BaseLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

export interface CreateMetadataOptions {
  title: string;
  description?: string;
}

export function createMetadata({
  title,
  description = 'ai domain application',
}: CreateMetadataOptions): Metadata {
  return {
    title,
    description,
  };
}
