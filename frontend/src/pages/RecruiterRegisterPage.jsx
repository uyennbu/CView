
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
    const autoUsername =
      cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') ||
      `recruiter_${Date.now()}`

    // Tạm thời tự sinh mã số thuế 10 số ngẫu nhiên ngầm ở backend để đáp ứng schema
    const autoTaxCode = String(
      Math.floor(1000000000 + Math.random() * 9000000000)
    )

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

      setSuccess(
        'Đăng ký tài khoản Nhà tuyển dụng thành công! Đang chuyển đến trang đăng nhập...'
      )

      setTimeout(() => {
        navigate('/recruiter/login')
      }, 1500)
    } catch (err) {
      setError(
        err.message ||
          'Đăng ký Nhà tuyển dụng không thành công. Vui lòng kiểm tra lại thông tin.'
      )
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full min-w-0 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#1A241E] focus:ring-2 focus:ring-[#1A241E]/20'

  const labelClass =
    'mb-2 block text-sm font-semibold text-gray-700'

  return (
    <main className="flex min-h-[calc(100svh-100px)] w-full items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
      <div className="w-full max-w-2xl rounded-2xl border border-gray-100 bg-white p-5 shadow-xl sm:p-7 lg:p-8">

        {/* Tiêu đề */}
        <div className="mb-6 text-center sm:mb-8">
          <div className="mb-3 inline-flex items-center rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#1A241E]">
            Đăng Ký Tuyển Dụng
          </div>

          <h1 className="break-words text-2xl font-extrabold leading-tight text-[#1A241E] sm:text-3xl">
            Tạo tài khoản Doanh nghiệp
          </h1>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-gray-600">
            Đăng tin tuyển dụng và kết nối nhanh chóng với các ứng viên phù hợp
          </p>
        </div>

        {/* Thông báo lỗi */}
        {error && (
          <div
            role="alert"
            className="mb-5 break-words rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-relaxed text-red-700"
          >
            {error}
          </div>
        )}

        {/* Thông báo thành công */}
        {success && (
          <div
            role="status"
            className="mb-5 break-words rounded-xl border border-green-200 bg-green-50 p-3 text-sm leading-relaxed text-green-700"
          >
            {success}
          </div>
        )}

        {/* Form đăng ký */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Họ tên và giới tính */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

            <div className="min-w-0 sm:col-span-2">
              <label htmlFor="fullName" className={labelClass}>
                Họ và tên *
              </label>

              <input
                id="fullName"
                type="text"
                required
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="VD: Nguyễn Tuyển Dụng"
                className={inputClass}
              />
            </div>

            <div className="min-w-0">
              <label htmlFor="gender" className={labelClass}>
                Giới tính
              </label>

              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className={inputClass}
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          {/* Email và mật khẩu */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div className="min-w-0">
              <label htmlFor="email" className={labelClass}>
                Email công vụ *
              </label>

              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hr@congty.com"
                className={inputClass}
              />
            </div>

            <div className="min-w-0">
              <label htmlFor="password" className={labelClass}>
                Mật khẩu *
              </label>

              <input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>
          </div>

          {/* Số điện thoại và chức vụ */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div className="min-w-0">
              <label htmlFor="phoneNumber" className={labelClass}>
                Số điện thoại *
              </label>

              <input
                id="phoneNumber"
                type="tel"
                required
                autoComplete="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="VD: 0912345678"
                className={inputClass}
              />
            </div>

            <div className="min-w-0">
              <label htmlFor="jobTitle" className={labelClass}>
                Chức vụ / Vị trí *
              </label>

              <input
                id="jobTitle"
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="VD: HR Manager, Lead Recruiter"
                className={inputClass}
              />
            </div>
          </div>

          {/* Tên công ty */}
          <div className="min-w-0">
            <label htmlFor="companyName" className={labelClass}>
              Tên công ty / Doanh nghiệp *
            </label>

            <input
              id="companyName"
              type="text"
              required
              autoComplete="organization"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="VD: Cty Cổ Phần Công Nghệ CView"
              className={inputClass}
            />
          </div>

          {/* Nút đăng ký */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-[#1A241E] px-4 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#1E5631] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? 'Đang tạo hồ sơ doanh nghiệp...'
              : 'Đăng ký Tuyển dụng'}
          </button>
        </form>

        {/* Điều hướng */}
        <div className="mt-6 space-y-4 text-center text-sm text-gray-600">
          <p>
            Đã có tài khoản Nhà tuyển dụng?{' '}
            <Link
              to="/recruiter/login"
              className="font-bold text-[#1A241E] transition hover:text-[#1E5631] hover:underline"
            >
              Đăng nhập ngay
            </Link>
          </p>

          <div className="border-t border-gray-100 pt-4">
            <Link
              to="/"
              className="inline-block text-xs font-medium text-gray-500 transition hover:text-[#1A241E] sm:text-sm"
            >
              ← Quay về Trang chủ
            </Link>
          </div>
        </div>

      </div>
    </main>
  )
}
