
import { useMemo, useState } from 'react'

const sampleJobs = [
  {
    id: 1,
    title: 'Digital Marketing Executive',
    company: 'Công ty Cổ phần FPT Software',
    city: 'Hà Nội',
    domain: 'Marketing',
    employmentType: 'FULL_TIME',
    workMode: 'ON_SITE',
    salary: 20000000,
    salaryText: '15 - 25 triệu',
    tags: ['Digital Marketing', 'Content', 'Social Media'],
  },
  {
    id: 2,
    title: 'Content Marketing Intern',
    company: 'Công ty Truyền thông ABC',
    city: 'TP. Hồ Chí Minh',
    domain: 'Truyền thông',
    employmentType: 'PART_TIME',
    workMode: 'REMOTE',
    salary: 8000000,
    salaryText: '5 - 10 triệu',
    tags: ['Content', 'Writing', 'Social Media'],
  },
  {
    id: 3,
    title: 'Marketing Specialist',
    company: 'Công ty TNHH XYZ',
    city: 'Hà Nội',
    domain: 'Marketing',
    employmentType: 'FULL_TIME',
    workMode: 'ON_SITE',
    salary: 15000000,
    salaryText: '10 - 15 triệu',
    tags: ['Marketing', 'Planning', 'Branding'],
  },
  {
    id: 4,
    title: 'Graphic Designer',
    company: 'Creative Studio',
    city: 'Đà Nẵng',
    domain: 'Thiết kế',
    employmentType: 'FULL_TIME',
    workMode: 'REMOTE',
    salary: 12000000,
    salaryText: '10 - 15 triệu',
    tags: ['Design', 'Photoshop', 'Illustrator'],
  },
]

const initialFilters = {
  keyword: '',
  city: '',
  domain: '',
  employmentType: '',
  workMode: '',
  salary: '',
}

