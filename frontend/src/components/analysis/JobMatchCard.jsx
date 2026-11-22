
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
    <article className="
      group flex w-full min-w-0 flex-col
      gap-3 rounded-xl border border-[#E5EDE2]
      bg-white p-3
      transition-all duration-200
      hover:border-[#A8D99B] hover:shadow-md
      sm:gap-4 sm:p-4
      lg:flex-row lg:items-center
    ">
      {/* Company Logo + Job Information */}
      <div className="
        flex min-w-0 flex-1 items-start gap-3
        sm:gap-4
      ">
        {/* Company Logo */}
        <div
          className={`
            flex h-11 w-11 shrink-0
            items-center justify-center
            rounded-xl text-sm font-extrabold
            sm:h-12 sm:w-12 sm:text-base
            ${color}
          `}
        >
          {job.logo}
        </div>

        {/* Job Information */}
        <div className="min-w-0 flex-1">
          <h3 className="
            break-words text-sm font-extrabold
            leading-snug text-cview-dark
            transition-colors
            group-hover:text-cview-primary
            sm:text-base
          ">
            {job.title}
          </h3>

          <p className="
            mt-1 break-words text-xs
            leading-relaxed text-gray-500
            sm:text-sm
          ">
            {job.company}
            <span className="mx-1 text-gray-300">·</span>
            {job.location}
          </p>

          {/* Skills Tags */}
          <div className="
            mt-2 flex min-w-0 flex-wrap
            gap-1.5
          ">
            {job.tags.map((tag) => (
              <span
                key={tag}
                className="
                  max-w-full break-words
                  rounded-md bg-[#F0F7ED]
                  px-2 py-1 text-[10px]
                  font-medium leading-relaxed
                  text-[#52724D]
                "
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Salary */}
          <p className="
            mt-2 break-words text-xs
            font-semibold text-cview-primary
            sm:text-sm
          ">
            {job.salary}
          </p>
        </div>
      </div>

      {/* Match Score + Action */}
      <div className="
        flex w-full shrink-0
        items-center justify-between
        gap-3 border-t border-gray-100
        pt-3
        sm:pt-3
        lg:w-auto lg:min-w-[125px]
        lg:flex-col lg:items-end
        lg:justify-center lg:border-0
        lg:pt-0
      ">
        {/* Match Score */}
        <div className="min-w-0 text-left lg:text-right">
          <span className="
            block text-[10px]
            text-gray-500 sm:text-xs
          ">
            Mức độ phù hợp
          </span>

          <span className="
            text-base font-extrabold
            text-cview-primary sm:text-lg
          ">
            {job.match}%
          </span>
        </div>

        {/* View Details Button */}
        <button
          type="button"
          onClick={() => onViewDetails?.(job)}
          className="
            flex min-h-10 shrink-0
            items-center justify-center
            rounded-lg bg-cview-primary
            px-4 py-2 text-xs font-bold
            text-white transition-colors
            hover:bg-cview-green
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-cview-green
            focus-visible:ring-offset-2
            sm:px-5
          "
        >
          Xem chi tiết
        </button>
      </div>
    </article>
  )
}
