import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../services/api'

export default function RecruiterRegisterPage() {
  const [fullName, setFullName] = useState('')
  const [gender, setGender] = useState('Nam')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const cleanEmail = email.trim().toLowerCase()
    const autoUsername = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || `recruiter_${Date.now()}`
    // Tạm thời tự sinh mã số thuế 10 số ngẫu nhiên ngầm ở backend để đáp ứng schema
    const autoTaxCode = String(Math.floor(1000000000 + Math.random() * 9000000000))

    try {
      await apiRequest('/auth/recruiter/register', {
        method: 'POST',
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: cleanEmail,
          password: password,
          username: autoUsername,
          work_email: cleanEmail,
          phone_number: phoneNumber.trim() || null,
          job_title: jobTitle.trim(),
          company_name: companyName.trim(),
          tax_code: autoTaxCode,
          industry: 'Công nghệ Thông tin',
          street_address: 'Chưa cập nhật',
          city: 'TP. Hồ Chí Minh',
        }),
      })

      setSuccess('Đăng ký tài khoản Nhà tuyển dụng thành công! Đang chuyển đến trang đăng nhập...')
      setTimeout(() => {
        navigate('/recruiter/login')
      }, 1500)
    } catch (err) {
      setError(err.message || 'Đăng ký Nhà tuyển dụng không thành công. Vui lòng kiểm tra lại thông tin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-100px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
        <div className="mb-6 text-center">
          <div className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-gray-100 text-[#1A241E] mb-2">
            Đăng Ký Tuyển Dụng
          </div>
          <h2 className="text-2xl font-bold text-[#1A241E]">Tạo tài khoản Doanh nghiệp</h2>
          <p className="mt-2 text-sm text-gray-600">
            Đăng tin tuyển dụng và kết nối nhanh chóng với các ứng viên phù hợp
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700 border border-green-200">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Họ tên & Giới tính */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="VD: Nguyễn Tuyển Dụng"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1A241E] focus:outline-none focus:ring-2 focus:ring-[#1A241E]/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giới tính
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1A241E] focus:outline-none focus:ring-2 focus:ring-[#1A241E]/20"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          {/* Email & Mật khẩu */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email công vụ *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hr@congty.com"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1A241E] focus:outline-none focus:ring-2 focus:ring-[#1A241E]/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1A241E] focus:outline-none focus:ring-2 focus:ring-[#1A241E]/20"
              />
            </div>
          </div>

          {/* Số điện thoại & Chức vụ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại *
              </label>
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="VD: 0912345678"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1A241E] focus:outline-none focus:ring-2 focus:ring-[#1A241E]/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chức vụ / Vị trí *
              </label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="VD: HR Manager, Lead Recruiter"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1A241E] focus:outline-none focus:ring-2 focus:ring-[#1A241E]/20"
              />
            </div>
          </div>

          {/* Tên công ty (Chiếm toàn bộ chiều rộng) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên công ty / Doanh nghiệp *
            </label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="VD: Cty Cổ Phần Công Nghệ CView"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1A241E] focus:outline-none focus:ring-2 focus:ring-[#1A241E]/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#1A241E] py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#1E5631] disabled:opacity-50 mt-2"
          >
            {loading ? 'Đang tạo hồ sơ doanh nghiệp...' : 'Đăng ký Tuyển dụng'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 space-y-2">
          <p>
            Đã có tài khoản Nhà tuyển dụng?{' '}
            <Link to="/recruiter/login" className="font-semibold text-[#1A241E] hover:underline">
              Đăng nhập ngay
            </Link>
          </p>
          <p>
            <Link to="/" className="text-gray-500 hover:text-[#1A241E] text-xs">
              ← Quay về Trang chủ
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
