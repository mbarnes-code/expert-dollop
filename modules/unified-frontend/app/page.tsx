import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Unified Frontend
        </h1>
        <p className="text-center text-muted-foreground mb-12">
          A Domain-Driven Design application integrating multiple domains
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* MTG Domain */}
          <Link
            href="/mtg"
            className="group rounded-lg border border-border px-5 py-4 transition-colors hover:border-primary hover:bg-accent"
          >
            <h2 className="mb-3 text-2xl font-semibold">
              MTG{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                -&gt;
              </span>
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              Magic: The Gathering combos and card search
            </p>
          </Link>

          {/* Security Domain */}
          <Link
            href="/security"
            className="group rounded-lg border border-border px-5 py-4 transition-colors hover:border-primary hover:bg-accent"
          >
            <h2 className="mb-3 text-2xl font-semibold">
              Security{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                -&gt;
              </span>
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              Security analysis, YARA rules, and reporting
            </p>
          </Link>

          {/* Finance Domain */}
          <Link
            href="/finance"
            className="group rounded-lg border border-border px-5 py-4 transition-colors hover:border-primary hover:bg-accent"
          >
            <h2 className="mb-3 text-2xl font-semibold">
              Finance{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                -&gt;
              </span>
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              Budget management and financial tracking
            </p>
          </Link>

          {/* AI Domain */}
          <Link
            href="/ai"
            className="group rounded-lg border border-border px-5 py-4 transition-colors hover:border-primary hover:bg-accent"
          >
            <h2 className="mb-3 text-2xl font-semibold">
              AI{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                -&gt;
              </span>
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              AI chat, MCP Inspector, and knowledge graphs
            </p>
          </Link>

          {/* Ingestion Domain */}
          <Link
            href="/ingestion"
            className="group rounded-lg border border-border px-5 py-4 transition-colors hover:border-primary hover:bg-accent"
          >
            <h2 className="mb-3 text-2xl font-semibold">
              Ingestion{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                -&gt;
              </span>
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              Web crawling and data ingestion
            </p>
          </Link>

          {/* About */}
          <Link
            href="/about"
            className="group rounded-lg border border-border px-5 py-4 transition-colors hover:border-primary hover:bg-accent"
          >
            <h2 className="mb-3 text-2xl font-semibold">
              About{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                -&gt;
              </span>
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              Learn about the architecture and design
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
