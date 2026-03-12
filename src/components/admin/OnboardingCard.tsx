import Link from "next/link";
import { CheckCircle2, Circle, ExternalLink, PlaySquare, Settings, ShieldCheck, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingCardProps {
  hasVideos: boolean;
  hasFeedback: boolean;
  hasNotes: boolean;
}

export default function OnboardingCard({ hasVideos, hasFeedback, hasNotes }: OnboardingCardProps) {
  const steps = [
    {
      id: "videos",
      title: "Upload educational videos",
      description: "Upload localized CT scan videos for each module.",
      href: "/admin/videos",
      icon: PlaySquare,
      isComplete: hasVideos,
      external: false,
    },
    {
      id: "password",
      title: "Set a strong admin password",
      description: "Ensure the dashboard is securely protected via environment variables.",
      href: "https://clarityscans.app/docs/security",
      icon: ShieldCheck,
      isComplete: true, // Assumed complete if they are logged in viewing this
      external: true,
    },
    {
      id: "patient",
      title: "Test the app as a patient",
      description: "Run through a mock session and submit feedback.",
      href: "/",
      icon: ExternalLink,
      isComplete: hasFeedback,
      external: true,
    },
    {
      id: "notes",
      title: "Record your first scan note",
      description: "Add a radiographer note detailing patient compliance.",
      href: "/admin/notes",
      icon: Stethoscope,
      isComplete: hasNotes,
      external: false,
    },
  ];

  const completedCount = steps.filter((s) => s.isComplete).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="rounded-2xl border border-brand-500/20 bg-brand-500/5 p-6 shadow-sm overflow-hidden relative">
      <div className="absolute top-0 right-0 p-32 bg-brand-500/10 blur-[100px] rounded-full -z-10 pointer-events-none" />
      
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-2">Welcome to ClarityScans</h2>
        <p className="text-slate-400 max-w-2xl">
          Your installation is fresh. Follow these initial steps to configure the system and prepare it for the scanner room.
        </p>
      </div>

      <div className="mb-6 bg-surface-base/50 rounded-xl p-4 border border-surface-border">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-slate-300">Setup Progress</span>
          <span className="text-brand-400 font-bold">{progressPercent}%</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-brand-500 transition-all duration-1000 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {steps.map((step) => {
          const Comp = step.external ? "a" : Link;
          const targetProps = step.external ? { target: "_blank", rel: "noopener noreferrer" } : {};

          return (
            <Comp
              key={step.id}
              href={step.href}
              {...targetProps}
              className={cn(
                "flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 group text-left",
                step.isComplete 
                  ? "bg-surface-elevated border-surface-border opacity-70 hover:opacity-100" 
                  : "bg-surface-elevated border-brand-500/30 hover:border-brand-500 hover:bg-brand-500/10 hover:-translate-y-0.5"
              )}
            >
              <div className="shrink-0 mt-1">
                {step.isComplete ? (
                  <CheckCircle2 className="h-5 w-5 text-medical-green" />
                ) : (
                  <Circle className="h-5 w-5 text-slate-500 group-hover:text-brand-400 transition-colors" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className={cn(
                    "font-medium transition-colors",
                    step.isComplete ? "text-slate-300" : "text-white group-hover:text-brand-400"
                  )}>
                    {step.title}
                  </h3>
                  {step.external && <Settings className="h-3 w-3 text-slate-500" />}
                </div>
                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </Comp>
          )
        })}
      </div>
    </div>
  );
}
