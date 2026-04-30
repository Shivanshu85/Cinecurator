export default function SkeletonCard({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="group">
          <div className="relative aspect-[2/3] overflow-hidden rounded-xl mb-3 bg-surface-container-high animate-pulse" />
          <div className="h-3.5 bg-surface-container-high rounded animate-pulse mb-1.5 w-4/5" />
          <div className="h-2.5 bg-surface-container rounded animate-pulse w-2/3 opacity-60" />
        </div>
      ))}
    </>
  );
}

export function SkeletonFeatured() {
  return (
    <div className="bg-[#131313] py-16">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-5">
          <div className="aspect-[2/3] rounded-2xl bg-surface-container-high animate-pulse" />
        </div>
        <div className="lg:col-span-7 pt-4 space-y-6">
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-7 w-20 bg-surface-container-high rounded-full animate-pulse" />
            ))}
          </div>
          <div className="h-12 bg-surface-container-high rounded animate-pulse w-3/4" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`h-4 bg-surface-container rounded animate-pulse ${i === 4 ? "w-2/3" : "w-full"}`} />
            ))}
          </div>
          <div className="flex gap-4">
            <div className="h-14 flex-1 bg-surface-container-high rounded-lg animate-pulse" />
            <div className="h-14 flex-1 bg-surface-container rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonGenreCard({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden">
          <div className="aspect-video bg-surface-container-high animate-pulse rounded-2xl mb-4" />
          <div className="p-4 space-y-2">
            <div className="h-5 bg-surface-container-high rounded animate-pulse w-2/3" />
            <div className="h-3 bg-surface-container rounded animate-pulse w-full" />
            <div className="h-3 bg-surface-container rounded animate-pulse w-4/5" />
          </div>
        </div>
      ))}
    </>
  );
}
