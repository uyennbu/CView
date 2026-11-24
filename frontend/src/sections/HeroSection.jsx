import { Link } from 'react-router-dom'
import heroMascot from '../assets/mascot/characters/hero-mascot.png'
import sparkle from '../assets/mascot/decorations/sparkle.png'
import searchIcon from '../assets/mascot/decorations/search-icon.png'
import documentIcon from '../assets/mascot/decorations/document-icon.png'
import briefcaseIcon from '../assets/mascot/decorations/briefcase-icon.png'
import ScrollReveal from '../components/ScrollReveal'

const benefits = [
  {
    id: 'explore',
    title: 'Khám phá cơ hội',
    description: 'công việc phù hợp',
    bgClass: 'bg-[#DFF9D6] text-[#1A8D3C]',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4.2 4.2" />
      </svg>
    ),
  },
  {
    id: 'resume',
    title: 'Hoàn thiện CV',
    description: 'chuyên nghiệp',
    bgClass: 'bg-[#FFF5BE] text-[#8F7C00]',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v5h5" />
        <path d="M9 13h6" />
        <path d="M9 17h4" />
      </svg>
    ),
  },
  {
    id: 'career',
    title: 'Phát triển sự nghiệp',
    description: 'bền vững',
    bgClass: 'bg-[#E2F2FF] text-[#1D73D8]',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m4 14 5-5 4 4 7-7" />
        <path d="M15 6h5v5" />
        <path d="M5 20v-3" />
        <path d="M10 20v-5" />
        <path d="M15 20v-4" />
        <path d="M20 20v-8" />
      </svg>
    ),
  },
]

function HeroSection() {
  return (
    <section
      id="home"
      className="relative isolate w-full overflow-hidden bg-transparent"
    >
      <div className="mx-auto grid w-full max-w-[1160px] grid-cols-1 items-center gap-6 px-6 pb-8 pt-2 sm:px-8 sm:pb-10 sm:pt-3 md:grid-cols-[1.15fr_0.85fr] md:gap-6 lg:gap-10 lg:px-12 lg:pb-12 lg:pt-4">

        {/* Left content */}
        <ScrollReveal
          direction="left"
          className="relative z-10 mx-auto w-full max-w-[650px] text-center md:mx-0 md:text-left"
        >
          <h1 className="text-[clamp(1.6rem,3.3vw,2.75rem)] font-extrabold leading-[1.2] tracking-tight text-[#1A241E]">
            <span className="sm:whitespace-nowrap">KẾT NỐI CÔNG VIỆC MƠ ƯỚC</span>
            <br />
            BỨT PHÁ SỰ NGHIỆP
          </h1>

          <p className="mx-auto mt-3.5 max-w-[520px] text-xs leading-relaxed text-[#1A241E] sm:text-sm md:mx-0 md:text-[15.5px]">
            Tìm kiếm công việc phù hợp dựa trên CV của bạn, chấm
            điểm độ phù hợp trên kỹ năng, kinh nghiệm
          </p>

          {/* Benefits */}
          <div className="mx-auto mt-5 flex max-w-[560px] flex-wrap justify-center gap-x-5 gap-y-3 md:mx-0 md:justify-start">
            {benefits.map((benefit) => (
              <div
                key={benefit.id}
                className="flex min-w-0 items-center gap-2 text-left"
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-xs sm:h-9 sm:w-9 ${benefit.bgClass}`}
                >
                  {benefit.icon}
                </span>

                <div className="text-[11px] leading-snug text-[#1A241E] sm:text-xs">
                  <p className="font-bold">{benefit.title}</p>
                  <p className="font-medium text-[#26352B]">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Main CTA */}
          <Link
            to="/cv-analysis"
            className="mx-auto mt-6 inline-flex max-w-full items-center justify-center gap-3 rounded-2xl bg-[#FF4B5C] px-6 py-3 text-sm font-extrabold !text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#ed3d50] sm:gap-4 sm:px-7 sm:py-3.5 sm:text-base md:mx-0 md:text-[17px]"
          >
            <span>BẮT ĐẦU PHÂN TÍCH CV</span>
            <span className="text-lg leading-none sm:text-xl">⟶</span>
          </Link>

          {/* Feature tags */}
          <div className="mt-3 flex flex-wrap justify-center gap-2.5 sm:gap-3 md:justify-start">
            {['Chấm điểm', 'Góp ý', 'Đề xuất việc làm'].map((item) => (
              <span
                key={item}
                className="rounded-xl bg-[#43A948] px-3.5 py-1.5 text-[11px] font-bold text-white shadow-xs sm:px-4 sm:text-xs"
              >
                {item}
              </span>
            ))}
          </div>
        </ScrollReveal>

        {/* Right mascot */}
        <ScrollReveal
          direction="right"
          delay={200}
          className="relative mx-auto flex w-full max-w-[420px] items-center justify-center md:-translate-y-2"
        >
          {/* Background glow */}
          <div className="absolute h-[200px] w-[200px] rounded-full bg-gradient-to-br from-[#E6FADD] to-[#F9FACA] blur-2xl sm:h-[260px] sm:w-[260px] md:h-[310px] md:w-[310px] lg:h-[360px] lg:w-[360px]" />

          {/* Main mascot */}
          <img
            src={heroMascot}
            alt="Mascot tắc kè CView cầm CV"
            className="relative z-10 w-full max-w-[230px] object-contain drop-shadow-sm sm:max-w-[290px] md:max-w-[340px] lg:max-w-[390px]"
          />

          {/* Decorations */}
          <img
            src={sparkle}
            alt=""
            aria-hidden="true"
            className="absolute left-[10%] top-[6%] z-20 w-8 object-contain sm:w-10 md:w-12"
          />

          <img
            src={searchIcon}
            alt=""
            aria-hidden="true"
            className="absolute left-[2%] top-[48%] z-20 w-7 object-contain sm:w-9 md:w-10"
          />

          <img
            src={documentIcon}
            alt=""
            aria-hidden="true"
            className="absolute right-[4%] top-[34%] z-20 w-7 object-contain sm:w-9 md:w-10"
          />

          <img
            src={briefcaseIcon}
            alt=""
            aria-hidden="true"
            className="absolute bottom-[10%] left-0 z-20 w-8 object-contain sm:w-10 md:w-11"
          />

          <span className="absolute right-4 top-6 z-20 text-xl text-[#F5D34F] sm:text-2xl md:top-10 md:text-3xl">
            ✦
          </span>

          <span className="absolute bottom-6 left-4 z-20 text-xl text-[#4CAF50] sm:text-2xl md:bottom-10">
            ✦
          </span>
        </ScrollReveal>
      </div>
    </section>
  )
}

export default HeroSection
