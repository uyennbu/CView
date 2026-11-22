
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../services/api'

export default function LoginPage() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await apiRequest('/auth/candidate/login', {
        method: 'POST',
        body: JSON.stringify({
          username_or_email: usernameOrEmail.trim(),
          password: password,
        }),
      })

      await login(data)
      alert('Đăng nhập thành công!')
      navigate('/')
    } catch (err) {
      setError(
        err.message ||
          'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-[calc(100svh-100px)] w-full items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-5 shadow-xl sm:p-8">
        {/* Tiêu đề */}
        <div className="mb-6 text-center sm:mb-8">
          <h1 className="text-2xl font-extrabold leading-tight text-[#1E5631] sm:text-3xl">
            Đăng nhập Ứng viên
          </h1>

          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-gray-600 sm:max-w-none">
            Khám phá cơ hội việc làm và chấm điểm CV cùng CView
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

        {/* Form đăng nhập */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email hoặc tên đăng nhập */}
          <div className="min-w-0">
            <label
              htmlFor="usernameOrEmail"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Email hoặc Tên đăng nhập
            </label>

            <input
              id="usernameOrEmail"
              type="text"
              required
              autoComplete="username"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              placeholder="VD: candidate01@gmail.com"
              className="w-full min-w-0 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20"
            />
          </div>

          {/* Mật khẩu */}
          <div className="min-w-0">
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Mật khẩu
            </label>

            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full min-w-0 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20"
            />
          </div>

          {/* Nút đăng nhập */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#1E5631] px-4 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#2b7a46] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>

        {/* Tài khoản mẫu */}
        <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-3 text-xs leading-relaxed text-gray-500 sm:text-sm">
          <p className="font-semibold text-[#1E5631]">
            Tài khoản mẫu
          </p>

          <p className="mt-1 break-all">
            Email: candidate01@gmail.com
          </p>

          <p className="break-all">
            Mật khẩu: Password@123
          </p>
        </div>

        {/* Điều hướng */}
        <div className="mt-6 space-y-4 text-center text-sm text-gray-600">
          <p>
            Chưa có tài khoản?{' '}
            <Link
              to="/register"
              className="font-bold text-[#FF4B6E] transition hover:underline"
            >
              Đăng ký ngay
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
