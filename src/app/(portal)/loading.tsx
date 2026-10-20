export default function PortalLoading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="h-2.5 w-28 animate-pulse rounded bg-surface-3" />
          <div className="h-7 w-64 animate-pulse rounded-md bg-surface-3" />
          <div className="h-3 w-80 animate-pulse rounded bg-surface-3" />
        </div>
        <div className="h-9 w-32 animate-pulse rounded-lg bg-surface-3" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-4">
            <div className="h-2.5 w-20 animate-pulse rounded bg-surface-3" />
            <div className="mt-3 h-8 w-16 animate-pulse rounded bg-surface-3" />
            <div className="mt-3 h-3 w-24 animate-pulse rounded bg-surface-3" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-12">
        <div className="card xl:col-span-8">
          <div className="p-5">
            <div className="h-3 w-32 animate-pulse rounded bg-surface-3" />
            <div className="mt-2 h-2.5 w-56 animate-pulse rounded bg-surface-3" />
            <div className="mt-6 h-[220px] animate-pulse rounded-xl bg-surface-2" />
          </div>
        </div>
        <div className="card xl:col-span-4">
          <div className="p-5">
            <div className="h-3 w-24 animate-pulse rounded bg-surface-3" />
            <div className="mx-auto mt-6 h-36 w-36 animate-pulse rounded-full bg-surface-2" />
            <div className="mt-6 space-y-2">
              <div className="h-2.5 w-full animate-pulse rounded bg-surface-3" />
              <div className="h-2.5 w-4/5 animate-pulse rounded bg-surface-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
