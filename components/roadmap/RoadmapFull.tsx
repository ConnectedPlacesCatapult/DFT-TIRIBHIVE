"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Roadmap_Content from "@/data/roadmap/RoadmapContent.json";
import { TRIB_PUBLIC_ROOT, tribAssets } from "@/lib/tribAssets";

const Expand_Icon = tribAssets.root("Expand.svg");
const Collapse_Icon = tribAssets.root("Collapse.svg");

interface RoadmapFullProps {
  Tab_Expanded: boolean;
  Set_Tab_Expanded: (v: boolean) => void;
}

const RoadmapFull = (props: RoadmapFullProps) => {
  const [Components_Expanded, Set_Components_Expanded] = useState<number[][]>([]);
  const [seed, Set_Seed] = useState(1);
  const [Hovered_Output, Set_Hovered_Output] = useState<string | undefined>();
  const [Workstream_Expanded, Set_Workstream_Expanded] = useState(false);
  const [Selected_Workstream, Set_Selected_Workstream] = useState(0);
  const focusRef = useRef<HTMLDivElement>(null);
  const focusRefDetails = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const Workstreams: number[][] = [];
    Roadmap_Content.Workstreams.forEach(() => {
      Workstreams.push([]);
    });
    Set_Components_Expanded(Workstreams);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (!focusRefDetails.current) return;
      const component_element = focusRefDetails.current.getElementsByClassName("Component");
      if (
        component_element.length > 0 &&
        Components_Expanded.length > 0 &&
        Workstream_Expanded === true
      ) {
        (component_element[Components_Expanded[Selected_Workstream][0]] as HTMLElement)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 1000);

    if (props.Tab_Expanded) {
      if (Workstream_Expanded) focusRefDetails.current?.focus();
      else focusRef.current?.focus();
    }
  }, [Workstream_Expanded]);

  useEffect(() => {
    Set_Seed(Math.random());
  }, [Components_Expanded]);

  useEffect(() => {
    if (props.Tab_Expanded) {
      if (Workstream_Expanded) focusRefDetails.current?.focus();
      else focusRef.current?.focus();
    }
  }, [props.Tab_Expanded]);

  return (
    <div
      className="Roadmap_Tab"
      style={{
        transform: props.Tab_Expanded
          ? `translateY(80px)`
          : `translateY(calc(100% - 10px))`,
      }}
    >
      <div className="Bordered_Content">
        <div className="Roadmap_Topbar">
          <div className="Roadmap_Title">ROADMAP</div>
          <div className="spacer"></div>
          <div className="spacer"></div>
          <button
            className="Roadmap_State_Button"
            onClick={() => props.Set_Tab_Expanded(!props.Tab_Expanded)}
          >
            {props.Tab_Expanded ? "Hide" : "View"} Roadmap
            <i className={props.Tab_Expanded ? "arrow down icon" : "arrow up icon"}></i>
          </button>
        </div>

        {/* Workstream detail panel */}
        <div
          className="Roadmap_Container Roadmap_Details"
          ref={focusRefDetails}
          tabIndex={-1}
          style={{
            transform: Workstream_Expanded ? `translateX(0)` : `translateX(100vw)`,
          }}
        >
          <button
            tabIndex={props.Tab_Expanded && Workstream_Expanded ? 0 : -1}
            className="Roadmap_Back_Button"
            onClick={() => Set_Workstream_Expanded(false)}
          >
            <i className="left arrow icon"></i>Back
          </button>
          <div className="Roadmap_Legend">
            <div
              className="Workstream_Title"
              style={{
                backgroundColor: Roadmap_Content.Workstreams[Selected_Workstream].colour,
              }}
            >
              <img
                alt=""
                src={
                  Roadmap_Content.Workstreams[Selected_Workstream].icon
                    ? `${TRIB_PUBLIC_ROOT}/${Roadmap_Content.Workstreams[Selected_Workstream].icon}.svg`
                    : ""
                }
                className={Roadmap_Content.Workstreams[Selected_Workstream]["icon-filter"]}
              />
              <h1
                className="h4"
                style={{
                  color: Roadmap_Content.Workstreams[Selected_Workstream]["text-colour"],
                }}
              >
                {Roadmap_Content.Workstreams[Selected_Workstream].title}
              </h1>
            </div>
            <div className="Legend">
              <h1 className="h5">Key Contributors</h1>
              <div className="Icons">
                <div className="p2">
                  <div className="Legend_Icon">
                    <img alt="" className="white" src={`${TRIB_PUBLIC_ROOT}/Academia.png`} />
                  </div>
                  Academia
                </div>
                <div className="p2">
                  <div className="Legend_Icon">
                    <img alt="" className="white" src={`${TRIB_PUBLIC_ROOT}/Industry.png`} />
                  </div>
                  Industry
                </div>
                <div className="p2">
                  <div className="Legend_Icon">
                    <img alt="" className="white" src={`${TRIB_PUBLIC_ROOT}/Government.png`} />
                  </div>
                  Government
                </div>
                <div className="p2">
                  <div className="Legend_Icon">
                    <img alt="" className="white" src={`${TRIB_PUBLIC_ROOT}/Innovation Funding Bodies.png`} />
                  </div>
                  Innovation Funding Bodies
                </div>
                <div className="Break"></div>
                <div>
                  <div className="Lead_Colour"></div>Lead
                </div>
                <div>
                  <div className="Contributor_Colour"></div>Contributor
                </div>
              </div>
            </div>
          </div>

          <div className="Roadmap_Components">
            <div className="Component_Spacer"></div>
            {Roadmap_Content.Workstreams[Selected_Workstream].components.map(
              (Component, Component_Index) => {
                const isExpanded =
                  Components_Expanded.length > 0 &&
                  Components_Expanded[Selected_Workstream].includes(Component_Index);
                return (
                  <div className="Component" key={Component_Index}>
                    <button
                      className="Component_Tab"
                      tabIndex={props.Tab_Expanded && Workstream_Expanded ? 0 : -1}
                      style={{
                        backgroundColor: Roadmap_Content.Workstreams[Selected_Workstream].colour,
                        color: Roadmap_Content.Workstreams[Selected_Workstream]["text-colour"],
                      }}
                      onClick={() => {
                        Set_Seed(Math.random());
                        const idx = Components_Expanded[Selected_Workstream].indexOf(Component_Index);
                        if (idx !== -1) {
                          const ns = Components_Expanded.map((a) => [...a]);
                          ns[Selected_Workstream].splice(idx, 1);
                          Set_Components_Expanded(ns);
                        } else {
                          const ns = Components_Expanded.map((a) => [...a]);
                          ns[Selected_Workstream].push(Component_Index);
                          Set_Components_Expanded(ns);
                        }
                      }}
                    >
                      <img
                        alt=""
                        className={Roadmap_Content.Workstreams[Selected_Workstream]["icon-filter"]}
                        src={Component.icon ? `${TRIB_PUBLIC_ROOT}/${Component.icon}.svg` : ""}
                      />
                      <h1
                        className="h5"
                        style={{
                          color: Roadmap_Content.Workstreams[Selected_Workstream]["text-colour"],
                        }}
                      >
                        {Component.title}
                      </h1>
                      <img
                        alt={isExpanded ? "Collapse Icon" : "Expand Icon"}
                        className={`Component_Icon ${Roadmap_Content.Workstreams[Selected_Workstream]["icon-filter"]}`}
                        src={isExpanded ? Collapse_Icon : Expand_Icon}
                        style={{ top: `calc(50% - 12px)` }}
                      />
                    </button>
                    <div
                      className="Component_Content"
                      style={{ height: isExpanded ? "fit-content" : "0px" }}
                    >
                      <div
                        tabIndex={props.Tab_Expanded && Workstream_Expanded && isExpanded ? 0 : -1}
                        className="Outcomes"
                      >
                        <h2 className="h5" style={{ color: "#15335E" }}>
                          Outcomes
                        </h2>
                        <ul>
                          {(Component.outcomes ?? []).map((Outcome, oi) => (
                            <li key={oi} style={{ color: "#15335E" }}>
                              {Outcome}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div
                        tabIndex={props.Tab_Expanded && Workstream_Expanded && isExpanded ? 0 : -1}
                        className="Outputs_and_Activities"
                      >
                        <table>
                          <thead>
                            <tr>
                              <th className="h5" style={{ color: "#15335E" }}>Outputs</th>
                              <th className="h5" style={{ color: "#15335E" }}>Activities</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Component.outputs.map((Output, Output_Index) => (
                              <tr key={Output_Index}>
                                <td
                                  className="p1"
                                  style={{
                                    borderLeft: `5px solid ${Roadmap_Content.Workstreams[Selected_Workstream].colour}`,
                                  }}
                                >
                                  <div className="Output_Cell">
                                    <p className="p1" style={{ color: "#15335E" }}>
                                      {Output.title}
                                    </p>
                                    <div>
                                      <div
                                        className="Years h4"
                                        style={{
                                          backgroundColor: Roadmap_Content.Workstreams[Selected_Workstream].colour,
                                          color: Roadmap_Content.Workstreams[Selected_Workstream]["text-colour"],
                                        }}
                                      >
                                        {Output.start_date} - {Output.end_date}
                                      </div>
                                      {Output.lead_contributor && (
                                        <div className="Lead_Icon">
                                          <img
                                            alt={`${Output.lead_contributor} is the Lead Contributor.`}
                                            className="white"
                                            src={`${TRIB_PUBLIC_ROOT}/${Output.lead_contributor}.png`}
                                          />
                                        </div>
                                      )}
                                      {(Output.other_contributors ?? []).map((contributor, ci) => (
                                        <div key={ci} className="Support_Icon">
                                          <img
                                            alt={`${contributor} is a Support Contributor.`}
                                            src={`${TRIB_PUBLIC_ROOT}/${contributor}.png`}
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <ul>
                                    {(Output.activities ?? []).map((Activity, ai) => (
                                      <li key={ai} className="p1" style={{ color: "#15335E" }}>
                                        {Activity}
                                      </li>
                                    ))}
                                  </ul>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="Publications">
                        <h2 className="h5" style={{ color: "#15335E" }}>
                          Relevant Publications
                        </h2>
                        <div>
                          {(Component.relevant_links ?? []).map((link, li) => (
                            <a
                              key={li}
                              href={link.src}
                              target="_blank"
                              rel="noreferrer"
                              tabIndex={
                                props.Tab_Expanded && Workstream_Expanded && isExpanded ? 0 : -1
                              }
                              style={{ color: "#15335E" }}
                            >
                              <img alt="" src={`${TRIB_PUBLIC_ROOT}/Document.png`} />
                              {link.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Main roadmap overview */}
        <div
          className="Roadmap_Container"
          ref={focusRef}
          tabIndex={-1}
          style={{
            transform: Workstream_Expanded ? `translateX(-100vw)` : `translateX(0)`,
          }}
        >
          <div className="Roadmap_Intro">
            <p>
              The TRIB-commissioned Vision and Roadmap, produced by the Connected Places Catapult,
              consists of workstreams, components, outputs, outcomes and activities, which
              collectively guide us towards a future in which we achieve the shared vision in 2035.
            </p>
            <p>
              At the top level, the roadmap shows different workstreams together with their
              corresponding components. A click on each component opens up the expected output and
              target delivery date. A further click on &lsquo;Explore this workstream&rsquo; presents
              the output and associated activities, the key contributors and supporting organisations,
              outcomes, and a selection of relevant publications.
            </p>
            <p>
              These activities are the building blocks which can be used to achieve the 2035 Vision
              and have been selected based on those which are likely to have the most impact. The
              Roadmap has been developed in collaboration with experts from academia, industry and
              government (further detail on the partners and stakeholder pages), but the list of
              activities is not exhaustive and prioritisation has been conducted by assessing the
              greatest potential impact of the activities.
            </p>
          </div>
          <Link
            className="Roadmap_Learn_More"
            tabIndex={props.Tab_Expanded && !Workstream_Expanded ? 0 : -1}
            href="/roadmap/about"
            onClick={() => props.Set_Tab_Expanded(false)}
          >
            Learn More
            <i className="big angle right icon" />
          </Link>

          <p className="Roadmap_Scroll_Hint p2" aria-hidden="true">
            Swipe left/right to view the full timeline.
          </p>
          <div className="Roadmap_Table_Scroll" role="region" aria-label="Roadmap timeline table">
            <table className="Roadmap">
              <thead>
              <tr>
                <th className="Roadmap_Header_1">Workstream</th>
                <th className="Roadmap_Header_2">Component</th>
                <th className="Empty Spacer_1"></th>
                <th className="Roadmap_Header_3" colSpan={3}>
                  Target output end year
                </th>
              </tr>
              <tr>
                <td className="Empty" colSpan={3}></td>
                <td className="Line_Down">2023-2025</td>
                <td className="Line_Down">2026-2030</td>
                <td className="Line_Down">2031-2035</td>
              </tr>
            </thead>
            <tbody key={seed}>
              {Roadmap_Content.Workstreams.map((Workstream, Workstream_Index) => {
                let Rows_Workstream_Spans = Workstream.components.length;
                if (Components_Expanded.length > 0) {
                  Components_Expanded[Workstream_Index]?.forEach((Expanded_Component_Index) => {
                    Rows_Workstream_Spans +=
                      Workstream.components[Expanded_Component_Index].outputs.length + 2;
                  });
                }

                return Workstream.components.map((Component, Component_Index) => {
                  const Last_Output_Date = Math.max(
                    ...Component.outputs.map((o) => o.end_date ?? 0)
                  );
                  const compExpanded =
                    Components_Expanded.length > 0 &&
                    Components_Expanded[Workstream_Index]?.includes(Component_Index);

                  return (
                    <React.Fragment key={`${Workstream_Index}-${Component_Index}`}>
                      <tr>
                        {Component_Index === 0 ? (
                          <td
                            className="Workstream"
                            rowSpan={Rows_Workstream_Spans}
                            style={{
                              backgroundColor: Workstream.colour,
                              color: Workstream["text-colour"],
                            }}
                          >
                            <div
                              tabIndex={props.Tab_Expanded && !Workstream_Expanded ? 0 : -1}
                              className="Workstream_Content"
                              style={{
                                backgroundColor: Workstream.colour,
                                color: Workstream["text-colour"],
                              }}
                              onClick={() => {
                                Set_Selected_Workstream(Workstream_Index);
                                Set_Workstream_Expanded(true);
                              }}
                            >
                              <img
                                alt=""
                                className={Workstream["icon-filter"]}
                                src={Workstream.icon ? `${TRIB_PUBLIC_ROOT}/${Workstream.icon}.svg` : ""}
                              />
                              <div>
                                <h1
                                  className="h4"
                                  style={{
                                    backgroundColor: Workstream.colour,
                                    color: Workstream["text-colour"],
                                  }}
                                >
                                  {Workstream.title}
                                </h1>
                                <button
                                  tabIndex={props.Tab_Expanded && !Workstream_Expanded ? 0 : -1}
                                  className="p2"
                                  style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    backgroundColor: Workstream.colour,
                                    color: Workstream["text-colour"],
                                  }}
                                  onClick={() => {
                                    Set_Selected_Workstream(Workstream_Index);
                                    Set_Workstream_Expanded(true);
                                  }}
                                >
                                  Explore this Workstream
                                  <i className="big angle right icon"></i>
                                </button>
                              </div>
                            </div>
                          </td>
                        ) : null}

                        <td className="Component">
                          <button
                            tabIndex={props.Tab_Expanded && !Workstream_Expanded ? 0 : -1}
                            style={{
                              backgroundColor: Workstream.colour,
                              color: Workstream["text-colour"],
                            }}
                            onClick={() => {
                              Set_Seed(Math.random());
                              const idx = Components_Expanded[Workstream_Index]?.indexOf(Component_Index) ?? -1;
                              if (idx !== -1) {
                                const ns = Components_Expanded.map((a) => [...a]);
                                ns[Workstream_Index].splice(idx, 1);
                                Set_Components_Expanded(ns);
                              } else {
                                const ns = Components_Expanded.map((a) => [...a]);
                                ns[Workstream_Index]?.push(Component_Index);
                                Set_Components_Expanded(ns);
                              }
                            }}
                          >
                            <img
                              alt=""
                              className={`Component_Icon_Descriptor ${Workstream["icon-filter"]}`}
                              src={Component.icon ? `${TRIB_PUBLIC_ROOT}/${Component.icon}.svg` : ""}
                            />
                            {Component.title}
                            <img
                              alt={compExpanded ? "Collapse Icon" : "Expand Icon"}
                              className={`Component_Icon ${Workstream["icon-filter"]}`}
                              src={compExpanded ? Collapse_Icon : Expand_Icon}
                              style={{ top: `calc(50% - 12px)` }}
                            />
                          </button>
                        </td>

                        <td className="Target Empty">
                          <div className="Line_Before" style={{ border: `solid 1px ${Workstream.colour}` }} />
                          <div className="Line_After" style={{ border: `solid 1px ${Workstream.colour}` }} />
                        </td>

                        <td className="Target">
                          <div
                            className="Line_Before"
                            style={{ backgroundColor: Workstream.colour, border: `solid 1px ${Workstream.colour}` }}
                          />
                          {Last_Output_Date > 2025 ? (
                            <div
                              className="Line_After"
                              style={{ backgroundColor: Workstream.colour, border: `solid 1px ${Workstream.colour}` }}
                            />
                          ) : (
                            <div
                              tabIndex={props.Tab_Expanded && !Workstream_Expanded && Last_Output_Date <= 2025 ? 0 : -1}
                              title={Last_Output_Date <= 2025 ? "Component's outputs are expected between 2023 and 2025" : ""}
                              className="Point"
                              style={{ backgroundColor: Workstream.colour, border: `solid 1px ${Workstream.colour}` }}
                            />
                          )}
                        </td>

                        {Last_Output_Date > 2025 ? (
                          <td className="Target">
                            <div
                              className="Line_Before"
                              style={{ backgroundColor: Workstream.colour, border: `solid 1px ${Workstream.colour}` }}
                            />
                            {Last_Output_Date > 2030 ? (
                              <div
                                className="Line_After"
                                style={{ backgroundColor: Workstream.colour, border: `solid 1px ${Workstream.colour}` }}
                              />
                            ) : (
                              <div
                                tabIndex={props.Tab_Expanded && !Workstream_Expanded && Last_Output_Date <= 2030 ? 0 : -1}
                                title={Last_Output_Date <= 2030 ? "Component's outputs are expected between 2026 and 2030" : ""}
                                className="Point"
                                style={{ backgroundColor: Workstream.colour, border: `solid 1px ${Workstream.colour}` }}
                              />
                            )}
                          </td>
                        ) : null}

                        {Last_Output_Date > 2030 ? (
                          <td className="Target">
                            <div
                              className="Line_Before"
                              style={{ backgroundColor: Workstream.colour, border: `solid 1px ${Workstream.colour}` }}
                            />
                            {Last_Output_Date > 2035 ? (
                              <div
                                className="Line_After"
                                style={{ backgroundColor: Workstream.colour, border: `solid 1px ${Workstream.colour}` }}
                              />
                            ) : (
                              <div
                                tabIndex={props.Tab_Expanded && !Workstream_Expanded && Last_Output_Date <= 2035 ? 0 : -1}
                                title={Last_Output_Date <= 2035 ? "Component's outputs are expected between 2031 and 2035" : ""}
                                className="Point"
                                style={{ backgroundColor: Workstream.colour, border: `solid 1px ${Workstream.colour}` }}
                              />
                            )}
                          </td>
                        ) : null}
                      </tr>

                      {Components_Expanded.length > 0
                        ? Component.outputs.map((Output, Output_Index) => (
                            <React.Fragment key={`${Workstream_Index}-${Component_Index}-${Output_Index}`}>
                              {Output_Index === 0 ? (
                                <tr
                                  className="Output_Row"
                                  style={{ display: compExpanded ? "table-row" : "none" }}
                                >
                                  <td className="Caption">
                                    <div className="p1" style={{ color: "#15335E" }}>
                                      Outputs
                                      <button
                                        className="Explore_Component p2"
                                        tabIndex={
                                          props.Tab_Expanded && !Workstream_Expanded && compExpanded ? 0 : -1
                                        }
                                        style={{
                                          background: "none",
                                          border: "none",
                                          cursor: "pointer",
                                          color: "#15335E",
                                        }}
                                        onClick={() => {
                                          Set_Selected_Workstream(Workstream_Index);
                                          const ws: number[][] = Roadmap_Content.Workstreams.map(() => []);
                                          ws[Workstream_Index] = [Component_Index];
                                          Set_Components_Expanded(ws);
                                          Set_Workstream_Expanded(true);
                                        }}
                                      >
                                        Explore this Component
                                        <i className="angle right icon"></i>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ) : null}

                              <tr
                                className="Output_Row"
                                style={{ display: compExpanded ? "table-row" : "none" }}
                              >
                                <td
                                  className={`Output ${Output_Index === Component.outputs.length - 1 ? "Last_Output" : ""}`}
                                  onMouseEnter={() =>
                                    Set_Hovered_Output(`${Workstream_Index}-${Component_Index}-${Output_Index}`)
                                  }
                                  onMouseLeave={() =>
                                    Set_Hovered_Output((prev) =>
                                      prev === `${Workstream_Index}-${Component_Index}-${Output_Index}` ? undefined : prev
                                    )
                                  }
                                >
                                  <div
                                    className="p1"
                                    style={{ color: "#15335E", borderLeft: `5px solid ${Workstream.colour}` }}
                                    onClick={() => {
                                      Set_Selected_Workstream(Workstream_Index);
                                      const ws: number[][] = Roadmap_Content.Workstreams.map(() => []);
                                      ws[Workstream_Index] = [Component_Index];
                                      Set_Components_Expanded(ws);
                                      Set_Workstream_Expanded(true);
                                    }}
                                  >
                                    {Output.title}
                                  </div>
                                </td>
                                <td className="Empty"></td>
                                <td
                                  title={Output.end_date && Output.end_date <= 2025 ? "Output is expected between 2023 and 2025" : ""}
                                  className={`Target ${Hovered_Output === `${Workstream_Index}-${Component_Index}-${Output_Index}` && Output.end_date && Output.end_date <= 2025 ? "Hovered" : ""}`}
                                >
                                  {Output.end_date && Output.end_date <= 2025 ? (
                                    <div className="Diamond" style={{ backgroundColor: Workstream.colour }} />
                                  ) : null}
                                </td>
                                {Output.end_date && Output.end_date > 2025 ? (
                                  <td
                                    title={Output.end_date <= 2030 ? "Output is expected between 2026 and 2030" : ""}
                                    className={`Target ${Hovered_Output === `${Workstream_Index}-${Component_Index}-${Output_Index}` && Output.end_date <= 2030 ? "Hovered" : ""}`}
                                  >
                                    {Output.end_date <= 2030 ? (
                                      <div className="Diamond" style={{ backgroundColor: Workstream.colour }} />
                                    ) : null}
                                  </td>
                                ) : null}
                                {Output.end_date && Output.end_date > 2030 ? (
                                  <td
                                    title={Output.end_date <= 2035 ? "Output is expected between 2031 and 2035" : ""}
                                    className={`Target ${Hovered_Output === `${Workstream_Index}-${Component_Index}-${Output_Index}` ? "Hovered" : ""}`}
                                  >
                                    {Output.end_date <= 2035 ? (
                                      <div className="Diamond" style={{ backgroundColor: Workstream.colour }} />
                                    ) : null}
                                  </td>
                                ) : null}
                              </tr>

                              {Output_Index === Component.outputs.length - 1 ? (
                                <tr
                                  className="Output_Row"
                                  style={{ display: compExpanded ? "table-row" : "none" }}
                                >
                                  <td></td>
                                </tr>
                              ) : null}
                            </React.Fragment>
                          ))
                        : null}
                    </React.Fragment>
                  );
                });
              })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapFull;
