"use client";

import React, { useRef, useState, useEffect } from "react";

const Scenario_Html = [
  <>
    <p>
      Required changes in governance and collaboration have not been implemented. Failure to tackle
      cultures around data ownership and a lack of interoperability has prevented connection between
      digital twins and common standards across regions. Local planning benefits from the development
      of digital twins, however levelling up through transport provision becomes disjointed as
      national policy is informed by numerous conflicting data sets. There is a failure to
      significantly increase efficient long-distance connectivity across the UK.
    </p>
    <p><b>RESILIENCE</b></p>
    <p>
      High quality cyber-physical infrastructure exists among local digital twins. Regions build
      resilience to discrete challenges, but system-wide resilience suffers due to a lack of data
      sharing and legal frameworks, creating varied performance across the UK.
    </p>
    <p><b>SAFETY</b></p>
    <p>
      Local emergency services are able to access transport digital twins in order to respond to
      local incidents. National crisis management systems are unable to capitalise on data
      innovations, and significant national events and incidents are relatively poorly managed.
    </p>
    <p><b>EFFICIENCY</b></p>
    <p>
      Innovations are frustrated by multiple data standards across the different digital twins and
      are unable to scale across the network. Demand-responsive transport expands, but timetabled
      and longer distance services see only minimal efficiency increases.
    </p>
    <p><b>PASSENGER AGENCY</b></p>
    <p>
      Local transport is relatively seamless, but long distance journeys are complex and fragmented.
      Many sources of truth appear and public transport apps contradict one another. Interchange
      between modes of transport is disjointed as delays are not communicated.
    </p>
  </>,
  <>
    <p>
      Digital twins have been connected, and the services they support are engaged. Collaboration
      exists between supply and demand sides. Skills frameworks and educational pathways enable
      insights to be leveraged to effect the delivery of strategy. Data streams actively inform
      policy decisions at national and local levels of government. Previously isolated communities
      are connected, levelling up local economies and reducing car dependency across the country.
      New technologies such as autonomous buses roll out, due to accessible data, reduced
      procurement times and efficient supply chains.
    </p>
    <p><b>RESILIENCE</b></p>
    <p>
      Route, energy, weather, and other monitoring systems provide early warning of vulnerabilities,
      enabling predictive maintenance. Risk management and mitigation engines have reduced recovery
      times from incidents. Vulnerabilities around cyber-security are mitigated by secure-by-design
      methodologies implemented at a foundational level.
    </p>
    <p><b>SAFETY</b></p>
    <p>
      Passenger flows are actively monitored, and transport provision adapts to demand. Adverse
      incidents are identified instantly and tracked by emergency services. Predictive understanding
      of system weak points informs intelligent operating procedures.
    </p>
    <p><b>EFFICIENCY</b></p>
    <p>
      Efficient signalling enables the increased safe utilisation of assets. Public transport costs
      drop as data unlocks resilient, but streamlined operating procedures where overheads are
      minimised.
    </p>
    <p><b>PASSENGER AGENCY</b></p>
    <p>
      New interfaces now exist between systems and people. Agile incident management prevents
      noticeable disruption to journeys. Seamless diversions keep the transport system moving in the
      event of larger incidents. Situational, live data, including carbon emissions, accessibility,
      and active travel alternatives, enables the public to make informed decisions.
    </p>
    <h2 className="h4 Intermediate_Scenarios_Title">Intermediate scenarios</h2>
    <div className="Scenario Scenario_1">
      <div className="Scenario_Year">
        <div className="Inner_Circle">2025</div>
      </div>
      <p className="Scenario_Description">
        Relevant parties are engaged in organisational and strategic alignment for a federated
        network of digital twins. Measures of success are defined, and governance models are
        designed. Communication and engagement plans are put in place. A skills and competency
        framework exists to constantly capture, analyse and begin to address relevant skills gaps.
        An up-to-date systems map of the transport networks highlighting flow of information and
        interdependencies has been produced. Individual digital twins for different services and
        systems are at different stages of maturity. Suitable digital twins that can be incorporated
        into the greater connected network are being identified.
      </p>
      <div className="Line_After"></div>
    </div>
    <div className="Scenario Scenario_2">
      <p className="Scenario_Description">
        Frameworks for procuring data and insurance frameworks have been developed and are in place.
        Progress is communicated through marketing campaigns, attracting new investment. Training
        and skills pathways attract talent to fill previous skill gaps. Physical and digital
        infrastructure components are mapped, planned, delivered, and operational. New products and
        services are identified to support the ongoing development and use of digital twins.
        Suitable digital twins are adopting common data standards and cyber physical
        infrastructures.
      </p>
      <div className="Scenario_Year Scenario_2">
        <div className="Inner_Circle">2030</div>
      </div>
      <div className="Line_Before"></div>
    </div>
  </>,
  <>
    <p>
      Required changes in policy, regulation, governance, and collaboration have not been
      implemented. Data frameworks are missing, and a failure to tackle entrenched cultures of data
      ownership has prevented a holistic approach and common standards across regions. The lack of a
      cohesive understanding of the public transport system prevents informed policy decisions.
      Efforts to level up through the provision of public transportation are frustrated by the
      absence of a single data set. Long distance connectivity across the UK stalls.
    </p>
    <p><b>RESILIENCE</b></p>
    <p>
      The low quality and quantity of cyber-physical infrastructure prevents the use of insight. A
      lack of a shared understanding or an authoritative source of truth makes predictive
      maintenance and cooperative planning impossible. Maintenance overheads rapidly accelerate.
    </p>
    <p><b>SAFETY</b></p>
    <p>
      Congestion and crowding affect interchanges. Large events are disrupted by a lack of awareness
      of passenger flows. Emergency services are siloed from localised systems and struggle to
      manage incidents.
    </p>
    <p><b>EFFICIENCY</b></p>
    <p>
      Data-driven operating models are impossible, and efficiency falls. Public transport remains
      reactive to shock. Some services run almost empty while others are overburdened. Ticket prices
      rise as running costs continue to increase.
    </p>
    <p><b>PASSENGER AGENCY</b></p>
    <p>
      While local travel might not be a burden, long distance and multi-modal journeys are
      disjointed. Private car use increases as the public is forced to find an alternative to the
      expensive, non-inclusive, and unreliable public transport system.
    </p>
  </>,
  <>
    <p>
      Data architectures are well developed, but a failure to invest in analysis skills sees many
      of the benefits associated with connected digital twins fall far short of expectations. Data
      streams inform national and local planning and policy, but objectives such as levelling up
      fall behind as the poor management of digital twin assets forces a focus on infrastructure
      provision to make up for shortfalls in service efficiency.
    </p>
    <p><b>RESILIENCE</b></p>
    <p>
      Due to a poor understanding of use cases and best practices, there has been only a minimal
      uptick in resilience. Shocks to the system from extreme weather are not mitigated, and
      pre-emptive maintenance cannot be performed.
    </p>
    <p><b>SAFETY</b></p>
    <p>
      Safety at stations is well managed, with large crowds detected and mitigated against with
      diversions. Poor resilience to demand however sees the system routinely pushed to its limits,
      and service cancellations for safety reasons are not uncommon.
    </p>
    <p><b>EFFICIENCY</b></p>
    <p>
      Cyber-physical infrastructures are well connected, but a failure to adopt planning,
      monitoring, and maintenance frameworks results in limited benefits. Large numbers of assets
      are kept in reserve in a safety net strategy.
    </p>
    <p><b>PASSENGER AGENCY</b></p>
    <p>
      As live, accurate information is made accessible to passengers, transparency in transport
      service provision and belief in communications are high. Delays are common, but alternative
      means are communicated. Accessibility is an issue due to failures to capitalise on data and
      improve service provision for all.
    </p>
  </>,
];

