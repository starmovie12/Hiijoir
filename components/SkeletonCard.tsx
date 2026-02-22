'use client';

// Shimmer placeholder for movie poster while loading
export const SkeletonCard = () => (
  <div className="w-full">
    <div className="w-full rounded-2xl shimmer bg-white/5" style={{ aspectRatio: '2/3' }} />
    <div className="mt-2 space-y-1.5">
      <div className="h-3 rounded-full shimmer bg-white/5 w-3/4" />
      <div className="h-2.5 rounded-full shimmer bg-white/5 w-1/2" />
    </div>
  </div>
);

// Full row skeleton: title + 6 cards
export const SkeletonRow = () => (
  <div className="py-4 md:py-8 px-4 md:px-8 lg:px-12">
    <div className="h-7 w-56 rounded-xl shimmer bg-white/5 mb-4" />
    <div className="flex gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="min-w-[28.5%] md:min-w-[20%] lg:min-w-[16.66%] flex-shrink-0">
          <SkeletonCard />
        </div>
      ))}
    </div>
  </div>
);
