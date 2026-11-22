
import { useMemo, useState } from 'react'
import JobMatchCard from './JobMatchCard'

const sampleJobs = [
  {
    id: 1,
    logo: 'A',
    title: 'AI Engineer',
    company: 'Công ty Công nghệ ABC',
    location: 'Hà Nội',
    salary: '15–25 triệu/tháng',
    match: 95,
    category: 'Technology',
    tags: ['AI', 'Python', 'Machine Learning'],
  },
  {
    id: 2,
    logo: 'DS',
    title: 'Data Scientist',
    company: 'Công ty Công nghệ XYZ',
    location: 'Hà Nội',
    salary: '18–25 triệu/tháng',
    match: 92,
    category: 'Technology',
    tags: ['Python', 'SQL', 'Data Analysis'],
  },
  {
    id: 3,
    logo: 'M',
    title: 'Machine Learning Engineer',
    company: 'Future Tech',
    location: 'TP. Hồ Chí Minh',
    salary: '20–30 triệu/tháng',
    match: 88,
    category: 'Technology',
    tags: ['Machine Learning', 'Deep Learning'],
  },
  {
    id: 4,
    logo: 'AI',
    title: 'AI Researcher',
    company: 'Innovation Lab',
    location: 'Hà Nội',
    salary: '15–22 triệu/tháng',
    match: 85,
    category: 'Research',
    tags: ['AI Research', 'Python', 'Statistics'],
  },
  {
    id: 5,
    logo: 'DE',
    title: 'Data Engineer',
    company: 'NextGen Solutions',
    location: 'Hybrid',
    salary: '16–24 triệu/tháng',
    match: 82,
    category: 'Technology',
    tags: ['SQL', 'ETL', 'Cloud'],
  },
  {
    id: 6,
    logo: 'DA',
    title: 'Data Analyst',
    company: 'Growth Analytics',
    location: 'Hà Nội',
    salary: '12–18 triệu/tháng',
    match: 78,
    category: 'Business',
    tags: ['Excel', 'SQL', 'Power BI'],
  },
]

const categories = [
  'Tất cả',
  'Technology',
  'Research',
  'Business',
]

export default function MatchingJobs({
  jobs = sampleJobs,
  onViewDetails,
}) {
  const [activeCategory, setActiveCategory] = useState('Tất cả')

  const filteredJobs = useMemo(() => {
    if (activeCategory === 'Tất cả') return jobs

    return jobs.filter((job) => job.category === activeCategory)
  }, [jobs, activeCategory])

  return (
    <section className="
      mt-5 w-full min-w-0 overflow-hidden
      rounded-2xl border border-[#E5EDE2]
      bg-white/95 p-3 shadow-sm
      sm:mt-8 sm:p-5
      lg:p-6
    ">
      {/* Section Heading */}
      <div className="
        flex min-w-0 flex-col gap-2
        sm:flex-row sm:items-end sm:justify-between
        sm:gap-4
      ">
        <div className="min-w-0">
          <h2 className="
            break-words text-lg font-extrabold
            leading-snug text-cview-dark
            sm:text-xl lg:text-2xl
          ">
            Công việc{' '}
            <span className="text-cview-green">
              phù hợp với bạn
            </span>
          </h2>

          <p className="
            mt-1 max-w-2xl text-xs
            leading-relaxed text-gray-500
            sm:text-sm
          ">
            Dựa trên kỹ năng, kinh nghiệm và mức độ phù hợp trong CV của bạn.
          </p>
        </div>

        <span className="
          inline-flex w-fit shrink-0
          items-center rounded-full
          bg-cview-mint px-3 py-1.5
          text-[11px] font-semibold
          text-cview-primary
          sm:text-xs
        ">
          {filteredJobs.length} công việc được đề xuất
        </span>
      </div>

      {/* Category Filters */}
      <div
        className="
          mt-4 flex w-full min-w-0
          gap-2 overflow-x-auto overscroll-x-contain
          pb-2
        "
        aria-label="Lọc công việc theo danh mục"
      >
        {categories.map((category) => {
          const isActive = activeCategory === category

          return (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              aria-pressed={isActive}
              className={`
                min-h-9 shrink-0 whitespace-nowrap
                rounded-full border px-3 py-2
                text-[11px] font-semibold
                transition-colors duration-200
                sm:px-4 sm:text-xs
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-cview-green
                focus-visible:ring-offset-2
                ${
                  isActive
                    ? 'border-cview-green bg-cview-green text-white'
                    : 'border-[#DCE8D8] bg-white text-gray-600 hover:border-cview-green hover:text-cview-primary'
                }
              `}
            >
              {category}
            </button>
          )
        })}
      </div>

      {/* Job List */}
      <div className="
        mt-3 flex min-w-0 flex-col gap-3
        sm:mt-4 sm:gap-4
      ">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <div key={job.id} className="w-full min-w-0">
              <JobMatchCard
                job={job}
                onViewDetails={onViewDetails}
              />
            </div>
          ))
        ) : (
          <div className="
            rounded-xl bg-gray-50
            px-4 py-8 text-center
            sm:py-10
          ">
            <p className="
              text-xs font-semibold
              leading-relaxed text-gray-600
              sm:text-sm
            ">
              Chưa có công việc phù hợp trong danh mục này.
            </p>

            <button
              type="button"
              onClick={() => setActiveCategory('Tất cả')}
              className="
                mt-3 text-xs font-bold
                text-cview-primary hover:underline
              "
            >
              Xem tất cả công việc
            </button>
          </div>
        )}
      </div>

      {/* Footer Note */}
      <p className="
        mt-4 border-t border-gray-100
        pt-3 text-[10px] leading-relaxed
        text-gray-400 sm:mt-5
      ">
        * Danh sách và tỷ lệ phù hợp hiện tại là dữ liệu minh họa phục vụ kiểm thử giao diện.
      </p>
    </section>
  )
}
