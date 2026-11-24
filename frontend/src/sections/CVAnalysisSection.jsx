
import stepUpload from '../assets/analysis/step-upload.png'
import stepAI from '../assets/analysis/step-ai.png'
import stepApply from '../assets/analysis/step-apply.png'
import mascotAnalysis from '../assets/analysis/mascot-analysis.png'

import analysisLabel from '../assets/analysis/decorations/analysis-label.png'
import connector1 from '../assets/analysis/decorations/connector-1.png'
import connector2 from '../assets/analysis/decorations/connector-2.png'
import documentIcon from '../assets/analysis/decorations/document.png'
import lightbulb from '../assets/analysis/decorations/lightbulb.png'
import stepFrame from '../assets/analysis/decorations/step-frame.png'

import ScrollReveal from '../components/ScrollReveal'

const steps = [
  {
    number: 'BƯỚC 1',
    title: 'TẢI CV LÊN',
    description: 'Upload CV dưới dạng PDF, chọn tiêu chí mong muốn',
    image: stepUpload,
  },
  {
    number: 'BƯỚC 2',
    title: 'PHÂN TÍCH AI',
    description:
      'Hệ thống AI tự động quét dữ liệu và so sánh với mô tả công việc',
    image: stepAI,
  },
  {
    number: 'BƯỚC 3',
    title: 'ỨNG TUYỂN',
    description:
      'Nhận gợi ý về CV, nâng cấp kỹ năng, ứng tuyển công việc',
    image: stepApply,
  },
]

function CVAnalysisSection() {
  return (
    <section
      id="phan-tich-cv"
      className="relative isolate w-full overflow-hidden bg-transparent px-4 py-12 sm:px-6 sm:py-16 md:px-10 lg:px-[5%] lg:py-20"
    >
      {/* Tiêu đề và mô tả */}
      <div className="relative z-10 mx-auto w-full max-w-[1200px]">
        <div className="max-w-[650px]">
          <ScrollReveal direction="up">
            <div className="flex items-center justify-center gap-3 md:justify-start sm:gap-4">
              <h2 className="text-3xl font-extrabold uppercase tracking-tight text-[#063B2C] sm:text-4xl md:text-[46px]">
                PHÂN TÍCH CV
              </h2>

              <img
                src={lightbulb}
                alt=""
                aria-hidden="true"
                className="h-10 w-10 shrink-0 object-contain sm:h-12 sm:w-12 md:h-14 md:w-14"
              />
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={100}>
            <p className="mx-auto mt-4 max-w-[550px] text-center text-sm leading-relaxed text-[#26352B] sm:text-base md:mx-0 md:text-left md:text-[19px]">
              Phân tích độ phù hợp của CV với các công việc đang có, gợi ý và
              cách cải thiện CV, nâng cao cơ hội.
            </p>
          </ScrollReveal>

          {/* Ba lợi ích */}
          <ScrollReveal direction="up" delay={200}>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-xs font-semibold text-[#26352B] sm:gap-x-7 sm:text-sm md:justify-start md:text-base">
              {['Nhanh chóng', 'Chính xác', 'Cá nhân hóa'].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#72C65C] text-xs text-white">
                    ✓
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>

        {/* Mascot */}
        <ScrollReveal
          direction="right"
          delay={150}
          className="relative mx-auto mt-6 w-full max-w-[300px] sm:max-w-[360px] md:absolute md:right-0 md:top-0 md:mt-0 md:w-[38%] md:max-w-[400px] lg:right-[2%] lg:w-[40%] lg:max-w-[460px] xl:max-w-[500px]"
        >
          <div className="relative w-full">
            <img
              src={analysisLabel}
              alt=""
              aria-hidden="true"
              className="absolute -left-2 top-0 z-20 w-24 -rotate-6 object-contain sm:-left-4 sm:w-32 lg:-left-8 lg:w-[155px]"
            />

            <img
              src={documentIcon}
              alt=""
              aria-hidden="true"
              className="absolute -right-1 top-0 z-20 w-9 object-contain sm:w-12 lg:-right-2 lg:w-14"
            />

            <img
              src={mascotAnalysis}
              alt="Mascot CView cầm kính lúp"
              className="relative w-full object-contain"
            />
          </div>
        </ScrollReveal>
      </div>

      {/* Ba bước phân tích CV */}
      <div className="relative z-20 mx-auto mt-12 grid w-full max-w-[1200px] grid-cols-1 justify-items-center gap-8 sm:mt-14 sm:gap-10 md:grid-cols-2 lg:mt-[110px] lg:grid-cols-3 lg:gap-10">
        {steps.map((step, index) => (
          <ScrollReveal
            key={step.number}
            direction="up"
            delay={index * 150}
            className="group w-full max-w-[330px]"
          >
            <div className="relative flex h-[250px] w-full items-center justify-center transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.03] hover:drop-shadow-[0_12px_18px_rgba(30,86,49,0.16)] sm:h-[270px]">
              {/* Khung nền */}
              <img
                src={stepFrame}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-fill"
              />

              {/* Nội dung trong khung */}
              <div className="relative z-10 flex h-full w-full flex-col items-center px-5 pt-2 text-center">
                <span className="absolute -left-1 top-0 rounded-lg bg-[#FFEB91] px-3 py-1.5 text-[11px] font-extrabold text-[#253323] sm:text-xs">
                  {step.number}
                </span>

                <img
                  src={step.image}
                  alt=""
                  aria-hidden="true"
                  className="mt-3 h-[80px] w-[90px] object-contain sm:h-[85px] sm:w-[95px]"
                />

                <h3 className="mt-2 text-sm font-extrabold text-[#243322] sm:text-[15px]">
                  {step.title}
                </h3>

                <p className="mt-2 max-w-[210px] text-xs leading-[1.5] text-[#26352B]">
                  {step.description}
                </p>
              </div>

              {/* Đường nối giữa các bước */}
              {index === 0 && (
                <img
                  src={connector1}
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-[105px] top-[75px] z-20 hidden w-[135px] xl:block"
                />
              )}

              {index === 1 && (
                <img
                  src={connector2}
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-[105px] top-[75px] z-20 hidden w-[135px] xl:block"
                />
              )}
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Sparkle trang trí */}
      <span className="pointer-events-none absolute right-[12%] top-[42%] z-10 hidden text-3xl text-[#69C84E] md:block">
        ✦
      </span>

      <span className="pointer-events-none absolute right-[14%] top-[48%] z-10 hidden text-xl text-[#69C84E] md:block">
        ✦
      </span>
    </section>
  )
}

export default CVAnalysisSection
