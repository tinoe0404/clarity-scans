import Link from "next/link";

export const metadata = {
  title: "Accessibility Statement — ClarityScans",
  description: "Accessibility commitment and compliance information for ClarityScans.",
};

export default function AccessibilityPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto max-w-3xl px-6 py-12 text-white outline-none"
    >
      <h1 className="mb-8 font-display text-3xl font-bold">Accessibility Statement</h1>

      <section className="space-y-6 text-slate-300 leading-relaxed">
        <div>
          <h2 className="mb-2 text-xl font-bold text-white">Our Commitment</h2>
          <p>
            ClarityScans is committed to ensuring digital accessibility for all users,
            including patients who may be elderly, visually impaired, anxious, or
            unfamiliar with technology, and radiographers who may use assistive technology
            in the workplace.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-xl font-bold text-white">Conformance Standard</h2>
          <p>
            This application targets conformance with the{" "}
            <strong className="text-white">
              Web Content Accessibility Guidelines (WCAG) 2.1 Level AA
            </strong>
            . We continually review and improve the application to meet or exceed these
            standards.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-xl font-bold text-white">Last Reviewed</h2>
          <p>
            The most recent accessibility audit was conducted on{" "}
            <strong className="text-white">March 2026</strong>.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-xl font-bold text-white">Known Limitations</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong className="text-white">Video captions:</strong> Educational videos
              do not currently include embedded closed captions. Audio content is
              supplemented by the Key Points section displayed alongside each video,
              providing a text-based alternative for all spoken information.
            </li>
            <li>
              <strong className="text-white">Chart visualisations:</strong> Interactive
              chart graphics on the analytics dashboard are not directly keyboard
              navigable. Screen-reader-accessible data tables are provided as alternatives
              for all chart data.
            </li>
            <li>
              <strong className="text-white">Third-party video content:</strong> Videos
              uploaded by radiographers may not have been authored with accessibility in
              mind. ClarityScans provides the surrounding context (titles, descriptions,
              key points) in accessible formats.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-2 text-xl font-bold text-white">Reporting Issues</h2>
          <p>
            If you encounter an accessibility barrier while using ClarityScans, please
            report it to the radiographer on duty or contact the HIT (Health Information
            Technology) department at your facility. We are committed to addressing
            reported issues promptly.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-xl font-bold text-white">Technical Measures</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>Skip-to-content navigation links on all pages</li>
            <li>Full keyboard navigation support across all screens</li>
            <li>ARIA landmarks, live regions, and roles for screen readers</li>
            <li>Minimum 44×44px touch targets for patient-facing elements</li>
            <li>Respect for <code className="text-brand-400">prefers-reduced-motion</code> system setting</li>
            <li>WCAG AA colour contrast ratios across all text and UI elements</li>
            <li>Correct heading hierarchy and semantic HTML structure</li>
            <li>Language attributes set per locale for multilingual content</li>
          </ul>
        </div>
      </section>

      <div className="mt-12 border-t border-surface-border pt-6">
        <Link
          href="/"
          className="text-brand-400 underline underline-offset-4 hover:text-brand-300"
        >
          ← Return to ClarityScans
        </Link>
      </div>
    </main>
  );
}
