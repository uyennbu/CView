
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

export default function MatchingJobs({ jobs = sampleJobs, onViewDetails }) {
  const [activeCategory, setActiveCategory] = useState('Tất cả')

  const filteredJobs = useMemo(() => {
    if (activeCategory === 'Tất cả') return jobs

    return jobs.filter((job) => job.category === activeCategory)
  }, [jobs, activeCategory])

  return (
    <section className="mt-6 w-full rounded-2xl border border-[#E5EDE2] bg-white/95 p-4 shadow-sm sm:mt-8 sm:p-6">

      {/* Section heading */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-cview-dark sm:text-2xl">
            Công việc <span className="text-cview-green">phù hợp với bạn</span>
          </h2>

          <p className="mt-1 text-xs leading-relaxed text-gray-500 sm:text-sm">
            Dựa trên kỹ năng, kinh nghiệm và mức độ phù hợp trong CV của bạn.
          </p>
        </div>

        <span className="text-xs font-semibold text-cview-primary">
          {filteredJobs.length} công việc được đề xuất
        </span>
      </div>

      {/* Category filters */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => {
          const isActive = activeCategory === category

          return (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                isActive
                  ? 'border-cview-green bg-cview-green text-white'
                  : 'border-[#DCE8D8] bg-white text-gray-600 hover:border-cview-green hover:text-cview-primary'
              }`}
            >
              {category}
            </button>
          )
        })}
      </div>

      {/* Job list */}
      <div className="mt-3 space-y-3">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <JobMatchCard
              key={job.id}
              job={job}
              onViewDetails={onViewDetails}
            />
          ))
        ) : (
          <div className="rounded-xl bg-gray-50 px-4 py-10 text-center">
            <p className="text-sm font-semibold text-gray-600">
              Chưa có công việc phù hợp trong danh mục này.
            </p>
            <button
              type="button"
              onClick={() => setActiveCategory('Tất cả')}
              className="mt-3 text-xs font-bold text-cview-primary hover:underline"
            >
              Xem tất cả công việc
            </button>
          </div>
        )}
      </div>

      {/* Footer note */}
      <p className="mt-4 text-[10px] leading-relaxed text-gray-400">
        * Danh sách và tỷ lệ phù hợp hiện tại là dữ liệu minh họa phục vụ kiểm thử giao diện.
      </p>
    </section>
  )
}
