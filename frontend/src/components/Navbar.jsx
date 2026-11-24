
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logoCView from '../assets/logo-cview.png'

const navItems = [
  { label: 'Trang chủ', path: '/' },
  { label: 'Phân tích CV', path: '/cv-analysis' },
  { label: 'Tìm việc', path: '/jobs' },
]

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const isRecruiter = user?.roles?.includes('RECRUITER')

  const accountPath = isRecruiter
    ? '/recruiter/dashboard'
    : '/candidate/account'

  // Đóng menu khi chuyển trang
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  const closeMenu = () => setIsMenuOpen(false)

  const handleLogout = () => {
    closeMenu()
    logout()
  }

  const renderNavLinks = (mobile = false) =>
    navItems.map((item) => {
      const isActive = location.pathname === item.path

      return (
        <Link
          key={item.label}
          to={item.path}
          onClick={closeMenu}
          aria-current={isActive ? 'page' : undefined}
          className={`
            relative rounded-lg py-2 text-base font-semibold
            transition-colors duration-200
            ${mobile ? 'block w-full px-4' : 'whitespace-nowrap'}
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
          <Link
            to={accountPath}
            onClick={closeMenu}
            className="
              flex min-w-0 items-center gap-2 rounded-full
              border border-[#4CAF50]/30 bg-[#E6FADD]
              px-3 py-2 shadow-sm transition
              hover:bg-[#d8f5cb] sm:px-4
            "
          >
            <div className="
              flex h-9 w-9 shrink-0 items-center justify-center
              rounded-full bg-[#1E5631] text-sm font-bold
              uppercase text-white
            ">
              {(user?.full_name || user?.username || 'U')[0]}
            </div>

            <div className="min-w-0 text-left">
              <div className="
                max-w-[150px] truncate text-sm font-bold
                leading-tight text-[#1E5631]
              ">
                {user?.full_name || user?.username}
              </div>

              <div className="text-[11px] font-medium text-gray-500">
                {user?.roles?.join(', ') || 'Ứng viên'}
              </div>
            </div>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="
              rounded-lg border border-red-200 bg-red-50
              px-4 py-2.5 text-sm font-semibold text-red-600
              transition-colors hover:bg-red-100
            "
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
              : 'items-center gap-2 xl:gap-3'
          }
        `}
      >
        <Link
          to="/login"
          onClick={closeMenu}
          className="
            rounded-lg border border-[#1E5631]
            px-4 py-3 text-center text-sm font-semibold
            text-[#1A241E] transition-colors
            hover:bg-[#E6FADD] xl:px-5
          "
        >
          Đăng nhập
        </Link>

        <Link
          to="/register"
          onClick={closeMenu}
          className="
            rounded-lg bg-[#FF4B6E] px-4 py-3
            text-center text-sm font-semibold text-white
            transition-colors hover:bg-[#ed3d60] xl:px-5
          "
        >
          Đăng ký
        </Link>

        <Link
          to="/recruiter/login"
          onClick={closeMenu}
          className="
            rounded-lg bg-[#1A241E] px-4 py-3
            text-center text-sm font-semibold !text-white
            transition-colors hover:bg-[#1E5631] xl:px-5
          "
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

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-5 xl:flex 2xl:gap-10">
          {renderNavLinks()}
        </div>

        {/* Desktop Account Actions */}
        <div className="hidden shrink-0 items-center xl:flex">
          {renderAccountActions()}
        </div>

        {/* Mobile / Tablet Menu Button */}
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
            xl:hidden
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
