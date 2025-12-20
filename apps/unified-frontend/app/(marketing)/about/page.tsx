export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">About This Application</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Architecture</h2>
        <p className="text-muted-foreground mb-4">
          This application is built using Domain-Driven Design (DDD) principles with Next.js 15
          and React 19, featuring Server Components and Server Actions for optimal performance.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Technology Stack</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Next.js 15 with App Router</li>
          <li>React 19 with Server Components</li>
          <li>TypeScript with strict mode</li>
          <li>Tailwind CSS + shadcn/ui components</li>
          <li>Zustand for state management</li>
          <li>TanStack Query for data fetching</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Domains</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold">MTG</h3>
            <p className="text-muted-foreground">
              Magic: The Gathering combo database integration
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">Security</h3>
            <p className="text-muted-foreground">
              Security analysis and reporting tools
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">Finance</h3>
            <p className="text-muted-foreground">
              Budget and financial management
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">AI</h3>
            <p className="text-muted-foreground">
              AI-powered chat and knowledge management
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">Ingestion</h3>
            <p className="text-muted-foreground">
              Web crawling and data collection
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
