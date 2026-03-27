"use client";

import { useState } from "react";

const OBJECTIVES = [
  "join-up leaders: identify priority areas; areas with most promise and where to focus effort",
  "join-up activities: co-ordinate activities to meet shared strategic needs, improving value from existing and planned work",
  "leverage funding: enable the funding of larger-scale, more ambitious projects",
  "facilitate demonstrators: accelerating ideas and testing them in practice to bring them to market sooner",
  "engage globally: seize an advantage in the rapidly evolving and economically strategic transport technology sector",
  "create a line of sight to government priorities: understand the priorities of the Secretaries of State of the Department for Transport (DfT) and other relevant departments.",
];

export function ObjectivesToggle() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <p className="text-sm leading-relaxed text-gray-700 mb-2">
        The objectives of the board are to:
      </p>
      <ul className="list-disc pl-6 text-sm leading-relaxed text-gray-700 space-y-1 mb-3">
        {(expanded ? OBJECTIVES : OBJECTIVES.slice(0, 3)).map((obj) => (
          <li key={obj}>{obj}</li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="text-[14px] text-[#21808B] hover:underline focus:outline-none"
        aria-expanded={expanded}
      >
        {expanded ? "Show less" : `Show ${OBJECTIVES.length - 3} more objectives`}
      </button>
    </div>
  );
}
