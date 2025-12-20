import Link from "next/link";

export default function DomainsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold">
              Unified Frontend
            </Link>
            <nav className="flex gap-6">
              <Link href="/mtg" className="hover:text-primary transition-colors">
                MTG
              </Link>
              <Link href="/security" className="hover:text-primary transition-colors">
                Security
              </Link>
              <Link href="/finance" className="hover:text-primary transition-colors">
                Finance
              </Link>
              <Link href="/ai" className="hover:text-primary transition-colors">
                AI
              </Link>
              <Link href="/ingestion" className="hover:text-primary transition-colors">
                Ingestion
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
