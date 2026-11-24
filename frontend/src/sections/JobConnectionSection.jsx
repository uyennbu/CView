import mascotJob from '../assets/job-connection/mascot-job.png'
import cloudBackground from '../assets/job-connection/background-cloud.png'
import ScrollReveal from '../components/ScrollReveal'

const features = [
  {
    id: 'diverse',
    title: 'Đa dạng ngành nghề',
    description: 'Hàng nghìn việc làm từ đơn vị uy tín trên nhiều lĩnh vực.',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-[#F59E0B]">
        <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
      </svg>
    ),
  },
  {
    id: 'easy',
    title: 'Tìm việc dễ dàng',
    description: 'Lọc theo vị trí, địa điểm, kỹ năng, loại hình công việc.',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-[#43A948]">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    ),
  },
  {
    id: 'connect',
    title: 'Kết nối doanh nghiệp',
    description: 'Tiếp cận trực tiếp với các nhà tuyển dụng đang tuyển dụng.',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-[#2E7D32]">
        <path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16h4v-8h-2v-2h4v12H2v-2h2zm4-14v2h2V7H8zm4 0v2h2V7h-2zm-4 4v2h2v-2H8zm4 0v2h2v-2h-2zm-4 4v2h2v-2H8zm4 0v2h2v-2h-2z" />
      </svg>
    ),
  },
  {
    id: 'update',
    title: 'Cập nhật liên tục',
    description: 'Việc làm mới được đăng đều đặn mỗi ngày.',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-[#FBBF24]">
        <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
]

function JobConnectionSection() {
  return (
    <section
      id="tim-viec"
      className="relative isolate w-full overflow-hidden bg-transparent px-4 py-12 sm:px-6 sm:py-16 md:px-10 lg:px-[5%] lg:py-20"
    >
      {/* Background cloud */}
      <div className="pointer-events-none absolute right-0 top-0 -z-10 w-[75%] max-w-[780px] opacity-60 sm:right-[3%] sm:w-[60%] md:w-[55%]">
        <img
          src={cloudBackground}
          alt=""
          aria-hidden="true"
          className="h-auto w-full object-contain"
        />
      </div>

      <div className="mx-auto w-full max-w-[1140px] px-2 sm:px-6">
        {/* Heading and mascot */}
        <div className="grid grid-cols-1 items-center gap-5 sm:gap-8 lg:grid-cols-2 lg:gap-10">
          <ScrollReveal
            direction="left"
            className="relative z-10 mx-auto w-full max-w-[650px] text-center lg:mx-0 lg:text-left"
          >
            <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-cview-dark sm:text-3xl md:text-[38px]">
              KẾT NỐI ĐÚNG NƠI
              <br />
              MỞ LỐI ĐÚNG <span className="text-[#43A948]">CƠ HỘI</span>
            </h2>

            <p className="mt-3 text-xs leading-relaxed text-cview-dark sm:text-sm md:text-[16px]">
              Nơi kết nối ứng viên và doanh nghiệp
            </p>
          </ScrollReveal>

          <ScrollReveal
            direction="right"
            delay={150}
            className="mx-auto flex w-full max-w-[330px] justify-center sm:max-w-[400px] lg:mx-0 lg:max-w-none lg:justify-end"
          >
            <img
              src={mascotJob}
              alt="Mascot CView đang đọc sách"
              className="w-full max-w-[430px] object-contain"
            />
          </ScrollReveal>
        </div>

        {/* Feature cards */}
        <div className="mt-8 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-6">
          {features.map((feature, index) => (
            <ScrollReveal
              key={feature.id}
              direction="up"
              delay={index * 100}
              className="h-full"
            >
              <div className="flex h-full min-h-[100px] items-center gap-3 rounded-2xl border border-dashed border-cview-dark/70 bg-white/80 px-4 py-4 shadow-sm backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:shadow-md sm:min-h-[112px]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F5F9E9] sm:h-11 sm:w-11">
                  {feature.icon}
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-cview-dark sm:text-[15px]">
                    {feature.title}
                  </h3>

                  <p className="mt-1 text-xs leading-relaxed text-gray-500">
                    {feature.description}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export default JobConnectionSection
