
const companyColors = [
  'bg-emerald-100 text-emerald-700',
  'bg-blue-100 text-blue-700',
  'bg-rose-100 text-rose-600',
  'bg-violet-100 text-violet-700',
  'bg-orange-100 text-orange-700',
]

export default function JobMatchCard({ job, onViewDetails }) {
  const color = companyColors[job.id % companyColors.length]

  return (
    <article className="group flex flex-col gap-3 rounded-xl border border-[#E5EDE2] bg-white p-3 transition-all duration-200 hover:border-[#A8D99B] hover:shadow-md sm:flex-row sm:items-center sm:gap-4 sm:p-4">

      {/* Company logo */}
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${color}`}
      >
        {job.logo}
      </div>

      {/* Job information */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-extrabold text-cview-dark transition-colors group-hover:text-cview-primary sm:text-base">
          {job.title}
        </h3>

        <p className="mt-1 text-xs text-gray-500">
          {job.company} · {job.location}
        </p>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-[#F0F7ED] px-2 py-1 text-[10px] font-medium text-[#52724D]"
            >
              {tag}
            </span>
          ))}
        </div>

        <p className="mt-2 text-xs font-semibold text-cview-primary">
          {job.salary}
        </p>
      </div>

      {/* Match score and action */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-100 pt-3 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
        <div className="text-left sm:text-right">
          <span className="block text-[10px] text-gray-500">
            Mức độ phù hợp
          </span>

          <span className="text-base font-extrabold text-cview-primary">
            {job.match}%
          </span>
        </div>

        <button
          type="button"
          onClick={() => onViewDetails?.(job)}
          className="rounded-lg bg-cview-primary px-4 py-2 text-xs font-bold text-white transition hover:bg-cview-green"
        >
          Xem chi tiết
        </button>
      </div>
    </article>
  )
}
