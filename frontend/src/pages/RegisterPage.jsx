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
      const suggested = val.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '')
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

    const finalUsername = username.trim() || email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '')

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

      setSuccess('Đăng ký tài khoản thành công! Đang chuyển đến trang đăng nhập...')
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (err) {
      setError(err.message || 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-100px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-[#1E5631]">Đăng ký Ứng viên</h2>
          <p className="mt-2 text-sm text-gray-600">
            Tạo tài khoản để bắt đầu chấm điểm CV và nhận gợi ý việc làm
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Họ và tên
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="VD: Nguyễn Văn An"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#4CAF50] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Địa chỉ Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="VD: nguyenvana@gmail.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#4CAF50] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên đăng nhập <span className="text-xs text-gray-400 font-normal">(từ 3 ký tự)</span>
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="VD: nguyenvana"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#4CAF50] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu <span className="text-xs text-gray-400 font-normal">(tối thiểu 6 ký tự)</span>
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#4CAF50] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#FF4B6E] py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#ed3d60] disabled:opacity-50"
          >
            {loading ? 'Đang khởi tạo tài khoản...' : 'Đăng ký ngay'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 space-y-2">
          <p>
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-semibold text-[#1E5631] hover:underline">
              Đăng nhập
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

