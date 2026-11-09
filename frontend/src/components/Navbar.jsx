import logoCView from '../assets/logo-cview.png'
const navItems = [
  { label: 'Trang chủ', href: '#home', active: true },
  { label: 'Phân tích CV', href: '#analysis', active: false },
  { label: 'Tìm việc', href: '#jobs', active: false },
]

function Navbar() {
  return (
    <header className="w-full bg-transparent">
      <nav className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-5 lg:px-14">

        {/* Logo */}
<a href="#home" className="shrink-0">
  <img
    src={logoCView}
    alt="CView"
    className="w-[135px] h-auto object-contain"
  />
</a>

        {/* Navigation */}
        <div className="flex items-center gap-10">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`relative py-2 text-[18px] font-semibold transition-colors ${
                item.active
                  ? 'text-[#1E5631]'
                  : 'text-[#1A241E] hover:text-[#4CAF50]'
              }`}
            >
              {item.label}

              {item.active && (
                <span className="absolute bottom-0 left-0 h-1 w-full rounded-full bg-[#4CAF50]" />
              )}
            </a>
          ))}
        </div>

        {/* Account Actions */}
        <div className="flex items-center gap-3">
          <a
            href="/login"
            className="rounded-lg border border-[#1E5631] px-6 py-3 text-[16px] font-semibold text-[#1A241E] transition-colors hover:bg-[#E6FADD]"
          >
            Đăng nhập
          </a>

          <a
            href="/register"
            className="rounded-lg bg-[#FF4B6E] px-6 py-3 text-[16px] font-semibold text-white transition-colors hover:bg-[#ed3d60]"
          >
            Đăng ký
          </a>

          <a
  href="/recruiter/login"
  className="rounded-lg bg-[#1A241E] px-6 py-3 text-[16px] font-semibold !text-white transition-colors hover:bg-[#1E5631]"
>
  Tuyển dụng
</a>
        </div>

      </nav>
    </header>
  )
}

export default Navbar