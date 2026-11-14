
import { useEffect, useMemo, useState } from 'react'

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
    description:
      'Lên kế hoạch và triển khai các chiến dịch Digital Marketing trên nhiều nền tảng. Theo dõi hiệu quả hoạt động truyền thông, tối ưu nội dung và phối hợp với các bộ phận liên quan để đạt mục tiêu kinh doanh.',
    requirements: [
      'Tốt nghiệp chuyên ngành Marketing, Truyền thông hoặc lĩnh vực liên quan.',
      'Có kiến thức về Digital Marketing và Social Media.',
      'Có khả năng sáng tạo nội dung và lập kế hoạch.',
      'Biết sử dụng các công cụ phân tích dữ liệu là một lợi thế.',
    ],
    benefits: [
      'Mức lương cạnh tranh theo năng lực.',
      'Được đào tạo và phát triển chuyên môn.',
      'Môi trường làm việc năng động, chuyên nghiệp.',
      'Có cơ hội tham gia các dự án truyền thông lớn.',
    ],
    deadline: '30/12/2026',
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
    description:
      'Hỗ trợ xây dựng nội dung cho các kênh truyền thông của công ty. Tham gia lên ý tưởng, viết bài và phối hợp triển khai các chiến dịch Content Marketing.',
    requirements: [
      'Là sinh viên các ngành Marketing, Truyền thông hoặc Báo chí.',
      'Có khả năng viết và diễn đạt tốt.',
      'Yêu thích sáng tạo nội dung trên nền tảng số.',
      'Có tinh thần học hỏi và trách nhiệm trong công việc.',
    ],
    benefits: [
      'Được hướng dẫn trực tiếp bởi đội ngũ chuyên môn.',
      'Linh hoạt thời gian làm việc.',
      'Có cơ hội trở thành nhân viên chính thức.',
    ],
    deadline: '25/12/2026',
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
    description:
      'Phụ trách nghiên cứu thị trường, xây dựng kế hoạch Marketing và triển khai các hoạt động phát triển thương hiệu. Theo dõi và đánh giá hiệu quả các chiến dịch.',
    requirements: [
      'Có kiến thức về Marketing và xây dựng thương hiệu.',
      'Có kỹ năng nghiên cứu và phân tích thị trường.',
      'Có khả năng lập kế hoạch và làm việc nhóm.',
      'Ưu tiên ứng viên có kinh nghiệm ở vị trí tương đương.',
    ],
    benefits: [
      'Thu nhập ổn định và thưởng theo hiệu quả công việc.',
      'Được tham gia các khóa đào tạo chuyên môn.',
      'Có cơ hội phát triển lên vị trí quản lý.',
    ],
    deadline: '20/12/2026',
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
    description:
      'Thiết kế các ấn phẩm truyền thông, hình ảnh quảng cáo và nội dung trực quan cho các chiến dịch của khách hàng. Đảm bảo sản phẩm thiết kế nhất quán với nhận diện thương hiệu.',
    requirements: [
      'Sử dụng tốt Adobe Photoshop và Illustrator.',
      'Có tư duy thẩm mỹ và khả năng sáng tạo.',
      'Có kiến thức về bố cục, màu sắc và typography.',
      'Có portfolio cá nhân là một lợi thế.',
    ],
    benefits: [
      'Làm việc từ xa linh hoạt.',
      'Được tham gia nhiều dự án sáng tạo.',
      'Môi trường làm việc thân thiện.',
    ],
    deadline: '28/12/2026',
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

const JOBS_PER_PAGE = 2

