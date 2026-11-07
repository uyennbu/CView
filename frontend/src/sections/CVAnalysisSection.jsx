
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
    description: 'Hệ thống AI tự động quét dữ liệu và so sánh với mô tả công việc',
    image: stepAI,
  },
  {
    number: 'BƯỚC 3',
    title: 'ỨNG TUYỂN',
    description: 'Nhận gợi ý về CV, nâng cấp kỹ năng, ứng tuyển công việc',
    image: stepApply,
  },
]

function CVAnalysisSection() {
  return (
      <section
      id="phan-tich-cv"
      className="relative isolate min-h-screen overflow-hidden bg-transparent px-6 py-16 md:px-10 lg:px-[5%] lg:py-20"
      >

      {/* Tiêu đề và mô tả */}
      <div className="relative z-10 max-w-[650px]">
        <div className="flex items-center gap-4">
          <h2 className="font-manrope text-4xl font-extrabold uppercase tracking-tight text-[#063B2C] md:text-[46px]">
            PHÂN TÍCH CV
          </h2>

          <img
            src={lightbulb}
            alt=""
            className="h-14 w-14 object-contain"
          />
        </div>

        <p className="mt-4 max-w-[550px] text-[17px] leading-relaxed text-[#26352B] md:text-[19px]">
          Phân tích độ phù hợp của CV với các công việc đang có, gợi ý và
          cách cải thiện CV, nâng cao cơ hội.
        </p>

        {/* Ba lợi ích */}
        <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm font-semibold text-[#26352B] md:text-base">
          {['Nhanh chóng', 'Chính xác', 'Cá nhân hóa'].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#72C65C] text-xs text-white">
                ✓
              </span>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Mascot bên phải */}
      <div className="pointer-events-none absolute right-[3%] top-[10px] z-10 hidden w-[400px] md:block lg:right-[6%] lg:w-[460px] xl:w-[500px]">
        <img
          src={analysisLabel}
          alt=""
          className="absolute -left-8 top-0 z-20 w-[155px] -rotate-6 object-contain"
        />

        <img
          src={documentIcon}
          alt=""
          className="absolute -right-2 top-0 z-20 w-14 object-contain"
        />

        <img
          src={mascotAnalysis}
          alt="Mascot CView cầm kính lúp"
          className="relative w-full object-contain"
        />
      </div>

      {/* Ba bước phân tích CV */}
      <div className="relative z-20 mt-20 grid grid-cols-1 justify-items-center gap-10 sm:grid-cols-3 sm:gap-6 lg:mt-[110px] lg:max-w-[1200px] lg:gap-10">
        {steps.map((step, index) => (
          <div
            key={step.number}
            className="relative flex h-[270px] w-full max-w-[330px] items-center justify-center"
          >
            {/* Khung nền */}
            <img
              src={stepFrame}
              alt=""
              className="absolute inset-0 h-full w-full object-fill"
            />

            {/* Nội dung trong khung */}
            <div className="relative z-10 flex h-full w-full flex-col items-center px-5 pt-2 text-center">
              <span className="absolute -left-1 top-0 rounded-lg bg-[#FFEB91] px-3 py-1.5 text-xs font-extrabold text-[#253323]">
                {step.number}
              </span>

              <img
                src={step.image}
                alt=""
                className="mt-3 h-[85px] w-[95px] object-contain"
              />

              <h3 className="mt-2 text-[15px] font-extrabold text-[#243322]">
                {step.title}
              </h3>

              <p className="mt-2 max-w-[190px] text-[12px] leading-[1.4] text-[#26352B]">
                {step.description}
              </p>
            </div>

            {/* Đường nối giữa các bước */}
            {index === 0 && (
              <img
                src={connector1}
                alt=""
                className="pointer-events-none absolute -right-[105px] top-[75px] z-20 hidden w-[135px] lg:block"
              />
            )}

            {index === 1 && (
              <img
                src={connector2}
                alt=""
                className="pointer-events-none absolute -right-[105px] top-[75px] z-20 hidden w-[135px] lg:block"
              />
            )}
          </div>
        ))}
      </div>

      {/* Sparkle trang trí */}
      <span className="pointer-events-none absolute left-[53%] top-[43%] z-10 text-3xl text-[#69C84E]">
        ✦
      </span>

      <span className="pointer-events-none absolute left-[54%] top-[48%] z-10 text-xl text-[#69C84E]">
        ✦
      </span>
    </section>
  )
}

export default CVAnalysisSection
