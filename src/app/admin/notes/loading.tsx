import AdminShell from "@/components/admin/AdminShell";
import { SkeletonBlock } from "@/components/ui/Skeleton";

export default function NotesLoading() {
  return (
    <AdminShell>
      <div className="space-y-6 pb-24 lg:pb-8 animate-pulse">
        <div className="mb-6 mb-8 mt-2">
          <SkeletonBlock className="h-8 w-64 mb-2" />
          <SkeletonBlock className="h-5 w-96 max-w-full" />
        </div>
        {/* Summary Panel Skeleton */}
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
             <SkeletonBlock className="h-10 w-48 rounded-lg" />
             <SkeletonBlock className="h-10 w-32 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
             <SkeletonBlock className="h-[120px] w-full rounded-2xl" />
             <SkeletonBlock className="h-[120px] w-full rounded-2xl" />
             <SkeletonBlock className="h-[120px] w-full rounded-2xl" />
             <SkeletonBlock className="h-[120px] w-full rounded-2xl" />
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Form Skeleton */}
          <div className="hidden lg:block lg:w-[400px] xl:w-[450px] shrink-0">
             <SkeletonBlock className="h-[600px] w-full rounded-2xl" />
          </div>

          {/* List Skeleton */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-4">
               <SkeletonBlock className="h-6 w-32 rounded" />
               <SkeletonBlock className="h-10 w-40 rounded-lg" />
            </div>
            <div className="space-y-3">
               {[1, 2, 3, 4, 5].map(i => (
                 <SkeletonBlock key={i} className="h-[140px] w-full rounded-xl" />
               ))}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
