"use client";

import React, { useEffect, useRef } from "react";

export default function AccessibilityPage() {
  const focusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    focusRef.current?.focus();
  }, []);

  return (
    <div ref={focusRef} tabIndex={-1} className="Accessiblilty_Statement Bordered_Content">
      <h1 className="Title">Accessibility of our website</h1>
      <p>This accessibility statement applies to trib-roadmap.azurewebsites.net</p>
      <p>
        This website is run by CPC, commissioned by Transport Research and Innovation Board (TRIB).
        We want as many people as possible to be able to use this website. For example, that means
        you should be able to:
      </p>
      <ul>
        <li>navigate most of the website using just a keyboard</li>
        <li>navigate most of the website using speech recognition software</li>
        <li>listen to most of the website using a screen reader</li>
      </ul>
      <p>We&rsquo;ve also made the website text as simple as possible to understand.</p>
      <p>
        Visit{" "}
        <a href="https://mcmw.abilitynet.org.uk/">Ability.net&rsquo;s My Computer My Way</a> for
        more information and advice on how to make your device easier to use.
      </p>
      <div className="Statement">
        <div>
          <div>
            <h2>Compliance status</h2>
            <p>
              This website is fully compliant with the Web Content Accessibility Guidelines version
              2.1 AA standard.
            </p>
          </div>
          <div>
            <h3>Content that is not within the scope of the accessibility regulations</h3>
            <ul>
              <li>some links to content will be from third party providers not under our control.</li>
              <li>the roadmap has been designed to be navigable with using just a keyboard and screen readers.</li>
              <li>some PDF documents may not be fully accessible to screen reader software. The accessibility regulations do not require us to fix PDFs or other documents published before 23 September 2018 if they&rsquo;re not essential to providing our services.</li>
              <li>Any new PDFs or Word documents we publish will meet accessibility standards.</li>
            </ul>
          </div>
        </div>
        <div>
          <div>
            <h2>Preparation of this accessibility statement</h2>
            <p>This statement was prepared on 24th April 2023.</p>
            <p>This website was last tested on 24th April 2023. The test was carried out by the website delivery team.</p>
          </div>
          <div>
            <h2>Feedback and contact information</h2>
            <p>
              We&rsquo;re always looking to improve the accessibility of this website. You can
              contact us at{" "}
              <a href="mailto:digitaltwins@dft.gov.uk">digitaltwins@dft.gov.uk</a>
            </p>
          </div>
          <div>
            <h2>Enforcement procedure</h2>
            <p>
              The Equality and Human Rights Commission (EHRC) is responsible for enforcing the
              Public Sector Bodies (Websites and Mobile Applications) (No. 2) Accessibility
              Regulations 2018 (the &lsquo;accessibility regulations&rsquo;).
            </p>
            <p>
              The Equality Advisory and Support Service (EASS) helpline advises and assists
              individuals on issues relating to equality and human rights, across England, Scotland
              and Wales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
