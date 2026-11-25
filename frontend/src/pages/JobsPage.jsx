
import { useEffect, useState } from 'react'
import { apiRequest } from '../services/api'

const sampleJobs = [
  {
    id: 'mock-1',
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
    ],
    benefits: [
      'Mức lương cạnh tranh theo năng lực.',
      'Được đào tạo và phát triển chuyên môn.',
      'Môi trường làm việc năng động, chuyên nghiệp.',
    ],
    deadline: '30/12/2026',
  },
  {
    id: 'mock-2',
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
    ],
    benefits: [
      'Được hướng dẫn trực tiếp bởi đội ngũ chuyên môn.',
      'Linh hoạt thời gian làm việc.',
    ],
    deadline: '25/12/2026',
  },
]

const initialFilters = {
  keyword: '',
  city: '',
  domain_id: '',
  employmentType: '',
  workMode: '',
  salary: '',
}

const JOBS_PER_PAGE = 8

export default function JobsPage() {
  const [filters, setFilters] = useState(initialFilters)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedJob, setSelectedJob] = useState(null)

  // Real data state from Backend
  const [jobs, setJobs] = useState([])
  const [totalJobs, setTotalJobs] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isBackendConnected, setIsBackendConnected] = useState(true)
  const [domains, setDomains] = useState([])

  // Tải danh mục lĩnh vực từ backend
  useEffect(() => {
    apiRequest('/jobs/catalogs/domains')
      .then((data) => setDomains(data || []))
      .catch((err) => console.warn('Không tải được danh mục domains:', err))
  }, [])

  // Tìm kiếm việc làm từ Backend API
  useEffect(() => {
    let isMounted = true
    setLoading(true)

    // Chuẩn hóa query params cho API /jobs/search
    const queryParams = new URLSearchParams()

    if (filters.keyword.trim()) {
      queryParams.append('keyword', filters.keyword.trim())
    }

    if (filters.city) queryParams.append('city', filters.city)
    if (filters.domain_id) queryParams.append('domain_id', filters.domain_id)

    if (filters.employmentType) {
      queryParams.append('job_type', filters.employmentType)
    }

    if (filters.workMode) {
      queryParams.append('workplace_type', filters.workMode)
    }

    if (filters.salary) {
      if (filters.salary === 'under10') {
        queryParams.append('salary_min', '0')
      } else if (filters.salary === '10to15') {
        queryParams.append('salary_min', '10000000')
      } else if (filters.salary === '15to20') {
        queryParams.append('salary_min', '15000000')
      } else if (filters.salary === 'over20') {
        queryParams.append('salary_min', '20000000')
      }
    }

    queryParams.append('page', String(currentPage))
    queryParams.append('limit', String(JOBS_PER_PAGE))

    apiRequest(`/jobs/search?${queryParams.toString()}`)
      .then((res) => {
        if (!isMounted) return

        setIsBackendConnected(true)
        setTotalJobs(res.total || 0)

        // Map backend response sang format UI
        const mapped = (res.items || []).map((item) => {
          const salaryText = item.is_salary_negotiable
            ? 'Thỏa thuận'
            : item.salary_min && item.salary_max
              ? `${(item.salary_min / 1000000).toFixed(0)} - ${(item.salary_max / 1000000).toFixed(0)} triệu`
              : item.salary_min
                ? `Từ ${(item.salary_min / 1000000).toFixed(0)} triệu`
                : 'Thỏa thuận'

          const splitLines = (text) =>
            typeof text === 'string'
              ? text
                  .split('\n')
                  .map((s) => s.trim().replace(/^[-*•]\s*/, ''))
                  .filter(Boolean)
              : Array.isArray(text)
                ? text
                : []

          return {
            id: item.job_id,
            title: item.title,
            company: item.company_name || 'Doanh nghiệp CView',
            city: item.address?.city || 'Toàn quốc',
            employmentType: item.job_type,
            workMode: item.workplace_type,
            salary: item.salary_min,
            salaryText: salaryText,
            tags: (item.skills || []).map((s) => s.skill_name),
            description: item.job_description,
            requirements: splitLines(item.requirements),
            benefits: splitLines(item.benefits),
            deadline: item.deadline
              ? new Date(item.deadline).toLocaleDateString('vi-VN')
              : 'Không giới hạn',
          }
        })

        setJobs(mapped)
      })
      .catch((err) => {
        if (!isMounted) return

        console.warn(
          'Backend chưa sẵn sàng hoặc lỗi kết nối, fallback dữ liệu mẫu:',
          err
        )

        setIsBackendConnected(false)
        setJobs(sampleJobs)
        setTotalJobs(sampleJobs.length)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [filters, currentPage])

  // Cập nhật bộ lọc và quay lại trang đầu
  const updateFilter = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))

    setCurrentPage(1)
  }

  // Phân trang
  const totalPages = Math.max(1, Math.ceil(totalJobs / JOBS_PER_PAGE))

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 150, behavior: 'smooth' })
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
    'w-full min-w-0 rounded-xl border border-[#4CAF50] bg-white px-3 py-3 text-sm text-[#26352B] outline-none transition focus:ring-2 focus:ring-[#4CAF50]/20'

  const quickChip = (active) =>
    `rounded-full px-4 py-2 text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
      active
        ? 'bg-[#43A047] text-white'
        : 'bg-white/80 text-[#26352B] hover:bg-[#E6FADD]'
    }`

  return (
    <main className="mx-auto min-h-[70vh] w-full max-w-[1140px] px-6 py-5 sm:px-8 sm:py-7 lg:px-12 lg:py-8">
      {/* Tiêu đề */}
      <section className="mb-5">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#E6FADD] px-3 py-1 text-xs font-semibold text-[#1E5631] sm:text-sm">
          <span>✦</span>
          Việc làm
        </div>

        <h1 className="break-words text-[clamp(1.4rem,3.6vw,2.2rem)] font-extrabold leading-tight text-[#1A241E]">
          TÌM CÔNG VIỆC{' '}
          <span className="text-[#43A047]">PHÙ HỢP VỚI BẠN</span>
        </h1>

        <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-gray-600 sm:text-sm md:text-base">
          Khám phá cơ hội việc làm từ hàng nghìn doanh nghiệp uy tín trên hệ thống CView.
        </p>
      </section>

      {/* Thanh tìm kiếm và bộ lọc */}
      <section className="space-y-4">
        {/* Hàng bộ lọc thứ nhất */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* Từ khóa */}
          <div className="flex min-w-0 items-center gap-2 rounded-xl border border-[#4CAF50] bg-white px-4">
            <span className="shrink-0 text-lg text-gray-400">⌕</span>

            <input
              type="text"
              value={filters.keyword}
              onChange={(e) => updateFilter('keyword', e.target.value)}
              placeholder="Vị trí, kỹ năng hoặc tiêu đề công việc..."
              className="w-full min-w-0 bg-transparent py-3 text-sm outline-none"
            />
          </div>

          {/* Địa điểm */}
          <select
            className={selectClass}
            value={filters.city}
            onChange={(e) => updateFilter('city', e.target.value)}
          >
            <option value="">Tất cả địa điểm</option>
            <option value="Hà Nội">Hà Nội</option>
            <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
            <option value="Đà Nẵng">Đà Nẵng</option>
            <option value="Cần Thơ">Cần Thơ</option>
            <option value="Hải Phòng">Hải Phòng</option>
            <option value="Bình Dương">Bình Dương</option>
          </select>

          {/* Lĩnh vực */}
          <select
            className={selectClass}
            value={filters.domain_id}
            onChange={(e) => updateFilter('domain_id', e.target.value)}
          >
            <option value="">Tất cả lĩnh vực</option>

            {domains.map((dom) => (
              <option key={dom.domain_id} value={dom.domain_id}>
                {dom.domain_name}
              </option>
            ))}
          </select>
        </div>

        {/* Hàng bộ lọc thứ hai */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* Loại công việc */}
          <select
            className={selectClass}
            value={filters.employmentType}
            onChange={(e) => updateFilter('employmentType', e.target.value)}
          >
            <option value="">Loại hình công việc</option>
            <option value="FULL_TIME">Toàn thời gian (FULL_TIME)</option>
            <option value="PART_TIME">Bán thời gian (PART_TIME)</option>
            <option value="INTERNSHIP">Thực tập (INTERNSHIP)</option>
            <option value="CONTRACT">Hợp đồng (CONTRACT)</option>
            <option value="FREELANCE">Freelance</option>
          </select>

          {/* Hình thức làm việc */}
          <select
            className={selectClass}
            value={filters.workMode}
            onChange={(e) => updateFilter('workMode', e.target.value)}
          >
            <option value="">Hình thức làm việc</option>
            <option value="ON_SITE">Tại văn phòng (ON_SITE)</option>
            <option value="REMOTE">Từ xa (REMOTE)</option>
            <option value="HYBRID">Linh hoạt (HYBRID)</option>
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

        {/* Lọc nhanh và nút xóa bộ lọc */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="mr-1 text-xs font-semibold text-gray-500">
            Lọc nhanh:
          </span>

          <button
            onClick={() =>
              updateFilter(
                'employmentType',
                filters.employmentType === 'FULL_TIME' ? '' : 'FULL_TIME'
              )
            }
            className={quickChip(filters.employmentType === 'FULL_TIME')}
          >
            Toàn thời gian
          </button>

          <button
            onClick={() =>
              updateFilter(
                'employmentType',
                filters.employmentType === 'INTERNSHIP' ? '' : 'INTERNSHIP'
              )
            }
            className={quickChip(filters.employmentType === 'INTERNSHIP')}
          >
            Thực tập sinh
          </button>

          <button
            onClick={() =>
              updateFilter(
                'workMode',
                filters.workMode === 'REMOTE' ? '' : 'REMOTE'
              )
            }
            className={quickChip(filters.workMode === 'REMOTE')}
          >
            Remote
          </button>

          <button
            onClick={clearFilters}
            className="ml-auto rounded-full px-3 py-2 text-xs font-semibold text-[#1E5631] transition hover:bg-[#E6FADD] hover:underline cursor-pointer"
          >
            Xóa bộ lọc
          </button>
        </div>
      </section>

      {/* Kết quả tìm kiếm */}
      <section className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[#26352B]">
            <span className="font-bold text-[#43A047]">{totalJobs}</span>{' '}
            công việc phù hợp
          </p>
        </div>

        {/* Danh sách Job Cards */}
        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500 sm:p-12">
            <div className="mb-3 inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#1E5631] border-t-transparent"></div>
            <div>Đang tải kết quả tìm kiếm việc làm...</div>
          </div>
        ) : jobs.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {jobs.map((job) => (
              <article
                key={job.id}
                className="flex min-w-0 flex-col justify-between rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#4CAF50] hover:shadow-md sm:p-5"
              >
                <div>
                  <div className="flex min-w-0 items-start gap-3">
                    {/* Logo công ty */}
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E6FADD] text-lg font-extrabold text-[#1E5631] sm:h-12 sm:w-12">
                      {job.company.charAt(0)}
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* Tên công việc và mức lương */}
                      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between">
                        <h2 className="min-w-0 break-words text-base font-bold text-[#1A241E] transition hover:text-[#1E5631] sm:text-lg">
                          {job.title}
                        </h2>

                        <span className="shrink-0 text-sm font-bold text-[#43A047]">
                          {job.salaryText}
                        </span>
                      </div>

                      <p className="mt-0.5 break-words text-xs font-medium text-gray-500">
                        {job.company}
                      </p>

                      {/* Thông tin công việc */}
                      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-gray-600">
                        <span>📍 {job.city}</span>

                        <span>
                          💼{' '}
                          {job.employmentType === 'FULL_TIME'
                            ? 'Toàn thời gian'
                            : job.employmentType === 'INTERNSHIP'
                              ? 'Thực tập'
                              : job.employmentType}
                        </span>

                        <span>
                          🏢{' '}
                          {job.workMode === 'ON_SITE'
                            ? 'Tại văn phòng'
                            : job.workMode === 'REMOTE'
                              ? 'Từ xa'
                              : 'Linh hoạt'}
                        </span>
                      </div>

                      {/* Tags */}
                      {job.tags && job.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {job.tags.slice(0, 5).map((tag, idx) => (
                            <span
                              key={idx}
                              className="break-words rounded-full bg-[#F0F5EE] px-2.5 py-1 text-[11px] font-medium text-[#42634A]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Xem chi tiết */}
                <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-3 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between">
                  <span>Hạn nộp: {job.deadline}</span>

                  <button
                    onClick={() => setSelectedJob(job)}
                    className="w-full rounded-full bg-[#1E5631] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#43A047] cursor-pointer sm:w-auto"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white/70 px-5 py-12 text-center sm:py-16">
            <p className="text-lg font-bold text-[#1A241E]">
              Không tìm thấy công việc phù hợp.
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Hãy thử thay đổi từ khóa hoặc bộ lọc của bạn.
            </p>

            <button
              onClick={clearFilters}
              className="mt-5 rounded-full bg-[#43A047] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1E5631] cursor-pointer"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => goToPage(currentPage - 1)}
              aria-label="Trang trước"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#4CAF50] text-sm text-[#1E5631] transition hover:bg-[#E6FADD] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer sm:h-10 sm:w-10"
            >
              ←
            </button>

            {Array.from(
              { length: Math.min(totalPages, 5) },
              (_, index) => {
                const pageNum = index + 1

                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    aria-current={currentPage === pageNum ? 'page' : undefined}
                    className={`h-9 w-9 rounded-lg text-sm font-semibold transition cursor-pointer sm:h-10 sm:w-10 ${
                      currentPage === pageNum
                        ? 'bg-[#1E5631] text-white'
                        : 'border border-[#4CAF50] bg-white text-[#1E5631] hover:bg-[#E6FADD]'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              }
            )}

            <button
              disabled={currentPage === totalPages}
              onClick={() => goToPage(currentPage + 1)}
              aria-label="Trang tiếp theo"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#4CAF50] text-sm text-[#1E5631] transition hover:bg-[#E6FADD] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer sm:h-10 sm:w-10"
            >
              →
            </button>
          </div>
        )}
      </section>

      {/* Modal chi tiết công việc */}
      {selectedJob && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/50 p-2 backdrop-blur-sm sm:p-4"
          onClick={() => setSelectedJob(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="job-modal-title"
            onClick={(event) => event.stopPropagation()}
            className="relative my-auto max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[#FEFFFA] p-4 shadow-2xl sm:rounded-3xl sm:p-6 md:p-8"
          >
            {/* Nút đóng */}
            <button
              onClick={() => setSelectedJob(null)}
              aria-label="Đóng chi tiết công việc"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#E6FADD] text-xl text-[#1E5631] transition hover:bg-[#D1EFC5] cursor-pointer sm:right-5 sm:top-5"
            >
              ×
            </button>

            {/* Tiêu đề JD */}
            <div className="pr-10">
              <span className="text-xs font-semibold text-[#43A047] sm:text-sm">
                CHI TIẾT CÔNG VIỆC
              </span>

              <h2
                id="job-modal-title"
                className="mt-2 break-words text-xl font-extrabold leading-tight text-[#1A241E] sm:text-2xl"
              >
                {selectedJob.title}
              </h2>

              <p className="mt-1 break-words text-sm font-medium text-gray-600">
                {selectedJob.company}
              </p>
            </div>

            {/* Thông tin tổng quan */}
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#E6FADD] px-3 py-1.5 text-xs font-bold text-[#1E5631]">
                💰 {selectedJob.salaryText}
              </span>

              <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700">
                📍 {selectedJob.city}
              </span>

              <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700">
                💼 {selectedJob.employmentType}
              </span>

              <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700">
                🏢 {selectedJob.workMode}
              </span>
            </div>

            {/* Nội dung chi tiết */}
            <div className="mt-6 space-y-6 sm:mt-7">
              {/* Mô tả công việc */}
              <div>
                <h3 className="font-bold text-[#1E5631]">
                  Mô tả công việc
                </h3>

                <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed text-gray-600">
                  {selectedJob.description || 'Thông tin đang được cập nhật.'}
                </p>
              </div>

              {/* Yêu cầu ứng viên */}
              <div>
                <h3 className="font-bold text-[#1E5631]">
                  Yêu cầu ứng viên
                </h3>

                <ul className="mt-2 list-disc space-y-1.5 break-words pl-5 text-sm leading-relaxed text-gray-600">
                  {(selectedJob.requirements || []).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Quyền lợi */}
              {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                <div>
                  <h3 className="font-bold text-[#1E5631]">
                    Quyền lợi
                  </h3>

                  <ul className="mt-2 list-disc space-y-1.5 break-words pl-5 text-sm leading-relaxed text-gray-600">
                    {selectedJob.benefits.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Kỹ năng */}
              {selectedJob.tags && selectedJob.tags.length > 0 && (
                <div>
                  <h3 className="font-bold text-[#1E5631]">
                    Kỹ năng yêu cầu
                  </h3>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedJob.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="break-words rounded-full bg-[#F0F5EE] px-3 py-1 text-xs font-medium text-[#42634A]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Hạn ứng tuyển */}
              <div className="flex items-center justify-between rounded-xl bg-[#F0F5EE] p-4">
                <div>
                  <p className="text-xs text-gray-500">
                    Hạn chót ứng tuyển
                  </p>

                  <p className="mt-0.5 text-sm font-bold text-[#1E5631]">
                    {selectedJob.deadline}
                  </p>
                </div>
              </div>
            </div>

            {/* Nút đóng Modal */}
            <button
              onClick={() => setSelectedJob(null)}
              className="mt-7 w-full rounded-full bg-[#FF4B6E] py-3 font-bold text-white transition hover:bg-[#ed3d60] cursor-pointer sm:mt-8"
            >
              Đóng chi tiết
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
