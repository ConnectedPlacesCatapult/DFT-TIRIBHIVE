export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        About the Handbook
      </h1>
      <div className="prose prose-gray">
        <p>
          The Climate Change Adaptation Handbook (CCAH) is a resource developed
          as part of the Transport Research Innovation Board (TRIB) initiative.
          It provides transport professionals with access to climate change
          adaptation measures and case studies relevant to UK transport
          infrastructure.
        </p>
        <h2>Purpose</h2>
        <p>
          The handbook aims to help transport asset managers and policy makers
          make faster, better-informed decisions about climate adaptation by
          connecting them to proven approaches from across the sector.
        </p>
        <h2>How to Use</h2>
        <p>
          Use the filter controls on the main page to narrow results by climate
          risk (e.g. heat, floods) and transport asset type (e.g. rail tracks,
          bridges, roads). You can also use the search bar to find specific
          adaptation measures or case studies.
        </p>
        <h2>Data Sources</h2>
        <p>
          Case studies are sourced from published reports by organisations
          including Network Rail, Highways England, Transport for London, the
          Environment Agency, and others. Each entry links to its original
          source document.
        </p>
      </div>
    </div>
  );
}