/** Rows = impact (high → low); columns = intelligence (siloed → connected). Matches live trib.org.uk layout. */
const SCENARIO_MATRIX: { scenarioId: number }[][] = [
  [{ scenarioId: 0 }, { scenarioId: 1 }],
  [{ scenarioId: 2 }, { scenarioId: 3 }],
];

const SCENARIO_DEFS: Record<number, { letter: string; name: string; subtitle: string }> = {
  0: { letter: "A", name: "Localised action", subtitle: "High environmental and social impact, siloed intelligence" },
  1: { letter: "B", name: "United smart systems", subtitle: "High environmental and social impact, connected intelligence" },
  2: { letter: "C", name: "Muddling through", subtitle: "Low environmental and social impact, siloed intelligence" },
  3: { letter: "D", name: "Full throttle", subtitle: "Low environmental and social impact, connected intelligence" },
};

const COL_AXIS_LABELS = ["Siloed intelligence", "Connected intelligence"] as const;

const ROW_AXIS_LABELS = [
  "High environmental and social impact",
  "Low environmental and social impact",
] as const;

export default function FutureScenariosPage() {
  const [Scenario_ID, Set_Scenario_ID] = useState(-1);
  const focusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    focusRef.current?.focus();
  }, []);

  useEffect(() => {
    if (Scenario_ID === -1) return;
    const content = document.getElementsByClassName("Scenario_Selector_Content");
    if (content[0]) content[0].scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [Scenario_ID]);

  return (
    <div ref={focusRef} tabIndex={-1} className="Future_Scenarios Bordered_Content">
      <h1>Future scenarios</h1>
      <div className="Scenario General_Scenario">
        <div className="General_Scenario_Content">
          <div className="General_Scenario_Top_Group">
            <div className="General_Scenario_Intro">
              <h2 className="h4 General_Scenario_Intro_Title">Introduction</h2>
              <div>
                <p>
                  Connected Places Catapult convened experts who specialise in data, digital
                  infrastructure, and public transport to draw upon research and insights into
                  connected digital twins and evaluate how they might support the decarbonisation
                  and improved connectivity of the UK transport system.
                </p>
                <p>
                  Connected digital twins are well placed to deliver significant economic impact
                  and drive the UK as a science and technology superpower.
                </p>
                <p>
                  These scenarios provide the market with a common understanding of the value
                  federated networks of transport digital twins will provide to the public transport
                  system, if we take action to build it.
                </p>
                <p>These four futures are built across two conditions:</p>
                <p><b>Connected intelligence</b></p>
                <p>
                  The measure of how connected digital twins are able to bridge silos, build
                  intelligent understanding, and drive efficiency.
                </p>
                <p><b>Environmental and social impact</b></p>
                <p>
                  The measure of how connected digital twins are able to mitigate the effects of
                  climate change and build resilience, connectivity, and inclusivity.
                </p>
                <p>
                  Each scenario begins with an introduction to the nature of the existing digital
                  twin landscape before exploring how action or inaction leads to impacts across
                  resilience, safety, efficiency, and passenger agency.
                </p>
              </div>
            </div>
            <div className="Key_Insights">
              <h2 className="h4 Key_Insights_Title">Key insights</h2>
              {[
                {
                  title: "Incentivise change to overcome entrenched working cultures.",
                  body: "The establishment of connected digital twins to improve the public transport system is less of an issue of technology, and more an issue of communication and management. Incentivising change by demonstrating the value of connected digital twins is required to enable a new paradigm to be adopted and embraced.",
                },
                {
                  title: "Keeping to full throttle is not driving efficiently.",
                  body: "Any efficient system is dependent, and indeed defined, by its ability to withstand strain. Truly efficient networks are resilient and able to overcome incidents and hazards. Finding the balance between utilising assets and maintaining reserves is key to enabling a truly efficient network.",
                },
                {
                  title: "Resilience involves robustness, agile recovery and evolution.",
                  body: "A resilient system involves three factors. Robustness or resistance to hazards, recovery or system bounce back, and evolution or progressive strengthening. Live awareness, rapid diagnosis, and predictive maintenance can all be enabled through connected digital twins to bake resilience into efficiency.",
                },
                {
                  title: "Translate data into action.",
                  body: "Intelligent understanding doesn't necessarily effect change. By leveraging data skills, it is important to translate data into insight, and insight into action. Utilising understanding is key to improving safety, resilience, efficiency, sustainability, and connectivity.",
                },
                {
                  title: "Transparency enables agency.",
                  body: "The efficiency and environmental impact public transport is significantly affected by the ways people travel. Sharing selected datasets through APIs and enabling MaaS technologies to provide passengers with the agency to make informed decisions on transport options is critical to reducing the carbon output of the network.",
                },
                {
                  title: "Integrate to unlock innovation.",
                  body: "The true power of connected digital twins is not just the intelligent understanding they build but also the opportunities for innovation they provide. Maximising the added value is dependent on enabling new technologies, new processes, and new organisations to enable the improved connectivity and decarbonisation of the public transport system.",
                },
              ].map((insight, i) => (
                <div key={i} className="Insight">
                  <h3>{insight.title}</h3>
                  <p>{insight.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="Scenario_Selector_Container">
            <p className="Scenario_Matrix_Intro p1" id="scenario-matrix-label">
              Click on each scenario to view details.
            </p>
            <div
              className="ScenarioMatrix"
              role="grid"
              aria-labelledby="scenario-matrix-label"
            >
              <div className="ScenarioMatrix_corner" aria-hidden />
              {COL_AXIS_LABELS.map((label) => (
                <div key={label} className="ScenarioMatrix_colLabel" role="columnheader">
                  {label}
                </div>
              ))}
              {SCENARIO_MATRIX.map((row, ri) => (
                <React.Fragment key={ROW_AXIS_LABELS[ri]}>
                  <div className="ScenarioMatrix_rowLabel" role="rowheader">
                    {ROW_AXIS_LABELS[ri]}
                  </div>
                  {row.map(({ scenarioId }) => {
                    const def = SCENARIO_DEFS[scenarioId];
                    const selected = Scenario_ID === scenarioId;
                    return (
                      <button
                        key={scenarioId}
                        type="button"
                        role="gridcell"
                        className={`ScenarioMatrix_cell${selected ? " is-selected" : ""}`}
                        aria-pressed={selected}
                        aria-label={`Scenario ${def.letter}: ${def.name}. ${def.subtitle}.`}
                        onClick={() => Set_Scenario_ID(scenarioId)}
                      >
                        <span className="ScenarioMatrix_cellLetter">{def.letter}</span>
                        <span className="ScenarioMatrix_cellKicker">Scenario {def.letter}</span>
                        <span className="ScenarioMatrix_cellName">{def.name}</span>
                        <span className="ScenarioMatrix_cellSubtitle">{def.subtitle}</span>
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {Scenario_ID !== -1 ? (
        <div className="Scenario_Selector_Borders">
          <div className="Scenario_Selector_Content">
            <div className="Scenario_Title">
              <h2 className="h5">Scenario {String.fromCharCode(65 + Scenario_ID)}</h2>
              <h3 className="h5">
                {`${Scenario_ID % 2 === 1 ? "Connected intelligence" : "Siloed intelligence"}, ${Scenario_ID < 2 ? "high environmental and social impact" : "low environmental and social impact"}`}
              </h3>
            </div>
            <div className="Scenario_Body">
              <p><b>By 2035...</b></p>
              {Scenario_Html[Scenario_ID]}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
