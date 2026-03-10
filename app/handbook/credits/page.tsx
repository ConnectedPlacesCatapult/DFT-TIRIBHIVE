export default function CreditsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Credits</h1>
      <div className="prose prose-gray">
        <p>
          The Climate Change Adaptation Handbook was developed by Connected
          Places Catapult on behalf of the Department for Transport.
        </p>
        <h2>Project Team</h2>
        <ul>
          <li>
            <strong>Department for Transport (SciTech)</strong> — Project sponsor
            and oversight
          </li>
          <li>
            <strong>Connected Places Catapult</strong> — Research, development,
            and delivery
          </li>
        </ul>
        <h2>Data Contributors</h2>
        <p>
          Case study data has been compiled from publicly available reports and
          research publications from transport organisations across the UK and
          internationally.
        </p>
        <h2>Technology</h2>
        <p>
          Built with Next.js, React, and TypeScript. Data served from structured
          JSON with plans for Supabase and Azure PostgreSQL backends.
        </p>
      </div>
    </div>
  );
}
