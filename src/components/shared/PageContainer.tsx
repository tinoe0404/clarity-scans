import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}

export default function PageContainer({ children, className, padded = true }: PageContainerProps) {
  return <div className={cn(padded && "px-6 pb-8", "flex-1", className)}>{children}</div>;
}
