import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logoCView from '../assets/logo-cview.png'

const navItems = [
  { label: 'Trang chủ', path: '/' },
  { label: 'Phân tích CV', path: '/#analysis' },
  { label: 'Tìm việc', path: '/#jobs' },
]

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const location = useLocation()

  return (
    <header className="w-full bg-transparent">
      <nav className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-5 lg:px-14">
        {/* Logo */}
        <Link to="/" className="shrink-0">
          <img
            src={logoCView}
            alt="CView"
            className="w-[135px] h-auto object-contain"
          />
        </Link>

        {/* Navigation Items */}
        <div className="flex items-center gap-10">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`relative py-2 text-[18px] font-semibold transition-colors ${
                  isActive
                    ? 'text-[#1E5631]'
                    : 'text-[#1A241E] hover:text-[#4CAF50]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 h-1 w-full rounded-full bg-[#4CAF50]" />
                )}
              </Link>
            )
          })}
        </div>

        {/* Account Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* Avatar + Tên hiển thị từ CSDL */}
              <div className="flex items-center gap-2 rounded-full bg-[#E6FADD] px-4 py-2 border border-[#4CAF50]/30 shadow-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1E5631] text-sm font-bold text-white uppercase">
                  {(user?.full_name || user?.username || 'U')[0]}
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-[#1E5631] leading-tight">
                    {user?.full_name || user?.username}
                  </div>
                  <div className="text-[11px] text-gray-500 font-medium">
                    {user?.roles?.join(', ') || 'Ứng viên'}
                  </div>
                </div>
              </div>

              {/* Nút Đăng xuất */}
              <button
                onClick={logout}
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <>
              {/* Khi chưa đăng nhập */}
              <Link
                to="/login"
                className="rounded-lg border border-[#1E5631] px-6 py-3 text-[16px] font-semibold text-[#1A241E] transition-colors hover:bg-[#E6FADD]"
              >
                Đăng nhập
              </Link>

              <Link
                to="/register"
                className="rounded-lg bg-[#FF4B6E] px-6 py-3 text-[16px] font-semibold text-white transition-colors hover:bg-[#ed3d60]"
              >
                Đăng ký
              </Link>

              <a
                href="/recruiter/login"
                className="rounded-lg bg-[#1A241E] px-6 py-3 text-[16px] font-semibold !text-white transition-colors hover:bg-[#1E5631]"
              >
                Tuyển dụng
              </a>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
