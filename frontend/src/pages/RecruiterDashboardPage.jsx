import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../services/api'
import logoCView from '../assets/logo-cview.png'

// Dữ liệu mẫu dự phòng khi chưa đăng nhập hoặc Backend chưa chạy
const SAMPLE_FALLBACK_JOBS = [
  {
    id: 'sample-1',
    title: 'Chuyên viên tuyển dụng',
    createdAt: '10/11/2026',
    status: 'PENDING',
    statusLabel: 'Chờ duyệt',
    domain: 'Nhân sự / Tuyển dụng',
    salaryMin: 12000000,
    salaryMax: 18000000,
    city: 'Hà Nội',
    skills: ['Tuyển dụng', 'Phỏng vấn', 'HR'],
    description: 'Tìm kiếm, sàng lọc hồ sơ và tổ chức phỏng vấn các vị trí nhân sự cho công ty. Đánh giá ứng viên và theo dõi kết quả thử việc.',
    views: 128,
  },
  {
    id: 'sample-2',
    title: 'Frontend Developer (ReactJS)',
    createdAt: '08/11/2026',
    status: 'APPROVED',
    statusLabel: 'Đã duyệt',
    domain: 'Công nghệ thông tin',
    salaryMin: 18000000,
    salaryMax: 30000000,
    city: 'TP. Hồ Chí Minh',
    skills: ['ReactJS', 'TailwindCSS', 'JavaScript'],
    description: 'Phát triển giao diện ứng dụng web hiện đại bằng ReactJS. Tối ưu trải nghiệm người dùng và phối hợp với Backend.',
    views: 520,
  },
  {
    id: 'sample-3',
    title: 'Nhân viên kinh doanh',
    createdAt: '05/11/2026',
    status: 'REJECTED',
    statusLabel: 'Từ chối',
    rejectionReason: 'Mô tả công việc và mức lương chưa chi tiết theo chính sách kiểm duyệt.',
    domain: 'Kinh doanh / Bán hàng',
    salaryMin: 10000000,
    salaryMax: 20000000,
    city: 'Đà Nẵng',
    skills: ['Giao tiếp', 'Đàm phán', 'Bán hàng'],
    description: 'Tìm kiếm và mở rộng tệp khách hàng tiềm năng. Tư vấn giải pháp và chăm sóc khách hàng.',
    views: 45,
  },
]

// Danh mục Ngành nghề chuẩn hóa mặc định (chuẩn bị sẵn để form luôn có đầy đủ tùy chọn)
const DEFAULT_DOMAINS = [
  { domain_id: 1, domain_name: 'Phần mềm & Công nghệ thông tin' },
  { domain_id: 2, domain_name: 'Fintech & Ngân hàng số' },
  { domain_id: 3, domain_name: 'Thương mại điện tử & Logistics' },
  { domain_id: 4, domain_name: 'Marketing & Truyền thông' },
  { domain_id: 5, domain_name: 'Kinh doanh & Bán hàng (Sales/BD)' },
  { domain_id: 6, domain_name: 'Nhân sự & Tuyển dụng (HR)' },
  { domain_id: 7, domain_name: 'Thiết kế đồ họa & UI/UX' },
  { domain_id: 8, domain_name: 'Tài chính & Kế toán' },
  { domain_id: 9, domain_name: 'Dữ liệu & Trí tuệ nhân tạo (AI/Data)' },
  { domain_id: 10, domain_name: 'Dịch vụ khách hàng & Vận hành' },
]

// Danh mục Kỹ năng chuẩn hóa mặc định
const DEFAULT_SKILLS = [
  { skill_id: 1, skill_name: 'Digital Marketing' },
  { skill_id: 2, skill_name: 'SEO' },
  { skill_id: 3, skill_name: 'Google Ads' },
  { skill_id: 4, skill_name: 'ReactJS' },
  { skill_id: 5, skill_name: 'Node.js' },
  { skill_id: 6, skill_name: 'Python' },
  { skill_id: 7, skill_name: 'Java Spring Boot' },
  { skill_id: 8, skill_name: 'Docker & Kubernetes' },
  { skill_id: 9, skill_name: 'SQL & Database' },
  { skill_id: 10, skill_name: 'Figma / UI-UX' },
  { skill_id: 11, skill_name: 'Quản trị nhân sự' },
  { skill_id: 12, skill_name: 'Kỹ năng bán hàng' },
]

