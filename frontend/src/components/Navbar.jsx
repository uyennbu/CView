import { useState } from 'react'
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
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Ẩn Navbar chung khi đang ở trang Dashboard chuyên biệt của Nhà tuyển dụng
  if (
    location.pathname === '/recruiter/dashboard'
    || location.pathname.startsWith('/recruiter/dashboard/')
  ) {
    return null
  }

  const isRecruiter = user?.roles?.includes('RECRUITER')
  const accountPath = isRecruiter
    ? '/recruiter/dashboard'
    : '/candidate/account'

  const closeMenu = () => setIsMenuOpen(false)

  const handleLogout = () => {
    closeMenu()
    logout()
    navigate('/login')
  }

  const renderNavLinks = (mobile = false) =>
    navItems.map((item) => {
      const isActive = item.path === '/'
        ? location.pathname === '/'
        : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)

      return (
        <Link
          key={item.label}
          to={item.path}
          onClick={closeMenu}
          aria-current={isActive ? 'page' : undefined}
          className={`
            relative py-2 font-semibold transition-colors
            ${mobile ? 'block w-full rounded-lg px-4 text-base' : 'whitespace-nowrap text-[18px]'}
            ${
              isActive
                ? 'text-[#1E5631]'
                : 'text-[#1A241E] hover:text-[#4CAF50]'
            }
          `}
        >
          {item.label}

          {isActive && (
            <span
              className={`
                absolute rounded-full bg-[#4CAF50]
                ${
                  mobile
                    ? 'bottom-1 left-4 h-0.5 w-8'
                    : 'bottom-0 left-0 h-1 w-full'
                }
              `}
            />
          )}
        </Link>
      )
    })

  const renderAccountActions = (mobile = false) => {
    if (loading) {
      return null
    }

    if (isAuthenticated) {
      return (
        <div
          className={`
            flex
            ${
              mobile
                ? 'w-full flex-col items-stretch gap-3'
                : 'items-center gap-3'
            }
          `}
        >
          {/* Avatar + Tên hiển thị từ CSDL */}
          <Link
            to={accountPath}
            onClick={closeMenu}
            className="flex items-center gap-2 rounded-full bg-[#E6FADD] px-4 py-2 border border-[#4CAF50]/30 shadow-sm transition hover:bg-[#d8f5cb]"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1E5631] text-sm font-bold text-white uppercase">
              {(user?.full_name || user?.username || 'U')[0]}
            </div>
            <div className="min-w-0 text-left">
              <div className="truncate text-sm font-bold text-[#1E5631] leading-tight">
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
      )
    }

    return (
      <div
        className={`
          flex
          ${
            mobile
              ? 'w-full flex-col items-stretch gap-2'
              : 'items-center gap-3'
          }
        `}
      >
        {/* Khi chưa đăng nhập */}
        <Link
          to="/login"
          onClick={closeMenu}
          className={`rounded-lg border border-[#1E5631] font-semibold text-[#1A241E] transition-colors hover:bg-[#E6FADD] ${
            mobile ? 'px-4 py-3 text-center text-sm' : 'px-6 py-3 text-[16px]'
          }`}
        >
          Đăng nhập
        </Link>

        <Link
          to="/register"
          onClick={closeMenu}
          className={`rounded-lg bg-[#FF4B6E] font-semibold text-white transition-colors hover:bg-[#ed3d60] ${
            mobile ? 'px-4 py-3 text-center text-sm' : 'px-6 py-3 text-[16px]'
          }`}
        >
          Đăng ký
        </Link>

        <Link
          to="/recruiter/login"
          onClick={closeMenu}
          className={`rounded-lg bg-[#1A241E] font-semibold !text-white transition-colors hover:bg-[#1E5631] ${
            mobile ? 'px-4 py-3 text-center text-sm' : 'px-6 py-3 text-[16px]'
          }`}
        >
          Tuyển dụng
        </Link>
      </div>
    )
  }

  return (
    <header className="relative z-50 w-full bg-transparent">
      <nav
        aria-label="Điều hướng chính"
        className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-5 lg:px-14"
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
            className="w-[135px] h-auto object-contain"
          />
        </Link>

        {/* Navigation Items (Ngăn ngang như cũ trên màn hình >= md) */}
        <div className="hidden md:flex items-center gap-10">
          {renderNavLinks(false)}
        </div>

        {/* Account Actions (Nằm ngang như cũ trên màn hình >= md) */}
        <div className="hidden md:flex items-center gap-3">
          {renderAccountActions(false)}
        </div>

        {/* Nút Menu Hamburger (Chỉ hiện khi màn hình bị nhỏ < md) */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label={isMenuOpen ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          className="
            flex h-11 w-11 shrink-0 items-center justify-center
            rounded-xl border border-[#1E5631]/20
            bg-white text-[#1E5631] shadow-sm
            transition-colors hover:bg-[#E6FADD]
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-[#4CAF50] focus-visible:ring-offset-2
            md:hidden
          "
        >
          {isMenuOpen ? (
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
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
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

      {/* Menu xổ xuống khi màn hình nhỏ (< md) */}
      <div
        id="mobile-navigation"
        className={`
          absolute left-0 right-0 top-full
          border-t border-[#1E5631]/10
          bg-[#FEFFFA] shadow-lg
          transition-all duration-200 md:hidden
          ${
            isMenuOpen
              ? 'visible translate-y-0 opacity-100'
              : 'invisible -translate-y-2 opacity-0 pointer-events-none'
          }
        `}
      >
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-2 px-6 pb-5 pt-3">
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