export default function JobsPage() {
  const [filters, setFilters] = useState(initialFilters)

  const updateFilter = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const filteredJobs = useMemo(() => {
    return sampleJobs.filter((job) => {
      const keyword = filters.keyword.toLowerCase().trim()

      const matchesKeyword =
        !keyword ||
        job.title.toLowerCase().includes(keyword) ||
        job.company.toLowerCase().includes(keyword) ||
        job.tags.some((tag) => tag.toLowerCase().includes(keyword))

      const matchesCity = !filters.city || job.city === filters.city
      const matchesDomain = !filters.domain || job.domain === filters.domain

      const matchesEmployment =
        !filters.employmentType ||
        job.employmentType === filters.employmentType

      const matchesWorkMode =
        !filters.workMode || job.workMode === filters.workMode

      const matchesSalary =
        !filters.salary ||
        (filters.salary === 'under10' && job.salary < 10000000) ||
        (filters.salary === '10to15' &&
          job.salary >= 10000000 && job.salary <= 15000000) ||
        (filters.salary === '15to20' &&
          job.salary > 15000000 && job.salary <= 20000000) ||
        (filters.salary === 'over20' && job.salary > 20000000)

      return (
        matchesKeyword &&
        matchesCity &&
        matchesDomain &&
        matchesEmployment &&
        matchesWorkMode &&
        matchesSalary
      )
    })
  }, [filters])

  const clearFilters = () => setFilters(initialFilters)

  const selectClass =
    'w-full rounded-xl border border-[#4CAF50] bg-white px-3 py-3 text-sm text-[#26352B] outline-none focus:ring-2 focus:ring-[#4CAF50]/20'

  const quickChip = (active) =>
    `rounded-full px-4 py-2 text-xs font-semibold transition ${
      active
        ? 'bg-[#43A047] text-white'
        : 'bg-white/80 text-[#26352B] hover:bg-[#E6FADD]'
    }`

  return (
    <main className="mx-auto min-h-[70vh] max-w-[1440px] px-5 py-10 lg:px-14">
      {/* Tiêu đề */}
      <section className="mb-7">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#E6FADD] px-3 py-1 text-sm font-semibold text-[#1E5631]">
          <span>✦</span>
          Việc làm
        </div>

        <h1 className="text-3xl font-extrabold text-[#1A241E] md:text-4xl">
          TÌM CÔNG VIỆC{' '}
          <span className="text-[#43A047]">PHÙ HỢP VỚI BẠN</span>
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Khám phá cơ hội việc làm từ hàng nghìn doanh nghiệp uy tín.
        </p>
      </section>

      {/* Thanh tìm kiếm và bộ lọc */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {/* Từ khóa */}
          <div className="flex items-center gap-2 rounded-xl border border-[#4CAF50] bg-white px-4">
            <span className="text-lg">⌕</span>
            <input
              type="text"
              value={filters.keyword}
              onChange={(e) => updateFilter('keyword', e.target.value)}
              placeholder="Vị trí, kỹ năng hoặc tên công ty"
              className="w-full bg-transparent py-3 text-sm outline-none"
            />
          </div>

          {/* Địa điểm */}
          <select
            className={selectClass}
            value={filters.city}
            onChange={(e) => updateFilter('city', e.target.value)}
          >
            <option value="">Địa điểm</option>
            <option value="Hà Nội">Hà Nội</option>
            <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
            <option value="Đà Nẵng">Đà Nẵng</option>
            <option value="Hải Phòng">Hải Phòng</option>
          </select>

          {/* Lĩnh vực */}
          <select
            className={selectClass}
            value={filters.domain}
            onChange={(e) => updateFilter('domain', e.target.value)}
          >
            <option value="">Lĩnh vực</option>
            <option value="Marketing">Marketing</option>
            <option value="Truyền thông">Truyền thông</option>
            <option value="Thiết kế">Thiết kế</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* Loại công việc */}
          <select
            className={selectClass}
            value={filters.employmentType}
            onChange={(e) =>
              updateFilter('employmentType', e.target.value)
            }
          >
            <option value="">Loại hình công việc</option>
            <option value="FULL_TIME">Toàn thời gian</option>
            <option value="PART_TIME">Bán thời gian</option>
          </select>

          {/* Hình thức làm việc */}
          <select
            className={selectClass}
            value={filters.workMode}
            onChange={(e) => updateFilter('workMode', e.target.value)}
          >
            <option value="">Hình thức làm việc</option>
            <option value="ON_SITE">Tại văn phòng</option>
            <option value="REMOTE">Từ xa</option>
          </select>

          {/* Mức lương */}
          <select
            className={selectClass}
            value={filters.salary}
            onChange={(e) => updateFilter('salary', e.target.value)}
          >
            <option value="">Mức lương</option>
            <option value="under10">Dưới 10 triệu</option>
            <option value="10to15">10 - 15 triệu</option>
            <option value="15to20">15 - 20 triệu</option>
            <option value="over20">Trên 20 triệu</option>
          </select>
        </div>

        {/* Bộ lọc nhanh */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => updateFilter('workMode', 'ON_SITE')}
            className={quickChip(filters.workMode === 'ON_SITE')}
          >
            Việc văn phòng
          </button>

          <button
            onClick={() => updateFilter('employmentType', 'FULL_TIME')}
            className={quickChip(filters.employmentType === 'FULL_TIME')}
          >
            Full-time
          </button>

          <button
            onClick={() => updateFilter('employmentType', 'PART_TIME')}
            className={quickChip(filters.employmentType === 'PART_TIME')}
          >
            Part-time
          </button>

          <button
            onClick={() => updateFilter('workMode', 'REMOTE')}
            className={quickChip(filters.workMode === 'REMOTE')}
          >
            Remote
          </button>

          <button
            onClick={clearFilters}
            className="ml-auto px-3 py-2 text-xs font-semibold text-[#1E5631] hover:underline"
          >
            Xóa bộ lọc
          </button>
        </div>
      </section>

      {/* Kết quả tìm kiếm */}
      <section className="mt-7">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[#26352B]">
            <span className="font-bold text-[#43A047]">
              {filteredJobs.length}
            </span>{' '}
            công việc phù hợp
          </p>
          <span className="text-xs text-gray-500">
            Dữ liệu minh họa – chưa kết nối database
          </span>
        </div>

        {/* Danh sách công việc */}
        {filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredJobs.map((job) => (
              <article
                key={job.id}
                className="rounded-2xl border border-dashed border-[#26352B] bg-white/90 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E6FADD] text-lg font-extrabold text-[#1E5631]">
                    {job.company.charAt(0)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap justify-between gap-2">
                      <h2 className="font-bold text-[#1A241E]">
                        {job.title}
                      </h2>
                      <span className="text-sm font-bold text-[#43A047]">
                        {job.salaryText}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-gray-500">
                      {job.company}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-x-3 gap-y-2 text-xs text-gray-600">
                      <span>⌖ {job.city}</span>
                      <span>
                        {job.employmentType === 'FULL_TIME'
                          ? 'Toàn thời gian'
                          : 'Bán thời gian'}
                      </span>
                      <span>
                        {job.workMode === 'ON_SITE'
                          ? 'Tại văn phòng'
                          : 'Từ xa'}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {job.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[#F0F5EE] px-2 py-1 text-[10px] text-[#42634A]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white/70 px-5 py-12 text-center">
            <p className="font-semibold text-[#1A241E]">
              Không tìm thấy công việc phù hợp.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Hãy thử thay đổi từ khóa hoặc bộ lọc của bạn.
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 rounded-full bg-[#43A047] px-5 py-2 text-sm font-semibold text-white"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </section>
    </main>
  )
}
