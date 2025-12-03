export interface BasePageProps {
  serviceName: string;
  welcomeMessage?: string;
}

export function BasePage({
  serviceName,
  welcomeMessage = 'Welcome to the ai domain application.',
}: BasePageProps) {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>{serviceName}</h1>
      <p>{welcomeMessage}</p>
    </main>
  );
}
