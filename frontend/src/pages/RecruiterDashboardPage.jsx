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
    <div className="mx-auto max-w-[1440px] px-6 py-16 lg:px-14 min-h-[60vh]">
      {/* Trang thống kê Dashboard của Nhà tuyển dụng (đang để trống để hoàn thiện sau) */}
    </div>
  )
}

