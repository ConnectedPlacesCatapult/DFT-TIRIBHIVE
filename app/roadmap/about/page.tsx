"use client";

import React, { useEffect, useRef } from "react";
import { tribAssets } from "@/lib/tribAssets";

export default function AboutPage() {
  const focusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    focusRef.current?.focus();
  }, []);

  return (
    <div className="About Bordered_Content">
      <div ref={focusRef} tabIndex={-1} className="about_elements_container">
        <div className="about_placeholder_image">
          <img src={tribAssets.images.about} alt="About" />
        </div>
        <div className="about_text_container">
          <p className="about_text">
            The use of digital twin technology has the potential to transform the UK transport sector
            to deliver better outcomes for the user, more reliable cross modal services, and advance
            the transition to net zero. There is a need to better coordinate research, development
            and investment in digital twin technology.
          </p>
          <p className="about_text">
            The Transport Research and Innovation Board (TRIB) has therefore awarded Connected Places
            Catapult (CPC) a grant to develop a shared 2035 Vision and Roadmap. This
            TRIB-commissioned 2035 vision aims to drive a common understanding of the potential
            value of federated network of transport digital twins, and the roadmap sets out a
            prioritised list of activities required to achieve this.
          </p>
          <p>
            <b>Overview and Aims of the Transport Digital Twin Vision and Roadmap</b>
          </p>
          <p>
            The Transport Vision and Roadmap outlines the activities that TRIB members and other
            broader stakeholders need to take to focus investment, drive coordination, address skills
            gaps and align research, development, and innovation in transport. There are many
            definitions of digital twins, but the UK&rsquo;s National Digital Twin Programme defines
            a digital twin as a digital model with real- or right-time two-way information flows,
            enabling the implementation of autonomous decision making. This can provide autonomous
            optimisation, and remote and autonomous operation.
          </p>
          <p>
            Federated networks of digital twins can play a key role in supporting TRIB members and
            the wider transport sector to realise ambitious targets for transitioning to net zero,
            improving the user experience, increasing resiliency, furthering safety, and accelerating
            innovation. For example, the roadmap could drive an improved understanding of the
            opportunities digital twins offer on decarbonisation, with insights from transport use
            cases informing long term strategic decisions for zero carbon solutions.
          </p>
          <p>
            This shared Vision and Roadmap is intended to support TRIB members, government, wider
            industry and academia to work together effectively and efficiently on the future
            development of digital twins. The 2035 Vision is therefore accompanied by 2025 and 2030
            visions. The roadmap provides timelines and key activities, mapped to outputs and
            outcomes.
          </p>
          <p>
            <b>Potential Benefits of Connected Digital Twins in Transport</b>
          </p>
          <p>
            Using digital twins as a tool to improve our knowledge of transport system infrastructure
            and operations will allow the transport system to be better modelled, understood, and
            simulated. This deeper understanding can in turn create financial and time efficiencies
            in solution identification, design, and implementation of new products. The operational,
            environmental and safety predictions that can be made based on the resulting insights can
            inform the introduction of new and enhanced modes across the transportation sector. New
            opportunities to explore data standardisation will also enable efficient data sharing
            across asset owners and operators.
          </p>
        </div>
      </div>
    </div>
  );
}
