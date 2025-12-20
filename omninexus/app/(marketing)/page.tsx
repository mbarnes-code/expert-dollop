export default function MarketingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-6">Welcome to Unified Frontend</h1>
      <p className="text-lg text-muted-foreground mb-8">
        A modern, domain-driven application bringing together multiple specialized domains
        into one cohesive experience.
      </p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-2">Magic: The Gathering</h3>
          <p className="text-muted-foreground">
            Explore powerful combos and search through the comprehensive Commander Spellbook database.
          </p>
        </div>
        
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-2">Security Tools</h3>
          <p className="text-muted-foreground">
            Advanced security analysis, YARA rule management, and comprehensive reporting.
          </p>
        </div>
        
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-2">Financial Management</h3>
          <p className="text-muted-foreground">
            Complete budget tracking and financial analysis powered by Actual Budget.
          </p>
        </div>
        
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-2">AI-Powered Tools</h3>
          <p className="text-muted-foreground">
            Chat interfaces, MCP inspection, and knowledge graph visualization.
          </p>
        </div>
        
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-2">Data Ingestion</h3>
          <p className="text-muted-foreground">
            Web crawling and data collection with Firecrawl integration.
          </p>
        </div>
      </div>
    </div>
  );
}
