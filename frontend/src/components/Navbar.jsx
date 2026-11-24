import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logoCView from '../assets/logo-cview.png'

const navItems = [
  { label: 'Trang chủ', path: '/' },
  { label: 'Phân tích CV', path: '/cv-analysis' },
  { label: 'Tìm việc', path: '/jobs' },
]

export default function Navbar() {
  const { user, isAuthenticated, loading, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Ẩn Navbar chung khi đang ở trang Dashboard chuyên biệt của Nhà tuyển dụng
  if (
    location.pathname === '/recruiter/dashboard'
    || location.pathname.startsWith('/recruiter/dashboard/')
  ) {
    return null
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="relative z-50 w-full bg-transparent">
      <nav
        aria-label="Điều hướng chính"
        className="
          mx-auto flex w-full max-w-[1440px]
          items-center justify-between gap-3
          px-4 py-3 sm:px-6 sm:py-4
          lg:px-8 lg:py-5 xl:px-14
        "
      >
        {/* Logo */}
        <Link
          to="/"
          onClick={closeMenu}
          aria-label="CView - Trang chủ"
          className="shrink-0"
        >
          <img
            src={logoCView}
            alt="CView"
            className="
              h-auto w-[105px] object-contain
              sm:w-[120px] lg:w-[135px]
            "
          />
        </Link>

        {/* Navigation Items */}
        <div className="flex items-center gap-10">
          {navItems.map((item) => {
            const isActive = item.path === '/'
              ? location.pathname === '/'
              : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
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
          {loading ? null : isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* Avatar + Tên hiển thị từ CSDL */}
              <Link
                to={user?.roles?.includes('RECRUITER') ? '/recruiter/dashboard' : '/candidate/account'}
                className="flex items-center gap-2 rounded-full bg-[#E6FADD] px-4 py-2 border border-[#4CAF50]/30 shadow-sm transition hover:bg-[#d8f5cb]"
              >
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
              </Link>

              {/* Nút Đăng xuất */}
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile / Tablet Navigation */}
      <div
        id="mobile-navigation"
        className={`
          absolute left-0 right-0 top-full
          border-t border-[#1E5631]/10
          bg-[#FEFFFA] shadow-lg
          transition-all duration-200 xl:hidden
          ${
            isMenuOpen
              ? 'visible translate-y-0 opacity-100'
              : 'invisible -translate-y-2 opacity-0 pointer-events-none'
          }
        `}
      >
        <div className="
          mx-auto flex w-full max-w-[1440px]
          flex-col gap-2 px-4 pb-5 pt-3
          sm:px-6 lg:px-8
        ">
          {/* Navigation Links */}
          <div className="flex flex-col gap-1">
            {renderNavLinks(true)}
          </div>

          <div className="my-2 border-t border-[#1E5631]/10" />

          {/* Account Actions */}
          {renderAccountActions(true)}
        </div>
      </div>
    </header>
  )
}
