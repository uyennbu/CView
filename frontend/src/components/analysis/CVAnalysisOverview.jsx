
import plantDecoration from '../../assets/cv-analysis/plant-decoration.png'
import cviewMascot from '../../assets/cv-analysis/cview-mascot.png'
import MatchingJobs from './MatchingJobs'

// Dữ liệu minh họa
const strengths = [
  'Trình bày CV rõ ràng, chuyên nghiệp',
  'Có kinh nghiệm thực tế phù hợp với vị trí',
  'Sử dụng các từ khóa chuyên ngành nổi bật',
  'Thông tin học vấn và kỹ năng đầy đủ',
  'Sử dụng tốt các công cụ chuyên môn',
]

const improvements = [
  'Chưa làm nổi bật thành tích cá nhân bằng số liệu cụ thể',
  'Phần mô tả kinh nghiệm còn chung chung',
  'Nên bổ sung chứng chỉ hoặc kỹ năng chuyên môn',
  'Chưa thể hiện rõ định hướng phát triển bản thân',
]

// Vòng tròn điểm đánh giá
function ScoreCircle({ score = 80 }) {
  const radius = 39
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="
      relative flex h-28 w-28 shrink-0
      items-center justify-center
      sm:h-32 sm:w-32
    ">
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full -rotate-90"
        role="img"
        aria-label={`Mức độ phù hợp ${score}%`}
      >
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#E6FADD"
          strokeWidth="7"
        />

        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#168B48"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      </svg>

      <div className="absolute flex flex-col items-center">
        <span className="
          text-3xl font-extrabold text-cview-dark
          sm:text-4xl
        ">
          {score}%
        </span>

        <span className="text-[9px] font-medium text-gray-500 sm:text-[10px]">
          Mức độ phù hợp
        </span>
      </div>
    </div>
  )
}

// Khung đánh giá
function EvaluationCard({ title, children, className = '' }) {
  return (
    <section
      className={`
        flex min-w-0 flex-col
        rounded-2xl border border-[#C9E8B9]
        bg-white/95 p-4 shadow-sm
        sm:p-5
        ${className}
      `}
    >
      <h2 className="
        mb-4 text-center text-sm font-extrabold
        uppercase leading-snug text-cview-dark
        sm:text-base
      ">
        {title}
      </h2>

      <div className="min-w-0 flex-1">
        {children}
      </div>
    </section>
  )
}

// Danh sách điểm mạnh và điểm cần cải thiện
function EvaluationList({ items, type }) {
  const isPositive = type === 'positive'

  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li
          key={index}
          className="flex min-w-0 items-start gap-2.5"
        >
          <span
            className={`
              mt-0.5 flex h-5 w-5 shrink-0
              items-center justify-center rounded-full
              text-xs font-bold text-white
              ${
                isPositive
                  ? 'bg-[#4CAF50]'
                  : 'bg-[#FFB323]'
              }
            `}
            aria-hidden="true"
          >
            {isPositive ? '✓' : '!'}
          </span>

          <span className="
            min-w-0 break-words text-xs
            leading-relaxed text-cview-dark
            sm:text-[13px]
          ">
            {item}
          </span>
        </li>
      ))}
    </ul>
  )
}

export default function CVAnalysisOverview() {
  return (
    <section className="
      relative mx-auto w-full max-w-[1200px]
      min-w-0 overflow-hidden rounded-2xl
      bg-gradient-to-br from-[#F5FDEB] via-white to-[#FFFCEB]
      p-3
      sm:p-5
      lg:p-7
    ">
      {/* HEADER BANNER */}
      <header className="
        relative mb-5 flex min-h-[115px]
        items-center justify-center
        sm:mb-6 sm:min-h-[145px]
        lg:min-h-[155px]
      ">
        {/* Background */}
        <div className="
          absolute inset-x-2 top-1/2
          h-[72px] -translate-y-1/2
          rounded-xl border border-[#BDE7A9]
          bg-gradient-to-r from-[#E7F8D9]
          via-[#F5FCEB] to-[#E7F8D9]
          sm:inset-x-5 sm:h-[90px] sm:rounded-2xl
        " />

        {/* CView Mascot */}
        <img
          src={cviewMascot}
          alt="Mascot CView"
          className="
            absolute bottom-0 left-0 z-20
            h-[75px] w-auto max-w-[22%]
            translate-y-0 object-contain object-bottom
            sm:h-[115px] sm:max-w-none sm:-translate-y-3
            lg:h-[140px] lg:-translate-y-5
          "
        />

        {/* Main Heading */}
        <div className="
          relative z-10 mx-auto w-full
          px-[52px] text-center
          sm:px-[115px]
          lg:px-[150px]
        ">
          <h1 className="
            break-words text-sm font-extrabold
            uppercase leading-tight text-cview-dark
            sm:text-2xl
            lg:text-3xl
          ">
            Kết quả phân tích CV
          </h1>

          <p className="
            mx-auto mt-1 max-w-2xl
            text-[9px] leading-relaxed text-gray-600
            sm:mt-2 sm:text-[10px]
            lg:text-xs
          ">
            CV của bạn đã được phân tích thành công!
            <br className="hidden sm:block" />
            Dưới đây là đánh giá chi tiết các công việc phù hợp dành cho bạn.
          </p>
        </div>

        {/* Plant Decoration */}
        <img
          src={plantDecoration}
          alt=""
          aria-hidden="true"
          className="
            absolute bottom-0 right-0 z-20
            h-[72px] w-auto max-w-[20%]
            translate-y-0 object-contain object-bottom
            sm:h-[110px] sm:max-w-none sm:-translate-y-2
            lg:h-[140px] lg:-translate-y-3
          "
        />
      </header>

      {/* CV EVALUATION CARDS */}
      <div className="
        grid min-w-0 grid-cols-1 gap-3
        md:grid-cols-2
        xl:grid-cols-3
        sm:gap-4
      ">
        {/* Average Score */}
        <EvaluationCard
          title="Điểm đánh giá trung bình"
          className="items-center justify-center"
        >
          <div className="
            flex min-h-[145px]
            items-center justify-center
          ">
            <ScoreCircle score={80} />
          </div>
        </EvaluationCard>

        {/* Strengths */}
        <EvaluationCard title="Điểm mạnh">
          <EvaluationList
            items={strengths}
            type="positive"
          />
        </EvaluationCard>

        {/* Improvements */}
        <EvaluationCard title="Điểm cần cải thiện">
          <EvaluationList
            items={improvements}
            type="improvement"
          />
        </EvaluationCard>
      </div>

      {/* MATCHING JOBS */}
      <div className="mt-5 min-w-0 sm:mt-7">
        <MatchingJobs />
      </div>
    </section>
  )
}