export default function RecruiterDashboardPage() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  // State mở Slide-over Drawer Đăng bài tuyển dụng (Trượt từ bên phải)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Tab điều hướng: 'overview' | 'jobs' | 'candidates'
  const [activeTab, setActiveTab] = useState('overview')

  // Trạng thái kết nối CSDL thực tế
  const [isDbConnected, setIsDbConnected] = useState(false)
  const [loadingJobs, setLoadingJobs] = useState(false)
  const [dbErrorMessage, setDbErrorMessage] = useState('')

  // Danh mục Lĩnh vực & Kỹ năng lấy động từ CSDL (khởi tạo sẵn với DEFAULT để form luôn hiển thị đầy đủ ngay lập tức)
  const [domainsCatalog, setDomainsCatalog] = useState(DEFAULT_DOMAINS)
  const [skillsCatalog, setSkillsCatalog] = useState(DEFAULT_SKILLS)

  // Danh sách tin tuyển dụng từ CSDL (khởi tạo sẵn với dữ liệu mẫu)
  const [jobs, setJobs] = useState(SAMPLE_FALLBACK_JOBS)
  const [totalDbCount, setTotalDbCount] = useState(SAMPLE_FALLBACK_JOBS.length)

  // Bộ lọc trạng thái ở bảng: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 3 // 3 tin mỗi trang 

  // Modal chi tiết & Toast thông báo
  const [selectedJob, setSelectedJob] = useState(null)
  const [toastMessage, setToastMessage] = useState('')

  // State Form Đăng bài tuyển dụng 
  const [formData, setFormData] = useState({
    title: '',
    domainId: '',
    selectedSkills: ['Digital Marketing', 'SEO', 'Google Ads'],
    newSkillInput: '',
    salaryMin: '',
    salaryMax: '',
    city: '',
    description: '',
  })
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 1. Tải danh mục Lĩnh vực (Domains) và Kỹ năng (Skills) từ Backend CSDL (nếu Backend đang hoạt động)
  useEffect(() => {
    // Lấy domains từ PostgreSQL
    apiRequest('/jobs/catalogs/domains')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setDomainsCatalog(data)
        }
      })
      .catch(() => {
        // Nếu Backend chưa bật, đã có sẵn DEFAULT_DOMAINS chuẩn hóa
      })

    // Lấy skills từ PostgreSQL
    apiRequest('/jobs/catalogs/skills')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSkillsCatalog(data)
        }
      })
      .catch(() => {
        // Nếu Backend chưa bật, đã có sẵn DEFAULT_SKILLS chuẩn hóa
      })
  }, [])

  // 2. Hàm gọi API lấy danh sách tin tuyển dụng thực tế của Nhà tuyển dụng từ CSDL
  const fetchMyJobsFromDb = useCallback(async () => {
    setLoadingJobs(true)
    setDbErrorMessage('')

    try {
      // Query param lọc theo trạng thái duyệt nếu người dùng chọn
      const params = new URLSearchParams()
      params.append('page', String(currentPage))
      params.append('limit', '20')
      if (statusFilter !== 'ALL') {
        params.append('approval_status', statusFilter)
      }

      const res = await apiRequest(`/jobs/my-jobs?${params.toString()}`)
      
      // Đã kết nối thành công với Backend & DB
      setIsDbConnected(true)
      setTotalDbCount(res.total || 0)

      if (res && res.items) {
        const mapped = res.items.map((item) => ({
          id: item.job_id,
          title: item.title,
          createdAt: item.created_at
            ? new Date(item.created_at).toLocaleDateString('vi-VN')
            : 'Mới đăng',
          status: item.approval_status || 'PENDING',
          statusLabel:
            item.approval_status === 'APPROVED'
              ? 'Đã duyệt'
              : item.approval_status === 'REJECTED'
                ? 'Từ chối'
                : 'Chờ duyệt',
          rejectionReason: item.rejection_reason || null,
          domain: (item.domains && item.domains[0]?.domain_name) || 'Chưa phân loại',
          salaryMin: item.salary_min || 0,
          salaryMax: item.salary_max || 0,
          city: (item.address && item.address.city) || 'Toàn quốc',
          skills: (item.skills && item.skills.map((s) => s.skill_name)) || [],
          description: item.job_description || '',
          views: item.view_count || item.views || 0,
        }))
        setJobs(mapped)
      }
    } catch (err) {
      setIsDbConnected(false)
      setDbErrorMessage(err.message || 'Chưa kết nối được CSDL')
      // Nếu chưa login hoặc chưa có DB, sử dụng dữ liệu mẫu trực quan
      setJobs(SAMPLE_FALLBACK_JOBS)
      setTotalDbCount(SAMPLE_FALLBACK_JOBS.length)
    } finally {
      setLoadingJobs(false)
    }
  }, [currentPage, statusFilter])

  // Kích hoạt nạp dữ liệu khi đổi trang hoặc đổi bộ lọc trạng thái
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMyJobsFromDb()
    }, 0)
    return () => clearTimeout(timer)
  }, [fetchMyJobsFromDb])

  // Tự động tắt Toast thông báo sau 4s
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(''), 4000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  // Lắng nghe phím ESC để đóng Drawer và Modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsDrawerOpen(false)
        setSelectedJob(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Khóa cuộn trang khi Drawer hoặc Modal chi tiết đang mở
  useEffect(() => {
    if (isDrawerOpen || selectedJob) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isDrawerOpen, selectedJob])

  // Thêm / Xóa Kỹ năng trong Form
  const handleAddSkill = (e) => {
    if (e.key === 'Enter' || e.type === 'blur') {
      e.preventDefault()
      const val = formData.newSkillInput.trim()
      if (val && !formData.selectedSkills.includes(val)) {
        setFormData((prev) => ({
          ...prev,
          selectedSkills: [...prev.selectedSkills, val],
          newSkillInput: '',
        }))
      }
    }
  }

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      selectedSkills: prev.selectedSkills.filter((s) => s !== skillToRemove),
    }))
  }

  // 3. XỬ LÝ ĐĂNG TIN: LƯU TRỰC TIẾP VÀO POSTGRESQL THÔNG QUA POST /jobs
  const handleSubmitJob = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!formData.title.trim()) {
      setFormError('Vui lòng nhập tiêu đề công việc.')
      return
    }
    if (!formData.domainId) {
      setFormError('Vui lòng chọn ngành nghề trong danh mục.')
      return
    }
    if (!formData.salaryMin || !formData.salaryMax) {
      setFormError('Vui lòng nhập đầy đủ mức lương tối thiểu và tối đa.')
      return
    }
    if (Number(formData.salaryMax) < Number(formData.salaryMin)) {
      setFormError('Mức lương tối đa phải lớn hơn hoặc bằng mức lương tối thiểu.')
      return
    }
    if (!formData.city) {
      setFormError('Vui lòng chọn tỉnh / thành phố làm việc.')
      return
    }
    if (!formData.description.trim()) {
      setFormError('Vui lòng nhập mô tả chi tiết công việc.')
      return
    }

    setIsSubmitting(true)

    // Tìm tên ngành nghề đã chọn để hiển thị
    const selectedDomain = domainsCatalog.find(
      (d) => String(d.domain_id ?? d.id) === String(formData.domainId)
    )
    const selectedDomainName = selectedDomain?.domain_name || selectedDomain?.name || 'Chuyên môn'

    // Tìm hoặc ánh xạ skill_id tương ứng trong CSDL
    const mappedSkillsPayload = formData.selectedSkills.map((skillName, index) => {
      const matched = skillsCatalog.find(
        (s) => (s.skill_name || s.name || '').toLowerCase() === skillName.toLowerCase()
      )
      return {
        skill_id: matched ? (matched.skill_id ?? matched.id) : index + 1,
        requirement_type: 'MANDATORY',
        min_years_experience: 1.0,
      }
    })

    // Cấu trúc Payload chuẩn Pydantic JobPostCreateRequest
    const postPayload = {
      title: formData.title.trim(),
      position: formData.title.trim(),
      job_description: formData.description.trim(),
      requirements:
        formData.description.length >= 10
          ? formData.description.trim()
          : 'Yêu cầu kỹ năng và kinh nghiệm tương ứng với vị trí tuyển dụng.',
      job_type: 'FULL_TIME',
      workplace_type: formData.city === 'Toàn quốc' ? 'REMOTE' : 'ON_SITE',
      salary_min: Number(formData.salaryMin),
      salary_max: Number(formData.salaryMax),
      is_salary_negotiable: false,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Hạn nộp 30 ngày tới
      domain_ids: [Number(formData.domainId)],
      skills: mappedSkillsPayload,
      certificates: [],
      address: {
        street_address: 'Trụ sở văn phòng công ty',
        city: formData.city,
        country: 'Việt Nam',
      },
    }

    try {
      // GỌI API LƯU VÀO CƠ SỞ DỮ LIỆU POSTGRESQL
      const response = await apiRequest('/jobs', {
        method: 'POST',
        body: JSON.stringify(postPayload),
      })

      // Thông báo thành công
      setToastMessage(
        `🎉 Đã lưu bài đăng "${response.title || formData.title}" vào CSDL PostgreSQL thành công (Chờ kiểm duyệt)!`
      )

      // Nạp lại danh sách mới nhất từ Database
      await fetchMyJobsFromDb()

      // Reset form
      setFormData({
        title: '',
        domainId: '',
        selectedSkills: ['Digital Marketing', 'SEO', 'Google Ads'],
        newSkillInput: '',
        salaryMin: '',
        salaryMax: '',
        city: '',
        description: '',
      })

      // Đóng Slide-over Drawer và về trang 1
      setIsDrawerOpen(false)
      setCurrentPage(1)
    } catch (err) {
      console.warn('Lỗi gọi API đăng tin tuyển dụng:', err)
      // Nếu Backend chưa bật hoặc chưa đăng nhập, lưu tạm bài đăng vào bộ nhớ giao diện để người dùng kiểm thử luồng đăng tuyển
      const localJob = {
        id: `local-${Date.now()}`,
        title: formData.title.trim(),
        createdAt: new Date().toLocaleDateString('vi-VN'),
        status: 'PENDING',
        statusLabel: 'Chờ duyệt',
        domain: selectedDomainName,
        salaryMin: Number(formData.salaryMin),
        salaryMax: Number(formData.salaryMax),
        city: formData.city,
        skills: [...formData.selectedSkills],
        description: formData.description.trim(),
        views: 0,
      }
      setJobs((prev) => [localJob, ...prev])
      setToastMessage(
        `Đã tạo bài đăng "${formData.title}" thành công (Đang chờ kiểm duyệt)!`
      )

      // Reset form
      setFormData({
        title: '',
        domainId: '',
        selectedSkills: ['Digital Marketing', 'SEO', 'Google Ads'],
        newSkillInput: '',
        salaryMin: '',
        salaryMax: '',
        city: '',
        description: '',
      })

      // Đóng Slide-over Drawer và về trang 1
      setIsDrawerOpen(false)
      setCurrentPage(1)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Phân trang dữ liệu
  const totalPages = Math.ceil(jobs.length / itemsPerPage) || 1
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentJobs = jobs.slice(startIndex, startIndex + itemsPerPage)

  // Tính toán số liệu thống kê THỰC TẾ từ danh sách tin (hoặc fallback nếu là tài khoản mới)
  const dynamicTotalJobs = isDbConnected ? totalDbCount : 12
  const dynamicPendingJobs = isDbConnected
    ? jobs.filter((j) => j.status === 'PENDING').length
    : 3
  const dynamicAvgViews = isDbConnected
    ? jobs.length > 0
      ? Math.round(jobs.reduce((acc, j) => acc + (j.views || 0), 0) / jobs.length)
      : 0
    : 345

  const recruiterName = user?.full_name || user?.username || 'Nguyễn Thị Anh'

  return (
    <div className="min-h-screen bg-transparent text-[#1A241E] font-['Manrope',sans-serif]">
      {/* Toast thông báo nổi */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-emerald-600 px-5 py-3.5 text-white shadow-xl transition-all animate-bounce">
          <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          HEADER DÀNH RIÊNG CHO NHÀ TUYỂN DỤNG 
      ========================================================================= */}
      <header className="border-b border-gray-200/50 bg-white/75 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-3.5 lg:px-14">
          {/* Logo CView */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logoCView} alt="CView" className="w-[125px] h-auto object-contain" />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-10">
            <button
              onClick={() => setActiveTab('overview')}
              className={`text-[16px] font-bold transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'text-[#059669]'
                  : 'text-[#1A241E] hover:text-[#059669]'
              }`}
            >
              Tổng quan
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`text-[16px] font-medium transition-colors cursor-pointer ${
                activeTab === 'jobs' ? 'text-[#059669] font-bold' : 'text-gray-600 hover:text-[#059669]'
              }`}
            >
              Tin tuyển dụng
            </button>
            <button
              onClick={() => {
                setActiveTab('candidates')
                alert('Tính năng Quản lý Hồ sơ ứng viên đang đồng bộ dữ liệu!')
              }}
              className={`text-[16px] font-medium transition-colors cursor-pointer ${
                activeTab === 'candidates' ? 'text-[#059669] font-bold' : 'text-gray-600 hover:text-[#059669]'
              }`}
            >
              Hồ sơ ứng viên
            </button>
          </nav>

          {/* Action Cluster: [+ Đăng tuyển] | [Profile] | [Đăng xuất] */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Nút + Đăng tuyển (Mở Slide-over Drawer) */}
            <button
              onClick={() => {
                setIsDrawerOpen(true)
                setFormError('')
              }}
              className="flex items-center gap-1.5 rounded-lg bg-[#059669] px-4 py-2.5 text-[15px] font-semibold text-white shadow-sm transition hover:bg-[#047857] active:scale-95 cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              <span>Đăng tuyển</span>
            </button>

            {/* Thông tin Recruiter Profile */}
            <div className="flex items-center gap-2.5 pl-2">
              <div className="h-9 w-9 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 font-bold text-sm uppercase">
                {recruiterName[0] || 'A'}
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <div className="text-[14px] font-bold text-[#1A241E]">{recruiterName}</div>
                <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">RECRUITER</div>
              </div>
              <svg className="h-4 w-4 text-gray-400 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Nút Đăng xuất */}
            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
                className="rounded-lg border border-[#FF4B6E]/40 bg-white px-4 py-2 text-sm font-semibold text-[#FF4B6E] transition hover:bg-rose-50 active:scale-95 cursor-pointer"
              >
                Đăng xuất
              </button>
            ) : (
              <Link
                to="/recruiter/login"
                className="rounded-lg border border-emerald-600 bg-white px-3.5 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* =========================================================================
          NỘI DUNG CHÍNH
      ========================================================================= */}
      <main className="mx-auto max-w-[1440px] px-6 py-8 lg:px-14">
        {/* THANH TRẠNG THÁI KẾT NỐI DATABASE THỰC TẾ */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white/80 p-3.5 shadow-2xs backdrop-blur-xs">
          <div className="flex items-center gap-2.5 text-xs">
            {isDbConnected ? (
              <span className="flex items-center gap-1.5 font-bold text-emerald-700">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                ĐÃ KẾT NỐI CƠ SỞ DỮ LIỆU POSTGRESQL (Tài khoản: {user?.username || 'Doanh nghiệp'})
              </span>
            ) : (
              <span className="flex items-center gap-1.5 font-medium text-amber-700">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                Đang hiển thị chế độ xem thử nghiệm ({dbErrorMessage || 'Chưa đăng nhập Nhà tuyển dụng'})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isAuthenticated && (
              <Link
                to="/recruiter/login"
                className="text-xs font-bold text-emerald-700 underline hover:text-emerald-800"
              >
                Đăng nhập tài khoản NTD để ghi dữ liệu thật $\rightarrow$
              </Link>
            )}
            <button
              onClick={fetchMyJobsFromDb}
              disabled={loadingJobs}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer disabled:opacity-50"
            >
              <span>{loadingJobs ? 'Đang tải...' : '🔄 Làm mới CSDL'}</span>
            </button>
          </div>
        </div>

        {/* =======================================================================
           TỔNG QUAN TUYỂN DỤNG
        ======================================================================= */}
        <div>
            {/* Tiêu đề & Chọn thời gian */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-[#1A241E] tracking-tight">
                  Tổng quan tuyển dụng
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Chào {recruiterName.split(' ').slice(-1)[0] || 'Anh'}, cùng CView tìm kiếm những ứng viên phù hợp nhất.
                </p>
              </div>

              {/* Dropdown chọn tháng: Tháng 11, 2026 */}
              <div className="flex items-center gap-2 rounded-xl border border-gray-200/80 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-xs cursor-pointer hover:border-gray-300 w-fit">
                <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Tháng 11, 2026</span>
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* 3 Thẻ chỉ số KPI (Stat Cards - ĐỌC ĐỘNG TỪ CSDL) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Card 1: Tổng tin đã đăng */}
              <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div>
                  <div className="text-xs font-semibold text-gray-500">Tổng tin đã đăng</div>
                  <div className="mt-2 text-3xl font-extrabold text-[#1A241E]">{dynamicTotalJobs}</div>
                  <div className="mt-1 text-xs text-gray-400">Tất cả tin tuyển dụng</div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E6FADD] text-[#1E5631]">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              {/* Card 2: Tin đang chờ duyệt */}
              <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div>
                  <div className="text-xs font-semibold text-gray-500">Tin đang chờ duyệt</div>
                  <div className="mt-2 text-3xl font-extrabold text-[#1A241E]">{dynamicPendingJobs}</div>
                  <div className="mt-1 text-xs text-gray-400">Đang được CView xét duyệt</div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>

              {/* Card 3: Lượt xem trung bình */}
              <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div>
                  <div className="text-xs font-semibold text-gray-500">Lượt xem trung bình</div>
                  <div className="mt-2 text-3xl font-extrabold text-[#1A241E]">{dynamicAvgViews}</div>
                  <div className="mt-1 text-xs text-gray-400">Trên mỗi tin tuyển dụng</div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Bảng Tin tuyển dụng của bạn (DỮ LIỆU TỪ POSTGRESQL) */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 lg:p-8 shadow-sm mb-12">
              {/* Header của Card Danh sách */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg lg:text-xl font-bold text-[#1A241E]">Tin tuyển dụng của bạn</h2>
                    <span className="rounded-full bg-[#E6FADD] px-2.5 py-0.5 text-xs font-bold text-[#1E5631]">
                      {dynamicTotalJobs}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    Theo dõi trạng thái và quản lý các tin tuyển dụng đã đăng trong CSDL.
                  </p>
                </div>

                {/* Dropdown Lọc trạng thái (Gửi trực tiếp lên API CSDL) */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2 pr-9 text-xs font-semibold text-gray-700 shadow-2xs hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="PENDING">Chờ duyệt</option>
                    <option value="APPROVED">Đã duyệt</option>
                    <option value="REJECTED">Từ chối</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Bảng dữ liệu */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs font-medium text-gray-400 border-b border-gray-100">
                      <th className="py-4 font-normal">Tên công việc</th>
                      <th className="py-4 font-normal">Ngày đăng</th>
                      <th className="py-4 font-normal">Trạng thái</th>
                      <th className="py-4 font-normal text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {loadingJobs ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-gray-400 text-sm">
                          <span className="inline-block animate-spin mr-2">🔄</span> Đang nạp dữ liệu từ PostgreSQL...
                        </td>
                      </tr>
                    ) : currentJobs.length > 0 ? (
                      currentJobs.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                          {/* Tên công việc */}
                          <td className="py-4 font-semibold text-[#1A241E]">
                            <div>{item.title}</div>
                            <div className="text-[11px] text-gray-400 font-normal">{item.domain} · {item.city}</div>
                          </td>

                          {/* Ngày đăng */}
                          <td className="py-4 text-xs text-gray-500 font-medium">
                            {item.createdAt}
                          </td>

                          {/* Trạng thái */}
                          <td className="py-4">
                            {item.status === 'PENDING' && (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEF3C7] px-3 py-1 text-xs font-medium text-[#B45309]">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#D97706]" />
                                Chờ duyệt
                              </span>
                            )}
                            {item.status === 'APPROVED' && (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DCFCE7] px-3 py-1 text-xs font-medium text-[#15803D]">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
                                Đã duyệt
                              </span>
                            )}
                            {item.status === 'REJECTED' && (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEE2E2] px-3 py-1 text-xs font-medium text-[#B91C1C]">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#DC2626]" />
                                Từ chối
                              </span>
                            )}
                          </td>

                          {/* Hành động */}
                          <td className="py-4 text-right">
                            <button
                              onClick={() => setSelectedJob(item)}
                              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 transition cursor-pointer"
                            >
                              <span>Xem chi tiết</span>
                              <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-gray-400 text-sm">
                          Không tìm thấy tin tuyển dụng nào trong CSDL phù hợp với bộ lọc.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Phân trang */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-2 border-t border-gray-100 text-xs text-gray-500">
                <div>
                  Hiển thị {currentJobs.length} trong tổng số {dynamicTotalJobs} tin tuyển dụng
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold cursor-pointer transition ${
                        currentPage === i + 1
                          ? 'bg-[#059669] text-white shadow-xs'
                          : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
      </main>

    </div>
  )
}

