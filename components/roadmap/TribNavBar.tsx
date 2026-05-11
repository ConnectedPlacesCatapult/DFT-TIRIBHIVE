"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { tribAssets } from "@/lib/tribAssets";

interface TribNavBarProps {
  Set_Tab_Expanded: (v: boolean) => void;
  windowWidth: number;
}

const TribNavBar = ({ Set_Tab_Expanded, windowWidth }: TribNavBarProps) => {
  const pathname = usePathname();
  const [Hamburger_Active, Set_Hamburger_Active] = useState(false);
  const [Font_Size, Set_Font_Size] = useState(1);
  const [Line_Height, Set_Line_Height] = useState(1.1);
  const [Hue_Value, Set_Hue_Value] = useState(0);
  const [Contrast_Value, Set_Contrast_Value] = useState(1);

  useEffect(() => {
    Set_Tab_Expanded(false);
    Set_Hamburger_Active(false);
  }, [pathname]);

  useEffect(() => {
    Set_Tab_Expanded(false);
  }, [Hamburger_Active]);

  useEffect(() => {
    const root = document.querySelector(":root") as HTMLElement;
    root.style.setProperty("--relative_font_size", String(Font_Size));
  }, [Font_Size]);

  useEffect(() => {
    const root = document.querySelector(":root") as HTMLElement;
    root.style.setProperty("--relative_line_height", String(Line_Height));
  }, [Line_Height]);

  useEffect(() => {
    const root = document.querySelector(":root") as HTMLElement;
    root.style.setProperty("--hue_rotation", `${Hue_Value}deg`);
  }, [Hue_Value]);

  useEffect(() => {
    const root = document.querySelector(":root") as HTMLElement;
    root.style.setProperty("--contrast_value", String(Contrast_Value));
  }, [Contrast_Value]);

  const Navigation_Items = (
    <>
      <Link
        className="Navigation_Item"
        style={{ fontWeight: pathname === "/" ? 700 : 400 }}
        href="/"
      >
        Vision
      </Link>
      <Link
        className="Navigation_Item"
        style={{ fontWeight: pathname === "/roadmap/about" ? 700 : 400 }}
        href="/roadmap/about"
      >
        About
      </Link>
      <Link
        className="Navigation_Item"
        style={{ fontWeight: pathname === "/roadmap/future-scenarios" ? 700 : 400 }}
        href="/roadmap/future-scenarios"
      >
        Future scenarios
      </Link>
      <Link
        className="Navigation_Item"
        style={{ fontWeight: pathname === "/roadmap/case-studies" ? 700 : 400 }}
        href="/roadmap/case-studies"
      >
        Case studies
      </Link>
    </>
  );

  return (
    <>
      <div className="Nav_Bar">
        <nav className="Bordered_Content Top_Bar">
          <Link
            className={`Logo ${pathname !== "/roadmap" ? "Not_At_Home" : ""}`}
            href="/roadmap"
          >
            {windowWidth > 1000 ? "TRIB digital twin Roadmap 2035" : "Roadmap"}
          </Link>
          <div className="Navigation">
            {windowWidth > 600 ? Navigation_Items : null}
            <button
              className="Hamburger"
              onClick={() => Set_Hamburger_Active(!Hamburger_Active)}
            >
              <img alt="Hamburger menu" src={tribAssets.root("Hamburger.png")} />
            </button>
          </div>
        </nav>
      </div>

      {Hamburger_Active ? (
        <div
          className="Window_Overlay"
          onClick={() => Set_Hamburger_Active(false)}
        />
      ) : null}

      <nav
        className="Hamburger_Sidebar"
        style={{ width: Hamburger_Active ? "500px" : "0px" }}
      >
        <div className="Hamburger_Navigation">
          {Hamburger_Active ? (
            <>
              <button
                className="Hamburger_Close"
                onClick={() => Set_Hamburger_Active(false)}
                style={{ opacity: Hamburger_Active ? 1 : 0, cursor: Hamburger_Active ? "pointer" : "default" }}
              >
                <img alt="Close Hamburger Menu" src={tribAssets.root("Close.png")} />
              </button>
              {windowWidth <= 600 ? Navigation_Items : null}
              <Link className="Hamburger_Item" style={{ fontWeight: pathname === "/" ? 700 : 400 }} href="/">
                Vision
              </Link>
              <Link
                className="Hamburger_Item"
                style={{ fontWeight: pathname === "/roadmap/partners" ? 700 : 400 }}
                href="/roadmap/partners"
              >
                Project partners
              </Link>
              <Link
                className="Hamburger_Item"
                style={{ fontWeight: pathname === "/roadmap/literature-review" ? 700 : 400 }}
                href="/roadmap/literature-review"
              >
                Relevant Publications
              </Link>
              <Link
                className="Hamburger_Item"
                style={{ fontWeight: pathname === "/roadmap/stakeholders" ? 700 : 400 }}
                href="/roadmap/stakeholders"
              >
                Stakeholders
              </Link>
              <Link
                className="Hamburger_Item"
                style={{ fontWeight: pathname === "/roadmap/use-cases" ? 700 : 400 }}
                href="/roadmap/use-cases"
              >
                Use Cases
              </Link>
              <br />
              <Link
                className="Hamburger_Item"
                style={{ fontWeight: pathname === "/roadmap/accessibility" ? 700 : 400 }}
                href="/roadmap/accessibility"
              >
                Accessibility statement
              </Link>
              <br className="End" />
              <p>
                Email{"\t"}
                <a href="mailto:digitaltwins@dft.gov.uk">digitaltwins@dft.gov.uk</a>
              </p>
              <br className="End" />

              <div className="accessibility_switch">
                <p>Font-Size:</p>
                <select
                  onChange={(e) => Set_Font_Size(Number(e.target.value))}
                  value={Font_Size}
                >
                  <option value="0.75">Small</option>
                  <option value="1">Regular</option>
                  <option value="1.25">Large</option>
                </select>
              </div>
              <div className="accessibility_switch">
                <p>Line Height:</p>
                <select
                  onChange={(e) => Set_Line_Height(Number(e.target.value))}
                  value={Line_Height}
                >
                  <option value="1">Small</option>
                  <option value="1.1">Regular</option>
                  <option value="1.25">Large</option>
                  <option value="1.5">Extra Large</option>
                </select>
              </div>
              <div className="accessibility_switch">
                <p>Contrast:</p>
                <input
                  type="range"
                  min={0}
                  max={2}
                  step={0.1}
                  value={Contrast_Value}
                  onChange={(e) => Set_Contrast_Value(Number(e.target.value))}
                  className="slider"
                />
              </div>
              <div className="accessibility_switch">
                <p>Hue Rotation:</p>
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={10}
                  value={Hue_Value}
                  onChange={(e) => Set_Hue_Value(Number(e.target.value))}
                  className="slider"
                />
              </div>
            </>
          ) : null}
        </div>
      </nav>
    </>
  );
};

export default TribNavBar;
