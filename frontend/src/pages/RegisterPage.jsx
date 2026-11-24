
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../services/api'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  // Tự động gợi ý username từ phần đầu email nếu người dùng chưa nhập
  const handleEmailChange = (val) => {
    setEmail(val)

    if (!username && val.includes('@')) {
      const suggested = val
        .split('@')[0]
        .replace(/[^a-zA-Z0-9_]/g, '')

      if (suggested.length >= 3) {
        setUsername(suggested)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const finalUsername =
      username.trim() ||
      email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '')

    try {
      await apiRequest('/auth/candidate/register', {
        method: 'POST',
        body: JSON.stringify({
          full_name: fullName.trim(),
          username: finalUsername,
          email: email.trim().toLowerCase(),
          password: password,
        }),
      })

      alert('Đăng ký thành công!')
      navigate('/login')
    } catch (err) {
      setError(
        err.message ||
          'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.'
      )
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full min-w-0 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20'

  const labelClass =
    'mb-2 block text-sm font-semibold text-gray-700'

  return (
    <main className="flex min-h-[calc(100svh-100px)] w-full items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-5 shadow-xl sm:p-8">

        {/* Tiêu đề */}
        <div className="mb-6 text-center sm:mb-8">
          <h1 className="text-2xl font-extrabold leading-tight text-[#1E5631] sm:text-3xl">
            Đăng ký Ứng viên
          </h1>

          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-gray-600 sm:max-w-none">
            Tạo tài khoản để bắt đầu chấm điểm CV và nhận gợi ý việc làm
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

          {/* Họ và tên */}
          <div className="min-w-0">
            <label htmlFor="fullName" className={labelClass}>
              Họ và tên
            </label>

            <input
              id="fullName"
              type="text"
              required
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="VD: Nguyễn Văn An"
              className={inputClass}
            />
          </div>

          {/* Email */}
          <div className="min-w-0">
            <label htmlFor="email" className={labelClass}>
              Địa chỉ Email
            </label>

            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="VD: nguyenvana@gmail.com"
              className={inputClass}
            />
          </div>

          {/* Tên đăng nhập */}
          <div className="min-w-0">
            <label htmlFor="username" className={labelClass}>
              Tên đăng nhập{' '}
              <span className="text-xs font-normal text-gray-400">
                (từ 3 ký tự)
              </span>
            </label>

            <input
              id="username"
              type="text"
              required
              minLength={3}
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="VD: nguyenvana"
              className={inputClass}
            />
          </div>

          {/* Mật khẩu */}
          <div className="min-w-0">
            <label htmlFor="password" className={labelClass}>
              Mật khẩu{' '}
              <span className="text-xs font-normal text-gray-400">
                (tối thiểu 6 ký tự)
              </span>
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

          {/* Nút đăng ký */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#FF4B6E] px-4 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#ed3d60] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Đang khởi tạo tài khoản...' : 'Đăng ký ngay'}
          </button>
        </form>

        {/* Điều hướng */}
        <div className="mt-6 space-y-4 text-center text-sm text-gray-600">
          <p>
            Đã có tài khoản?{' '}
            <Link
              to="/login"
              className="font-bold text-[#1E5631] transition hover:underline"
            >
              Đăng nhập
            </Link>
          </p>

          <div className="border-t border-gray-100 pt-4">
            <Link
              to="/"
              className="inline-block text-xs font-medium text-gray-500 transition hover:text-[#1E5631] sm:text-sm"
            >
              ← Quay về Trang chủ
            </Link>
          </div>
        </div>

      </div>
    </main>
  )
}
