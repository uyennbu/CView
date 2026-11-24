
import { Link } from 'react-router-dom'
import heroMascot from '../assets/mascot/characters/hero-mascot.png'
import sparkle from '../assets/mascot/decorations/sparkle.png'
import searchIcon from '../assets/mascot/decorations/search-icon.png'
import documentIcon from '../assets/mascot/decorations/document-icon.png'
import briefcaseIcon from '../assets/mascot/decorations/briefcase-icon.png'
import ScrollReveal from '../components/ScrollReveal'

const benefits = [
  {
    icon: '⌕',
    title: 'Khám phá cơ hội',
    description: 'công việc phù hợp',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: '▤',
    title: 'Hoàn thiện CV',
    description: 'chuyên nghiệp',
    color: 'bg-yellow-100 text-yellow-700',
  },
  {
    icon: '▥',
    title: 'Phát triển sự nghiệp',
    description: 'bền vững',
    color: 'bg-blue-100 text-blue-600',
  },
]

function HeroSection() {
  return (
    <section
      id="home"
      className="relative isolate w-full overflow-hidden bg-transparent"
    >
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-8 px-4 py-10 sm:px-6 sm:py-12 md:grid-cols-2 md:gap-6 lg:gap-10 lg:px-14 lg:py-16">

        {/* Left content */}
        <ScrollReveal
          direction="left"
          className="relative z-10 mx-auto w-full max-w-[590px] text-center md:mx-0 md:text-left"
        >
          <h1 className="text-[clamp(2rem,5vw,4rem)] font-extrabold leading-[1.15] tracking-tight">
            KẾT NỐI CÔNG VIỆC MƠ ƯỚC
            <br />
            BỨT PHÁ SỰ NGHIỆP
          </h1>

          <p className="mx-auto mt-5 max-w-[540px] text-sm leading-relaxed text-[#1A241E] sm:text-base md:mx-0 md:text-lg">
            Tìm kiếm công việc phù hợp dựa trên CV của bạn, chấm
            điểm độ phù hợp trên kỹ năng, kinh nghiệm
          </p>

          {/* Benefits */}
          <div className="mx-auto mt-7 flex max-w-[540px] flex-wrap justify-center gap-x-5 gap-y-4 md:mx-0 md:justify-start">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="flex min-w-0 items-center gap-2 text-left"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg font-bold ${benefit.color}`}
                >
                  {benefit.icon}
                </span>

                <div className="text-xs leading-relaxed sm:text-sm">
                  <p className="font-semibold">{benefit.title}</p>
                  <p>{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Main CTA */}
          <Link
            to="/cv-analysis"
            className="mx-auto mt-9 inline-flex max-w-full items-center justify-center gap-2 rounded-full bg-[#FF4B6E] px-5 py-3.5 text-sm font-bold !text-white shadow-sm transition hover:-translate-y-1 hover:bg-[#ed3d60] sm:gap-4 sm:px-7 sm:text-base md:mx-0 md:text-lg"
          >
            <span>BẮT ĐẦU PHÂN TÍCH CV</span>
            <span className="text-xl leading-none sm:text-2xl">⟶</span>
          </Link>

          {/* Feature tags */}
          <div className="mt-4 flex flex-wrap justify-center gap-2 sm:gap-3 md:justify-start">
            {['Chấm điểm', 'Góp ý', 'Đề xuất việc làm'].map((item) => (
              <span
                key={item}
                className="rounded-lg bg-[#4CAF50] px-3 py-1.5 text-[11px] font-bold text-white sm:px-4 sm:text-xs"
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
          className="relative mx-auto flex w-full max-w-[520px] items-center justify-center md:-translate-y-3"
        >
          {/* Background glow */}
          <div className="absolute h-[230px] w-[230px] rounded-full bg-gradient-to-br from-[#E6FADD] to-[#F9FACA] blur-2xl sm:h-[320px] sm:w-[320px] md:h-[380px] md:w-[380px] lg:h-[450px] lg:w-[450px]" />

          {/* Main mascot */}
          <img
            src={heroMascot}
            alt="Mascot tắc kè CView cầm CV"
            className="relative z-10 w-full max-w-[300px] object-contain drop-shadow-sm sm:max-w-[380px] md:max-w-[430px] lg:max-w-[500px]"
          />

          {/* Decorations */}
          <img
            src={sparkle}
            alt=""
            aria-hidden="true"
            className="absolute left-[12%] top-[8%] z-20 w-9 object-contain sm:w-12 md:w-16"
          />

          <img
            src={searchIcon}
            alt=""
            aria-hidden="true"
            className="absolute left-[2%] top-[48%] z-20 w-8 object-contain sm:w-10 md:w-12"
          />

          <img
            src={documentIcon}
            alt=""
            aria-hidden="true"
            className="absolute right-[4%] top-[34%] z-20 w-8 object-contain sm:w-10 md:w-12"
          />

          <img
            src={briefcaseIcon}
            alt=""
            aria-hidden="true"
            className="absolute bottom-[12%] left-0 z-20 w-10 object-contain sm:w-12 md:w-14"
          />

          <span className="absolute right-5 top-8 z-20 text-2xl text-[#F5D34F] sm:text-3xl md:top-12 md:text-4xl">
            ✦
          </span>

          <span className="absolute bottom-8 left-5 z-20 text-2xl text-[#4CAF50] sm:text-3xl md:bottom-12">
            ✦
          </span>
        </ScrollReveal>
      </div>
    </section>
  )
}

export default HeroSection