export default function JobsPage() {
  const [filters, setFilters] = useState(initialFilters)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedJob, setSelectedJob] = useState(null)

  // Cập nhật bộ lọc và quay lại trang đầu
  const updateFilter = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
    setCurrentPage(1)
  }

  // Lọc công việc
  const filteredJobs = useMemo(() => {
    return sampleJobs.filter((job) => {
      const keyword = filters.keyword.toLowerCase().trim()

      const matchesKeyword =
        !keyword ||
        job.title.toLowerCase().includes(keyword) ||
        job.company.toLowerCase().includes(keyword) ||
        job.tags.some((tag) =>
          tag.toLowerCase().includes(keyword)
        )

      const matchesCity =
        !filters.city || job.city === filters.city

      const matchesDomain =
        !filters.domain || job.domain === filters.domain

      const matchesEmployment =
        !filters.employmentType ||
        job.employmentType === filters.employmentType

      const matchesWorkMode =
        !filters.workMode ||
        job.workMode === filters.workMode

      const matchesSalary =
        !filters.salary ||
        (filters.salary === 'under10' &&
          job.salary < 10000000) ||
        (filters.salary === '10to15' &&
          job.salary >= 10000000 &&
          job.salary <= 15000000) ||
        (filters.salary === '15to20' &&
          job.salary > 15000000 &&
          job.salary <= 20000000) ||
        (filters.salary === 'over20' &&
          job.salary > 20000000)

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

  // Phân trang
  const totalPages = Math.ceil(
    filteredJobs.length / JOBS_PER_PAGE
  )

  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * JOBS_PER_PAGE,
    currentPage * JOBS_PER_PAGE
  )

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Xóa bộ lọc
  const clearFilters = () => {
    setFilters(initialFilters)
    setCurrentPage(1)
  }

  // Đóng Modal bằng phím Escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setSelectedJob(null)
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const selectClass =
    'w-full rounded-xl border border-[#4CAF50] bg-white px-3 py-3 text-sm text-[#26352B] outline-none transition focus:ring-2 focus:ring-[#4CAF50]/20'

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
          <span className="text-[#43A047]">
            PHÙ HỢP VỚI BẠN
          </span>
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
              onChange={(e) =>
                updateFilter('keyword', e.target.value)
              }
              placeholder="Vị trí, kỹ năng hoặc tên công ty"
              className="w-full bg-transparent py-3 text-sm outline-none"
            />
          </div>

          {/* Địa điểm */}
          <select
            className={selectClass}
            value={filters.city}
            onChange={(e) =>
              updateFilter('city', e.target.value)
            }
          >
            <option value="">Địa điểm</option>
            <option value="Hà Nội">Hà Nội</option>
            <option value="TP. Hồ Chí Minh">
              TP. Hồ Chí Minh
            </option>
            <option value="Đà Nẵng">Đà Nẵng</option>
            <option value="Hải Phòng">Hải Phòng</option>
          </select>

          {/* Lĩnh vực */}
          <select
            className={selectClass}
            value={filters.domain}
            onChange={(e) =>
              updateFilter('domain', e.target.value)
            }
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
            onChange={(e) =>
              updateFilter('workMode', e.target.value)
            }
          >
            <option value="">Hình thức làm việc</option>
            <option value="ON_SITE">Tại văn phòng</option>
            <option value="REMOTE">Từ xa</option>
          </select>

          {/* Mức lương */}
          <select
            className={selectClass}
            value={filters.salary}
            onChange={(e) =>
              updateFilter('salary', e.target.value)
            }
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
            onClick={() =>
              updateFilter('workMode', 'ON_SITE')
            }
            className={quickChip(
              filters.workMode === 'ON_SITE'
            )}
          >
            Việc văn phòng
          </button>

          <button
            onClick={() =>
              updateFilter('employmentType', 'FULL_TIME')
            }
            className={quickChip(
              filters.employmentType === 'FULL_TIME'
            )}
          >
            Full-time
          </button>

          <button
            onClick={() =>
              updateFilter('employmentType', 'PART_TIME')
            }
            className={quickChip(
              filters.employmentType === 'PART_TIME'
            )}
          >
            Part-time
          </button>

          <button
            onClick={() =>
              updateFilter('workMode', 'REMOTE')
            }
            className={quickChip(
              filters.workMode === 'REMOTE'
            )}
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

        {/* Danh sách Job Cards */}
        {paginatedJobs.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {paginatedJobs.map((job) => (
              <article
                key={job.id}
                className="rounded-2xl border border-dashed border-[#26352B] bg-white/90 p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#4CAF50] hover:shadow-md"
              >
                <div className="flex items-start gap-3">

                  {/* Logo công ty */}
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

                    {/* Thông tin công việc */}
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

                    {/* Tags */}
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

                    {/* Xem chi tiết */}
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="rounded-full bg-[#1E5631] px-5 py-2 text-xs font-semibold text-white transition hover:bg-[#43A047]"
                      >
                        Xem chi tiết
                      </button>
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

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">

            <button
              disabled={currentPage === 1}
              onClick={() => goToPage(currentPage - 1)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#4CAF50] text-[#1E5631] transition hover:bg-[#E6FADD] disabled:cursor-not-allowed disabled:opacity-40"
            >
              ←
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`h-10 w-10 rounded-lg font-semibold transition ${
                  currentPage === page
                    ? 'bg-[#1E5631] text-white'
                    : 'border border-[#4CAF50] bg-white text-[#1E5631] hover:bg-[#E6FADD]'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => goToPage(currentPage + 1)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#4CAF50] text-[#1E5631] transition hover:bg-[#E6FADD] disabled:cursor-not-allowed disabled:opacity-40"
            >
              →
            </button>
          </div>
        )}
      </section>

      {/* Modal chi tiết công việc */}
      {selectedJob && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedJob(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="job-modal-title"
            onClick={(event) => event.stopPropagation()}
            className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-[#FEFFFA] p-6 shadow-2xl md:p-8"
          >
            {/* Nút đóng */}
            <button
              onClick={() => setSelectedJob(null)}
              aria-label="Đóng chi tiết công việc"
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-[#E6FADD] text-xl text-[#1E5631] transition hover:bg-[#D1EFC5]"
            >
              ×
            </button>

            {/* Tiêu đề JD */}
            <div className="pr-10">
              <span className="text-sm font-semibold text-[#43A047]">
                CHI TIẾT CÔNG VIỆC
              </span>

              <h2
                id="job-modal-title"
                className="mt-2 text-2xl font-extrabold text-[#1A241E]"
              >
                {selectedJob.title}
              </h2>

              <p className="mt-2 text-gray-600">
                {selectedJob.company}
              </p>
            </div>

            {/* Thông tin tổng quan */}
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#E6FADD] px-3 py-2 text-sm font-semibold text-[#1E5631]">
                {selectedJob.salaryText}
              </span>

              <span className="rounded-full bg-gray-100 px-3 py-2 text-sm text-gray-700">
                {selectedJob.city}
              </span>

              <span className="rounded-full bg-gray-100 px-3 py-2 text-sm text-gray-700">
                {selectedJob.employmentType === 'FULL_TIME'
                  ? 'Toàn thời gian'
                  : 'Bán thời gian'}
              </span>

              <span className="rounded-full bg-gray-100 px-3 py-2 text-sm text-gray-700">
                {selectedJob.workMode === 'ON_SITE'
                  ? 'Tại văn phòng'
                  : 'Từ xa'}
              </span>
            </div>

            {/* Nội dung chi tiết */}
            <div className="mt-7 space-y-6">

              {/* Mô tả công việc */}
              <div>
                <h3 className="font-bold text-[#1E5631]">
                  Mô tả công việc
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {selectedJob.description ||
                    'Thông tin đang được cập nhật.'}
                </p>
              </div>

              {/* Yêu cầu ứng viên */}
              <div>
                <h3 className="font-bold text-[#1E5631]">
                  Yêu cầu ứng viên
                </h3>

                <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-600">
                  {(selectedJob.requirements || []).map(
                    (item, index) => (
                      <li key={index}>{item}</li>
                    )
                  )}
                </ul>
              </div>

              {/* Quyền lợi */}
              <div>
                <h3 className="font-bold text-[#1E5631]">
                  Quyền lợi
                </h3>

                <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-600">
                  {(selectedJob.benefits || []).map(
                    (item, index) => (
                      <li key={index}>{item}</li>
                    )
                  )}
                </ul>
              </div>

              {/* Kỹ năng */}
              <div>
                <h3 className="font-bold text-[#1E5631]">
                  Kỹ năng
                </h3>

                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedJob.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[#F0F5EE] px-3 py-1.5 text-xs text-[#42634A]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hạn ứng tuyển */}
              <div className="rounded-xl bg-[#F0F5EE] p-4">
                <p className="text-sm text-gray-600">
                  Hạn ứng tuyển
                </p>

                <p className="mt-1 font-bold text-[#1E5631]">
                  {selectedJob.deadline || 'Đang cập nhật'}
                </p>
              </div>
            </div>

            {/* Nút đóng Modal */}
            <button
              onClick={() => setSelectedJob(null)}
              className="mt-8 w-full rounded-full bg-[#FF4B6E] py-3 font-bold text-white transition hover:bg-[#ed3d60]"
            >
              Đóng chi tiết
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
