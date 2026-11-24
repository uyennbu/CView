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

import userIcon from '../assets/job-connection/icon-user.png'
import companyIcon from '../assets/job-connection/icon-company.png'
import jobIcon from '../assets/job-connection/icon-job.png'

import ScrollReveal from '../components/ScrollReveal'

const statistics = [
  {
    icon: jobIcon,
    number: '11.324 +',
    label: 'Việc làm đang tuyển dụng',
  },
  {
    icon: companyIcon,
    number: '2.500 +',
    label: 'Doanh nghiệp uy tín',
  },
  {
    icon: userIcon,
    number: '50 +',
    label: 'Ngành nghề đa dạng',
  },
]

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
      className="relative isolate w-full overflow-hidden bg-transparent px-4 py-8 sm:px-6 sm:py-10 md:px-10 lg:px-[5%] lg:py-12"
    >
      {/* Mục số liệu về việc làm (Đặt trước phần Phân tích CV) */}
      <div className="mx-auto mb-16 w-full max-w-[1120px] px-2 sm:mb-20 sm:px-6 lg:mb-28">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_3fr] lg:items-end lg:gap-10">
          <ScrollReveal
            direction="left"
            className="text-center lg:text-left"
          >
            <span className="inline-flex rounded-full bg-[#E6FADD] px-4 py-2 text-[11px] font-bold text-cview-green sm:text-xs">
              CƠ HỘI DÀNH CHO BẠN
            </span>

            <h3 className="mx-auto mt-4 max-w-[330px] text-lg font-extrabold leading-snug text-cview-dark sm:text-xl lg:mx-0">
              HÀNG NGHÌN VIỆC LÀM ĐANG CHỜ BẠN KHÁM PHÁ
            </h3>
          </ScrollReveal>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-4 lg:gap-6">
            {statistics.map((stat, index) => (
              <ScrollReveal
                key={stat.number}
                direction="up"
                delay={index * 120}
                className="h-full"
              >
                <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                  <img
                    src={stat.icon}
                    alt=""
                    aria-hidden="true"
                    className="mb-3 h-9 w-9 object-contain"
                  />

                  <p className="text-2xl font-extrabold text-cview-dark sm:text-2xl md:text-3xl">
                    {stat.number}
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-cview-dark sm:text-sm md:text-base">
                    {stat.label}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      {/* Tiêu đề và mô tả */}
      <div className="relative z-10 mx-auto w-full max-w-[1120px] px-2 sm:px-6">
        <div className="max-w-[580px]">
          <ScrollReveal direction="up">
            <div className="flex items-center justify-center gap-3 md:justify-start sm:gap-3.5">
              <h2 className="text-2xl font-extrabold uppercase tracking-tight text-[#063B2C] sm:text-3xl md:text-[38px]">
                PHÂN TÍCH CV
              </h2>

              <img
                src={lightbulb}
                alt=""
                aria-hidden="true"
                className="h-9 w-9 shrink-0 object-contain sm:h-11 sm:w-11 md:h-12 md:w-12"
              />
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={100}>
            <p className="mx-auto mt-3 max-w-[510px] text-center text-xs leading-relaxed text-[#26352B] sm:text-sm md:mx-0 md:text-left md:text-[16px]">
              Phân tích độ phù hợp của CV với các công việc đang có, gợi ý và
              cách cải thiện CV, nâng cao cơ hội.
            </p>
          </ScrollReveal>

          {/* Ba lợi ích */}
          <ScrollReveal direction="up" delay={200}>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5 text-xs font-semibold text-[#26352B] sm:gap-x-6 sm:text-sm md:justify-start">
              {['Nhanh chóng', 'Chính xác', 'Cá nhân hóa'].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#72C65C] text-[10px] text-white sm:h-5 sm:w-5 sm:text-xs">
                    ✓
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>

        {/* Mascot (Thu nhỏ và căn gọn góc phải) */}
        <ScrollReveal
          direction="right"
          delay={150}
          className="relative mx-auto mt-5 w-full max-w-[230px] sm:max-w-[270px] md:absolute md:right-4 md:-top-2 md:mt-0 md:w-[32%] md:max-w-[310px] lg:right-6 lg:w-[33%] lg:max-w-[350px] xl:max-w-[370px]"
        >
          <div className="relative w-full">
            <img
              src={analysisLabel}
              alt=""
              aria-hidden="true"
              className="absolute -left-2 top-0 z-20 w-20 -rotate-6 object-contain sm:-left-4 sm:w-24 lg:-left-6 lg:w-[125px]"
            />

            <img
              src={documentIcon}
              alt=""
              aria-hidden="true"
              className="absolute -right-1 top-0 z-20 w-8 object-contain sm:w-10 lg:-right-2 lg:w-11"
            />

            <img
              src={mascotAnalysis}
              alt="Mascot CView cầm kính lúp"
              className="relative w-full object-contain"
            />
          </div>
        </ScrollReveal>
      </div>

      {/* Ba bước phân tích CV (Dịch lên trên, khung nhỏ hơn, cách xa nhau hơn) */}
      <div className="relative z-20 mx-auto mt-8 grid w-full max-w-[1060px] grid-cols-1 justify-items-center gap-8 px-2 sm:mt-9 sm:gap-10 sm:px-6 md:grid-cols-2 lg:mt-[52px] lg:grid-cols-3 lg:gap-14">
        {steps.map((step, index) => (
          <ScrollReveal
            key={step.number}
            direction="up"
            delay={index * 150}
            className="group w-full max-w-[265px] sm:max-w-[275px]"
          >
            <div className="relative flex h-[205px] w-full items-center justify-center transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.03] hover:drop-shadow-[0_12px_18px_rgba(30,86,49,0.16)] sm:h-[220px]">
              {/* Khung nền */}
              <img
                src={stepFrame}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-fill"
              />

              {/* Nội dung trong khung */}
              <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-5 text-center">
                <span className="absolute left-3 top-3 rounded-xl bg-[#FFEB91] px-3 py-1 text-[10px] font-extrabold text-[#253323] shadow-xs sm:left-3.5 sm:top-3.5 sm:text-[11px]">
                  {step.number}
                </span>

                <img
                  src={step.image}
                  alt=""
                  aria-hidden="true"
                  className="h-[64px] w-[72px] object-contain sm:h-[68px] sm:w-[76px]"
                />

                <h3 className="mt-2 text-xs font-extrabold text-[#243322] sm:text-[13.5px]">
                  {step.title}
                </h3>

                <p className="mt-1 max-w-[190px] text-[11px] leading-[1.45] text-[#26352B] sm:text-[11.5px]">
                  {step.description}
                </p>
              </div>

              {/* Đường nối giữa các bước */}
              {index === 0 && (
                <img
                  src={connector1}
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-[95px] top-[65px] z-20 hidden w-[115px] lg:block"
                />
              )}

              {index === 1 && (
                <img
                  src={connector2}
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-[95px] top-[65px] z-20 hidden w-[115px] lg:block"
                />
              )}
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Sparkle trang trí */}
      <span className="pointer-events-none absolute right-[36%] top-[48%] z-10 hidden text-2xl text-[#69C84E] md:block">
        ✦
      </span>

      <span className="pointer-events-none absolute right-[38%] top-[54%] z-10 hidden text-base text-[#69C84E] md:block">
        ✦
      </span>
    </section>
  )
}

export default CVAnalysisSection
