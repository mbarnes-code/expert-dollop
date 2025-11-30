/**
 * Commander Spellbook - Strangler Fig Integration
 * 
 * This app follows the strangler fig pattern to gradually ingest
 * the commander-spellbook-site from the features directory.
 * 
 * DDD patterns implemented:
 * - Base abstract classes for services and features
 * - Domain-specific types and interfaces
 * - Modular monolith structure with clear boundaries
 */
export default function Home() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Commander Spellbook</h1>
      <p>TCG combo database - Strangler Fig Integration</p>
      <section style={{ marginTop: '2rem' }}>
        <h2>Features</h2>
        <ul>
          <li>Combo search and discovery</li>
          <li>Card database integration</li>
          <li>Deck building tools</li>
          <li>Community submissions</li>
        </ul>
      </section>
      <section style={{ marginTop: '2rem' }}>
        <h2>Architecture</h2>
        <p>
          This application uses the strangler fig pattern to gradually migrate
          functionality from the legacy commander-spellbook-site while maintaining
          backwards compatibility.
        </p>
      </section>
    </main>
  );
}
