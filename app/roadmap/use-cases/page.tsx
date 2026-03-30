"use client";

import React, { useEffect, useRef } from "react";
import UseCaseContent from "@/data/roadmap/UseCaseContent.json";

export default function UseCasesPage() {
  const focusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    focusRef.current?.focus();
  }, []);

  const data = UseCaseContent as { Use_Cases: { title: string; body: string[] }[] };

  return (
    <div ref={focusRef} tabIndex={-1} className="Use_Cases Bordered_Content">
      <h1>Use Cases</h1>
      <p className="Use_Case_Intro p1">
        To bring the Vision and Roadmap to life, a selection of companies were engaged to develop
        digital twin use cases for transport, with input from industry. These do not cover all the
        possible use cases for digital twins in transport, but provide a selection of tangible
        examples of use cases which could support improvements for the user, reductions in
        environmental impacts, and growth of the UK economy. There are also a selection of use cases
        linked here from the{" "}
        <a href="https://digitaltwinhub.co.uk">Digital Twin Hub</a>. The Digital Twin Hub, based at
        the Connected Places Catapult, is a network for finding partners and collaborators, for
        learning and sharing experiences; for driving innovation, developing expertise and advancing
        the state of the art for digital twins.
      </p>
      <div className="Use_Case_Container">
        {data.Use_Cases.map((uc, i) => (
          <div key={i} tabIndex={0} className="Use_Case">
            <h1 className="h4">{uc.title}</h1>
            {uc.body.map((paragraph, pi) => (
              <p key={pi} className="p1">{paragraph}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
