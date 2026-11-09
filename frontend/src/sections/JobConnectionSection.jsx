
import mascotJob from '../assets/job-connection/mascot-job.png'
import userIcon from '../assets/job-connection/icon-user.png'
import companyIcon from '../assets/job-connection/icon-company.png'
import jobIcon from '../assets/job-connection/icon-job.png'
import cloudBackground from '../assets/job-connection/background-cloud.png'
import ScrollReveal from '../components/ScrollReveal'

const features = [
  {
    icon: '⚡',
    title: 'Đa dạng ngành nghề',
    description: 'Hàng nghìn việc làm từ đơn vị uy tín trên nhiều lĩnh vực.',
  },
  {
    icon: '♥',
    title: 'Tìm việc dễ dàng',
    description: 'Lọc theo vị trí, địa điểm, kỹ năng và kinh nghiệm.',
  },
  {
    icon: '▦',
    title: 'Kết nối doanh nghiệp',
    description: 'Tiếp cận trực tiếp với các nhà tuyển dụng đáng tin cậy.',
  },
  {
    icon: '★',
    title: 'Cập nhật liên tục',
    description: 'Việc làm mới được đăng mỗi ngày.',
  },
]

const statistics = [
  {
    icon: jobIcon,
    number: '11.324+',
    label: 'Việc làm đang tuyển dụng',
  },
  {
    icon: companyIcon,
    number: '2.500+',
    label: 'Doanh nghiệp uy tín',
  },
  {
    icon: userIcon,
    number: '50+',
    label: 'Ngành nghề đa dạng',
  },
]

function JobConnectionSection() {
  return (
    <section
      id="tim-viec"
      className="relative isolate min-h-screen overflow-hidden bg-transparent px-6 py-16 md:px-10 lg:px-[5%] lg:py-20"
    >
      {/* Background cloud */}
      <div className="pointer-events-none absolute right-[5%] top-0 -z-10 w-[55%] max-w-[780px]">
        <img
          src={cloudBackground}
          alt=""
          className="h-auto w-full object-contain"
        />
      </div>

      <div className="mx-auto max-w-[1440px]">
        {/* Heading and mascot */}
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <ScrollReveal direction="left" className="relative z-10">
            <h2 className="max-w-[650px] text-3xl font-extrabold leading-tight text-cview-dark md:text-4xl lg:text-[48px]">
              KẾT NỐI ĐÚNG NƠI MỞ LỐI
              <br />
              ĐÚNG <span className="text-cview-green">CƠ HỘI</span>
            </h2>

            <p className="mt-4 text-base text-cview-dark md:text-lg">
              Nơi kết nối ứng viên và doanh nghiệp
            </p>
          </ScrollReveal>

          <ScrollReveal
            direction="right"
            delay={150}
            className="flex justify-center lg:justify-end"
          >
            <img
              src={mascotJob}
              alt="Mascot CView đang đọc sách"
              className="w-full max-w-[430px] object-contain"
            />
          </ScrollReveal>
        </div>

        {/* Feature cards */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {features.map((feature, index) => (
            <ScrollReveal
              key={feature.title}
              direction="up"
              delay={index * 100}
            >
              <div className="flex h-full min-h-[100px] items-center gap-3 rounded-2xl border border-dashed border-cview-dark/70 bg-white/75 px-4 py-4 shadow-sm backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F0FDE1] text-xl text-cview-green">
                  {feature.icon}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-cview-dark">
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

        {/* Statistics */}
        <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_3fr] lg:items-end">
          <ScrollReveal direction="left">
            <span className="inline-flex rounded-full bg-[#E6FADD] px-4 py-2 text-xs font-bold text-cview-green">
              CƠ HỘI DÀNH CHO BẠN
            </span>

            <h3 className="mt-4 max-w-[330px] text-xl font-extrabold leading-snug text-cview-dark">
              HÀNG NGHÌN VIỆC LÀM ĐANG CHỜ BẠN KHÁM PHÁ
            </h3>
          </ScrollReveal>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {statistics.map((stat, index) => (
              <ScrollReveal
                key={stat.number}
                direction="up"
                delay={index * 120}
              >
                <div className="flex flex-col">
                  <img
                    src={stat.icon}
                    alt=""
                    className="mb-3 h-9 w-9 object-contain"
                  />

                  <p className="text-2xl font-extrabold text-cview-dark md:text-3xl">
                    {stat.number}
                  </p>

                  <p className="mt-1 text-sm leading-relaxed text-cview-dark md:text-base">
                    {stat.label}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default JobConnectionSection
