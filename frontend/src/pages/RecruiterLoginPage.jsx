import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../services/api'

export default function RecruiterLoginPage() {
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
      const data = await apiRequest('/auth/recruiter/login', {
        method: 'POST',
        body: JSON.stringify({
          username_or_email: usernameOrEmail.trim(),
          password: password,
        }),
      })

      await login(data)
      alert('Đăng nhập Nhà tuyển dụng thành công!')
      navigate('/recruiter/dashboard')
    } catch (err) {
      setError(err.message || 'Đăng nhập Nhà tuyển dụng không thành công. Vui lòng kiểm tra lại thông tin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-100px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
        <div className="mb-6 text-center">
          <div className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-gray-100 text-[#1A241E] mb-2">
            Cổng Tuyển Dụng
          </div>
          <h2 className="text-2xl font-bold text-[#1A241E]">Đăng nhập Nhà tuyển dụng</h2>
          <p className="mt-2 text-sm text-gray-600">
            Quản lý tin tuyển dụng và tiếp cận ứng viên tiềm năng cùng CView
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
              Email công vụ hoặc Tên đăng nhập
            </label>
            <input
              type="text"
              required
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              placeholder="VD: recruiter01@techcorp.vn"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1A241E] focus:outline-none focus:ring-2 focus:ring-[#1A241E]/20"
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
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1A241E] focus:outline-none focus:ring-2 focus:ring-[#1A241E]/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#1A241E] py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#1E5631] disabled:opacity-50"
          >
            {loading ? 'Đang xác thực...' : 'Đăng nhập Tuyển dụng'}
          </button>
        </form>

        <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
          💼 <span className="font-semibold">Tài khoản mẫu:</span> recruiter01@techcorp.vn / Password@123
        </div>

        <div className="mt-6 text-center text-sm text-gray-600 space-y-2">
          <p>
            Doanh nghiệp chưa có tài khoản?{' '}
            <Link to="/recruiter/register" className="font-semibold text-[#1E5631] hover:underline">
              Đăng ký ngay
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

