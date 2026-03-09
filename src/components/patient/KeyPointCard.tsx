interface KeyPointCardProps {
  points: string[];
  accentColor?: string;
}

export default function KeyPointCard({ points, accentColor = "#0ea5e9" }: KeyPointCardProps) {
  if (points.length === 0) return null;

  return (
    <div className="mt-5 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
      <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-slate-500">
        Key Points
      </p>
      <ul className="space-y-3">
        {points.map((point, i) => (
          <li key={i} className="flex items-start gap-3">
            {/* Decorative dot — dynamic accent color via inline style */}
            <span
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: accentColor }}
              aria-hidden="true"
            />
            <span className="text-sm leading-relaxed text-slate-400">{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
