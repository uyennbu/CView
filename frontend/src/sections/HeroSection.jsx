
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
      className="relative isolate min-h-[650px] overflow-hidden bg-transparent"
    >
      <div className="mx-auto grid min-h-[650px] max-w-[1440px] items-center gap-8 px-6 py-12 md:grid-cols-2 lg:px-14">

        {/* Left content */}
        <ScrollReveal
          direction="left"
          className="z-10 max-w-[590px]"
        >
          <h1 className="text-[clamp(2rem,3vw,3.5rem)] font-extrabold leading-tight">
            <span className="whitespace-nowrap">
              KẾT NỐI CÔNG VIỆC MƠ ƯỚC
            </span>
            <br />
            BỨT PHÁ SỰ NGHIỆP
          </h1>

          <p className="mt-5 max-w-[480px] text-sm leading-relaxed text-[#1A241E] md:text-base">
            Tìm kiếm công việc phù hợp dựa trên CV của bạn, chấm
            điểm độ phù hợp trên kỹ năng, kinh nghiệm
          </p>

          {/* Benefits */}
          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-4">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="flex items-center gap-2"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg font-bold ${benefit.color}`}
                >
                  {benefit.icon}
                </span>

                <div className="text-[10px] leading-relaxed">
                  <p className="font-semibold">{benefit.title}</p>
                  <p>{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Main CTA */}
          <a
            href="/phan-tich-cv"
            className="mt-9 inline-flex items-center gap-4 rounded-full bg-[#FF4B6E] px-7 py-3.5 !text-white font-bold shadow-sm transition hover:-translate-y-1 hover:bg-[#ed3d60] md:text-lg"
          >
            BẮT ĐẦU PHÂN TÍCH CV
            <span className="text-2xl leading-none">⟶</span>
          </a>

          {/* Feature tags */}
          <div className="mt-4 flex flex-wrap gap-3">
            {['Chấm điểm', 'Góp ý', 'Đề xuất việc làm'].map((item) => (
              <span
                key={item}
                className="rounded-lg bg-[#4CAF50] px-4 py-1.5 text-xs font-bold text-white"
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
          className="relative flex items-center justify-center"
        >
          <div className="absolute h-[360px] w-[360px] rounded-full bg-gradient-to-br from-[#E6FADD] to-[#F9FACA] blur-2xl md:h-[450px] md:w-[450px]" />

          <img
            src={heroMascot}
            alt="Mascot tắc kè CView cầm CV"
            className="relative z-10 w-full max-w-[430px] object-contain drop-shadow-sm md:max-w-[500px]"
          />

          <img
            src={sparkle}
            alt=""
            className="absolute left-[12%] top-[8%] z-20 w-16 object-contain"
          />

          <img
            src={searchIcon}
            alt=""
            className="absolute left-[2%] top-[48%] z-20 w-12 object-contain"
          />

          <img
            src={documentIcon}
            alt=""
            className="absolute right-[4%] top-[34%] z-20 w-12 object-contain"
          />

          <img
            src={briefcaseIcon}
            alt=""
            className="absolute bottom-[12%] left-0 z-20 w-14 object-contain"
          />

          <span className="absolute right-5 top-12 z-20 text-4xl text-[#F5D34F]">
            ✦
          </span>

          <span className="absolute bottom-12 left-5 z-20 text-3xl text-[#4CAF50]">
            ✦
          </span>
        </ScrollReveal>
      </div>
    </section>
  )
}

export default HeroSection
