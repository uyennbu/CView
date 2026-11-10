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
      navigate('/')
    } catch (err) {
      setError(err.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-100px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-[#1E5631]">Đăng nhập Ứng viên</h2>
          <p className="mt-2 text-sm text-gray-600">
            Khám phá cơ hội việc làm và chấm điểm CV cùng CView
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email hoặc Tên đăng nhập
            </label>
            <input
              type="text"
              required
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              placeholder="VD: candidate01@gmail.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#4CAF50] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#4CAF50] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#1E5631] py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#2b7a46] disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
          💡 <span className="font-semibold">Tài khoản mẫu:</span> candidate01@gmail.com / Password@123
        </div>

        <div className="mt-6 text-center text-sm text-gray-600 space-y-2">
          <p>
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-semibold text-[#FF4B6E] hover:underline">
              Đăng ký ngay
            </Link>
          </p>
          <p>
            <Link to="/" className="text-gray-500 hover:text-[#1E5631] text-xs">
              ← Quay về Trang chủ
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

