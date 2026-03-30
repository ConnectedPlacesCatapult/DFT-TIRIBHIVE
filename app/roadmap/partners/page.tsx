"use client";

import React, { useEffect, useRef } from "react";
import { tribAssets } from "@/lib/tribAssets";

export default function PartnersPage() {
  const focusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    focusRef.current?.focus();
  }, []);

  return (
    <div ref={focusRef} tabIndex={-1} className="Partners Bordered_Content">
      <h1 className="Title">Project partners</h1>
      <div className="Intro">
        <p className="p1">
          <b>Transport Research and Innovation Board</b>
          <br />
          The Transport Research and Innovation Board brings together representatives from key
          organisations that fund and carry out research and innovation in the UK, as well as
          government departments with an interest in transport.
          <br />
          <a
            href="https://www.gov.uk/government/groups/transport-research-and-innovation-board"
            target="_blank"
            rel="noreferrer"
          >
            See more.
          </a>
        </p>
        <p>The objectives of the board are to:</p>
        <ul>
          <li className="p1">join-up leaders: identify priority areas; areas with most promise and where to focus effort</li>
          <li className="p1">join-up activities: co-ordinate activities to meet shared strategic needs, improving value from existing and planned work</li>
          <li className="p1">leverage funding: enable the funding of larger-scale, more ambitious projects</li>
          <li className="p1">facilitate demonstrators: accelerating ideas and testing them in practice to bring them to market sooner</li>
          <li className="p1">engage globally: seize an advantage in the rapidly evolving and economically strategic transport technology sector</li>
          <li className="p1">create a line of sight to government priorities: understand the priorities of the Secretaries of State of the Department for Transport (DfT) and other relevant departments.</li>
        </ul>
        <p>
          DfT provides the secretariat for the TRIB Board.
          <br /><br />
          The TRIB Board has awarded Connected Places Catapult (CPC) a grant to develop this shared
          2035 Vision and Roadmap.
          <br /><br />
          We would like to thank the following organisations for their contribution to the project.
        </p>
      </div>

      <div className="Logos">
        <img className="Partner_Image" src={tribAssets.logos.dft} id="DfT" alt="DfT logo" />
        <img className="Partner_Image" src={tribAssets.logos.cpc} id="CPC" alt="CPC logo" />
        <div className="Placeholder">Maritime &amp; Coastguard Agency</div>
        <div className="Placeholder">Network Rail</div>
        <img className="Partner_Image" src={tribAssets.logos.ukri} id="UKRI" alt="UKRI logo" />
        <div className="Placeholder">Economic and Social Research Council</div>
        <img className="Partner_Image" src={tribAssets.logos.ndtpBlue} id="National Digital Twin Programme" alt="National Digital Twin Programme logo" />
        <img className="Partner_Image" src={tribAssets.logos.hvmCatapult} id="HVM Catapult" alt="HVM Catapult logo" />
        <div className="Placeholder">National Highways</div>
        <img className="Partner_Image" src={tribAssets.logos.adept} id="ADEPT" alt="ADEPT logo" />
        <img className="Partner_Image" src={tribAssets.logos.hs2} id="HS2" alt="HS2 logo" />
        <img className="Partner_Image" src={tribAssets.logos.innovateUk} id="Innovate UK" alt="Innovate UK logo" />
        <img className="Partner_Image" src={tribAssets.logos.epsrc} id="EPSRC" alt="EPSRC logo" />
        <div className="Placeholder">Government Office for Science</div>
        <img className="Partner_Image" src={tribAssets.logos.dsit} id="DSIT" alt="DSIT logo" />
        <img className="Partner_Image" src={tribAssets.logos.rssb} id="RSSB" alt="RSSB logo" />
        <img className="Partner_Image" src={tribAssets.logos.ati} id="Aerospace Technology Institute" alt="Aerospace Technology Institute logo" />
      </div>
    </div>
  );
}
