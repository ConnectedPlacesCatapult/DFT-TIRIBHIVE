"use client";

import React, { useState, useEffect } from "react";
import TribNavBar from "./TribNavBar";
import RoadmapFull from "./RoadmapFull";

export default function RoadmapShell({ children }: { children: React.ReactNode }) {
  const [Tab_Expanded, Set_Tab_Expanded] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1200);

  useEffect(() => {
    const update = () => setWindowWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="Trib_App">
      <TribNavBar Set_Tab_Expanded={Set_Tab_Expanded} windowWidth={windowWidth} />
      <div className="Trib_Content">{children}</div>
      <RoadmapFull Tab_Expanded={Tab_Expanded} Set_Tab_Expanded={Set_Tab_Expanded} />
    </div>
  );
}
