import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { buttonStyles, cardStyles, screenContainerStyles } from "@/lib/styles";

export default function NotFoundPage() {
  return (
    <main id="main-content" tabIndex={-1} className={screenContainerStyles() + " outline-none"}>
      <div className="flex h-full min-h-[60vh] flex-1 flex-col items-center justify-center text-center">
        <div className={cardStyles("default") + " mx-auto w-full max-w-sm space-y-6 p-8"}>
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-surface-border bg-surface-elevated">
            <span className="font-display text-3xl font-bold text-gray-400">404</span>
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-xl font-bold text-white">Page Not Found</h1>
            <p className="text-sm text-gray-400">
              The page you are looking for does not exist or has been moved.
            </p>
          </div>

          <Link href="/" className={buttonStyles("secondary", "md")}>
            <Icon name="ArrowLeft" size="sm" className="mr-2" />
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
