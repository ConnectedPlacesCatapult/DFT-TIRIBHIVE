"use client";

import React, { useEffect, useRef, useState } from "react";
import { tribAssets } from "@/lib/tribAssets";

export default function RoadmapHomePage() {
  const focusRef = useRef<HTMLDivElement>(null);
  const [windowWidth, setWindowWidth] = useState(1200);

  useEffect(() => {
    focusRef.current?.focus();
    const update = () => setWindowWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="Home">
      <div ref={focusRef} tabIndex={-1} className="Bordered_Content Vision_Container">
        <div className="Vision">
          <h1 className="h1 Vision_Title">2035 Vision</h1>
          <div className="Vision_Body">
            <p>
              Our Vision is to enable a trusted ecosystem of connected digital twins for multi-modal
              UK transport networks. This will facilitate effective decision making to optimise
              solutions and deliver efficient, safe, and environmentally conscious mobility for
              people and goods.
            </p>
            <p>The Roadmap will:</p>
            <ul>
              <li>
                Be an essential tool for engagement and alignment around common strategic priorities
              </li>
              <li>
                Provide an outline of the activities and building blocks to deliver the vision
              </li>
              <li>
                Enable improved facilitation and coordination across TRIB member bodies and other
                broader stakeholders in future investment in digital twinning research and
                innovation, connected digital twins and cyber-physical infrastructure
              </li>
              <li>
                Enable a socio-environmental and technical change in the transport sector
              </li>
            </ul>
          </div>
        </div>
        {windowWidth > 800 ? (
          <div className="Hero_Image_Container">
            <img
              className="Hero_Image"
              src={tribAssets.images.background}
              alt="Background"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
