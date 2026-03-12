import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface FeedbackQuestionCardProps {
  question: string;
  stepIndex: number; // Used natively as React `key` bindings externally forcing fresh mounting transitions gracefully
  children: ReactNode;
}

export default function FeedbackQuestionCard({ 
  question, 
  _stepIndex, 
  children 
}: FeedbackQuestionCardProps & { _stepIndex?: number }) {
  const reducedMotion = useReducedMotion();

  return (
    <div 
      className={cn(
        "flex flex-col w-full h-full",
        !reducedMotion ? "animate-slideInRight" : "animate-fadeIn"
      )}
    >
      <div 
        className="w-full text-center px-4 mb-10"
        aria-live="polite"
      >
        <h2 className="font-display font-bold text-3xl md:text-4xl text-white leading-tight">
          {question}
        </h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start w-full px-2">
        {children}
      </div>
    </div>
  );
}
