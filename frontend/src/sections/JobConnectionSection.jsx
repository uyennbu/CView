import { useState } from 'react'
import { Link } from 'react-router-dom'
import mascotJob from '../assets/job-connection/mascot-job.png'
import ScrollReveal from '../components/ScrollReveal'

const kpiCards = [
  {
    id: 'new-24h',
    value: '153',
    label: 'Việc làm mới 24h gần nhất',
    badge: '+18% hôm nay',
    badgeClass: 'bg-[#E6FADD] text-[#1E5631]',
  },
  {
    id: 'active-jobs',
    value: '38.143',
    label: 'Việc làm đang tuyển',
    badge: 'Đang mở đơn',
    badgeClass: 'bg-[#FFF5BE] text-[#8F7C00]',
  },
  {
    id: 'active-companies',
    value: '14.730',
    label: 'Công ty đang tuyển',
    badge: 'Đã xác thực',
    badgeClass: 'bg-[#E2F2FF] text-[#1D73D8]',
  },
]

const latestJobs = [
  {
    id: 1,
    initials: 'JS',
    logoClass: 'bg-[#E6FADD] text-[#1E5631] border-[#B8E6A5]',
    title: 'Quản Lý Khách Sạn',
    company: 'CÔNG TY TNHH JS CORPORATE',
    location: 'Hồ Chí Minh (mới)',
  },
  {
    id: 2,
    initials: 'NT',
    logoClass: 'bg-[#FFF5BE] text-[#8F7C00] border-[#F2E28B]',
    title: 'Nhân Viên Sales / Telesales - Chăm Sóc Khách Hàng',
    company: 'HỘ KINH DOANH NT BEAUTY & SPA',
    location: 'Hồ Chí Minh (mới)',
  },
  {
    id: 3,
    initials: 'NTL',
    logoClass: 'bg-[#FFE4E8] text-[#D63354] border-[#F9BDC8]',
    title: 'Chuyên Viên Kinh Doanh (Express Delivery)',
    company: 'Nhất Tín Logistics',
    location: 'Hà Nội & 6 nơi khác',
  },
]

const demandData = {
  industry: [
    {
      label: 'Kinh doanh / Bán hàng',
      value: '9.850',
      heightPercent: 95,
      barClass: 'from-[#43A948]/85 to-[#43A948]/25 border-t-4 border-[#2E7D32]',
      dotClass: 'bg-[#43A948]',
    },
    {
      label: 'CNTT / Phần mềm',
      value: '6.420',
      heightPercent: 64,
      barClass: 'from-[#3B82F6]/80 to-[#3B82F6]/20 border-t-4 border-[#2563EB]',
      dotClass: 'bg-[#3B82F6]',
    },
    {
      label: 'Dịch vụ khách hàng',
      value: '5.510',
      heightPercent: 55,
      barClass: 'from-[#F59E0B]/80 to-[#F59E0B]/20 border-t-4 border-[#D97706]',
      dotClass: 'bg-[#F59E0B]',
    },
    {
      label: 'Marketing / Truyền thông',
      value: '5.240',
      heightPercent: 52,
      barClass: 'from-[#06B6D4]/80 to-[#06B6D4]/20 border-t-4 border-[#0891B2]',
      dotClass: 'bg-[#06B6D4]',
    },
    {
      label: 'Tài chính / Tư vấn',
      value: '4.890',
      heightPercent: 48,
      barClass: 'from-[#EAB308]/85 to-[#EAB308]/25 border-t-4 border-[#CA8A04]',
      dotClass: 'bg-[#EAB308]',
    },
  ],
  level: [
    {
      label: 'Nhân viên / Chuyên viên',
      value: '9.400',
      heightPercent: 92,
      barClass: 'from-[#43A948]/85 to-[#43A948]/25 border-t-4 border-[#2E7D32]',
      dotClass: 'bg-[#43A948]',
    },
    {
      label: 'Thực tập sinh / Fresher',
      value: '6.800',
      heightPercent: 68,
      barClass: 'from-[#3B82F6]/80 to-[#3B82F6]/20 border-t-4 border-[#2563EB]',
      dotClass: 'bg-[#3B82F6]',
    },
    {
      label: 'Trưởng nhóm / Giám sát',
      value: '5.100',
      heightPercent: 51,
      barClass: 'from-[#F59E0B]/80 to-[#F59E0B]/20 border-t-4 border-[#D97706]',
      dotClass: 'bg-[#F59E0B]',
    },
    {
      label: 'Quản lý / Trưởng phòng',
      value: '3.950',
      heightPercent: 40,
      barClass: 'from-[#06B6D4]/80 to-[#06B6D4]/20 border-t-4 border-[#0891B2]',
      dotClass: 'bg-[#06B6D4]',
    },
    {
      label: 'Cộng tác viên / Part-time',
      value: '3.400',
      heightPercent: 35,
      barClass: 'from-[#EAB308]/85 to-[#EAB308]/25 border-t-4 border-[#CA8A04]',
      dotClass: 'bg-[#EAB308]',
    },
  ],
}

const yAxisGrowth = ['45,000', '44,000', '43,000', '42,000', '41,000', '40,000', '39,000', '38,000']
const xAxisDates = ['26/10', '01/11', '07/11', '13/11', '19/11', '25/11']
const yAxisDemand = ['10,000', '8,000', '6,000', '4,000', '2,000', '0']

function TrendIcon() {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#43A948] text-white shadow-xs">
      <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 17 6-6 4 4 8-8" />
        <path d="M14 7h7v7" />
      </svg>
    </span>
  )
}

function JobConnectionSection() {
  const [demandFilter, setDemandFilter] = useState('industry')
  const currentDemand = demandData[demandFilter]

  return (
    <section
      id="tim-viec"
      className="relative isolate mt-8 w-full overflow-hidden bg-transparent px-4 py-6 sm:mt-10 sm:px-6 sm:py-8 md:px-10 lg:mt-16 lg:px-[5%] lg:py-10"
    >
      <div className="mx-auto w-full max-w-[1080px] px-2 sm:px-6">
        <ScrollReveal direction="up">
          {/* Outer Mini Dashboard Card */}
          <div className="overflow-hidden rounded-[22px] border-2 border-[#B9E4A6] bg-gradient-to-br from-[#F4FCEB] via-[#FFFFFF] to-[#F9FDE8] shadow-[0_12px_32px_rgba(30,86,49,0.08)]">

            {/* Top Header Banner */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-[#D5EFC8] bg-gradient-to-r from-[#1E5631] via-[#266D3E] to-[#38944A] px-4 py-2.5 text-white sm:px-6 sm:py-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-[#A6F48B] shadow-[0_0_8px_#A6F48B]" />
                <h2 className="text-sm font-extrabold tracking-tight sm:text-lg md:text-xl">
                  Thị trường việc làm hôm nay{' '}
                  <span className="text-[#B8F89E]">25/11/2026</span>
                </h2>
              </div>

              <Link
                to="/jobs"
                className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold !text-white backdrop-blur-xs transition hover:bg-white/25"
              >
                <span>Khám phá việc làm</span>
                <span>→</span>
              </Link>
            </div>

            {/* Dashboard Main Grid */}
            <div className="grid grid-cols-1 gap-3.5 p-3.5 sm:gap-4 sm:p-4 lg:grid-cols-[260px_1fr]">

              {/* LEFT COLUMN: Mascot + Việc làm mới nhất */}
              <div className="flex flex-col justify-between gap-3 rounded-xl border border-[#D5EFC8] bg-[#F7FDF2]/90 p-3">
                {/* Mascot Radar Header */}
                <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-lg bg-gradient-to-b from-[#E3F9D7] to-[#F4FCEB] px-2.5 py-2">
                  <div className="pointer-events-none absolute inset-x-2.5 top-1.5 flex justify-between text-[9px] font-bold text-[#1E5631]/60">
                    <span>AI MARKET RADAR</span>
                    <span>LIVE ●</span>
                  </div>
                  <img
                    src={mascotJob}
                    alt="Mascot CView phân tích thị trường việc làm"
                    className="mt-2 h-[82px] w-auto object-contain drop-shadow-xs sm:h-[90px]"
                  />
                </div>

                {/* Việc làm mới nhất */}
                <div className="flex flex-1 flex-col justify-between">
                  <div className="mb-1.5 flex items-center justify-between">
                    <h3 className="text-xs font-extrabold uppercase tracking-wide text-[#1E5631]">
                      Việc làm mới nhất
                    </h3>
                    <Link
                      to="/jobs"
                      className="text-[11px] font-bold text-[#43A948] hover:underline"
                    >
                      Xem tất cả
                    </Link>
                  </div>

                  <div className="flex flex-col gap-2">
                    {latestJobs.map((job) => (
                      <Link
                        key={job.id}
                        to="/jobs"
                        className="group flex items-center gap-2.5 rounded-xl border border-[#DCEFD3] bg-white px-2.5 py-2 shadow-2xs transition hover:-translate-y-0.5 hover:border-[#4CAF50] hover:shadow-sm"
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-[11px] font-extrabold ${job.logoClass}`}
                        >
                          {job.initials}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-[11.5px] font-extrabold leading-tight text-[#1A241E] group-hover:text-[#1E5631]">
                            {job.title}
                          </p>
                          <p className="mt-0.5 line-clamp-1 text-[9.5px] font-semibold uppercase leading-tight text-gray-500">
                            {job.company}
                          </p>
                          <p className="mt-0.5 text-[9.5px] font-medium leading-tight text-[#2E7D32]">
                            {job.location}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: 3 KPI Cards + 2 Charts */}
              <div className="flex min-w-0 flex-col justify-between gap-3.5">

                {/* Top 3 KPI Cards */}
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3.5">
                  {kpiCards.map((kpi) => (
                    <div
                      key={kpi.id}
                      className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-[#CDEBBF] bg-white px-3.5 py-2.5 shadow-2xs transition hover:border-[#4CAF50] hover:shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-lg font-extrabold tracking-tight text-[#1E5631] sm:text-xl">
                          {kpi.value}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9.5px] font-bold ${kpi.badgeClass}`}
                        >
                          {kpi.badge}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] font-semibold text-[#26352B]">
                        {kpi.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Bottom 2 Charts Grid */}
                <div className="grid flex-1 grid-cols-1 gap-3.5 md:grid-cols-2">

                  {/* CHART 1: Tăng trưởng cơ hội việc làm */}
                  <div className="flex flex-col justify-between rounded-xl border border-[#CDEBBF] bg-white p-3.5 shadow-2xs">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <TrendIcon />
                        <h3 className="text-xs font-extrabold text-[#1A241E] sm:text-[13px]">
                          Tăng trưởng cơ hội việc làm
                        </h3>
                      </div>
                      <span className="rounded-md bg-[#F0FDE1] px-2 py-0.5 text-[9.5px] font-bold text-[#1E5631]">
                        30 ngày qua
                      </span>
                    </div>

                    {/* Line Chart SVG */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="grid grid-cols-[38px_1fr] items-center gap-1.5">
                        {/* Y-axis labels */}
                        <div className="flex h-[150px] flex-col justify-between text-right text-[9.5px] font-semibold text-gray-400">
                          {yAxisGrowth.map((val) => (
                            <span key={val}>{val}</span>
                          ))}
                        </div>

                        {/* Plot area */}
                        <div className="relative h-[150px] w-full overflow-hidden rounded-lg bg-[#FAFDF7] p-1">
                          {/* Dashed horizontal grid lines */}
                          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between py-1">
                            {yAxisGrowth.map((val) => (
                              <div
                                key={val}
                                className="w-full border-b border-dashed border-[#DCEFD3]"
                              />
                            ))}
                          </div>

                          <svg
                            viewBox="0 0 320 150"
                            preserveAspectRatio="none"
                            className="relative z-10 h-full w-full overflow-visible"
                            role="img"
                            aria-label="Biểu đồ đường tăng trưởng cơ hội việc làm"
                          >
                            <defs>
                              <linearGradient id="cviewGrowthArea" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#43A948" stopOpacity="0.32" />
                                <stop offset="100%" stopColor="#43A948" stopOpacity="0.02" />
                              </linearGradient>
                            </defs>

                            {/* Area fill */}
                            <path
                              d="M 10 68 C 22 30, 28 12, 36 12 C 46 12, 56 32, 66 78 C 76 82, 92 26, 102 26 C 114 26, 128 52, 138 96 C 148 96, 162 42, 172 44 C 184 46, 198 94, 210 118 C 222 118, 232 72, 244 74 C 254 76, 262 84, 274 134 C 282 138, 290 128, 296 134 C 302 138, 308 140, 312 142 L 312 150 L 10 150 Z"
                              fill="url(#cviewGrowthArea)"
                            />

                            {/* Smooth curve */}
                            <path
                              d="M 10 68 C 22 30, 28 12, 36 12 C 46 12, 56 32, 66 78 C 76 82, 92 26, 102 26 C 114 26, 128 52, 138 96 C 148 96, 162 42, 172 44 C 184 46, 198 94, 210 118 C 222 118, 232 72, 244 74 C 254 76, 262 84, 274 134 C 282 138, 290 128, 296 134 C 302 138, 308 140, 312 142"
                              fill="none"
                              stroke="#2E9E44"
                              strokeWidth="2.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* X-axis dates */}
                      <div className="mt-1.5 flex justify-between pl-[44px] pr-1 text-[9.5px] font-semibold text-gray-500">
                        {xAxisDates.map((d) => (
                          <span key={d} className="-rotate-25">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* CHART 2: Nhu cầu tuyển dụng theo Ngành nghề */}
                  <div className="flex flex-col justify-between rounded-xl border border-[#CDEBBF] bg-white p-3.5 shadow-2xs">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <TrendIcon />
                        <h3 className="truncate text-xs font-extrabold text-[#1A241E] sm:text-[13px]">
                          Nhu cầu tuyển dụng theo
                        </h3>
                      </div>

                      <select
                        aria-label="Lọc nhu cầu tuyển dụng"
                        value={demandFilter}
                        onChange={(e) => setDemandFilter(e.target.value)}
                        className="shrink-0 rounded-lg border border-[#4CAF50] bg-[#F7FDF2] px-2 py-0.5 text-[11px] font-bold text-[#1E5631] outline-none transition focus:ring-2 focus:ring-[#4CAF50]/30"
                      >
                        <option value="industry">Ngành nghề</option>
                        <option value="level">Cấp bậc</option>
                      </select>
                    </div>

                    {/* Bar Chart Plot */}
                    <div className="grid grid-cols-[36px_1fr] items-end gap-1.5">
                      {/* Y-axis labels */}
                      <div className="flex h-[130px] flex-col justify-between text-right text-[9.5px] font-semibold text-gray-400">
                        {yAxisDemand.map((val) => (
                          <span key={val}>{val}</span>
                        ))}
                      </div>

                      {/* Bars area */}
                      <div className="relative flex h-[130px] items-end justify-around gap-2 rounded-lg bg-[#FAFDF7] px-2.5 pt-3.5">
                        {/* Dashed grid lines */}
                        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between py-1">
                          {yAxisDemand.map((val) => (
                            <div
                              key={val}
                              className="w-full border-b border-dashed border-[#DCEFD3]"
                            />
                          ))}
                        </div>

                        {currentDemand.map((bar) => (
                          <div
                            key={bar.label}
                            className="group relative z-10 flex h-full flex-1 flex-col items-center justify-end"
                          >
                            <span className="mb-0.5 text-[8.5px] font-extrabold text-[#1E5631] opacity-85 group-hover:opacity-100">
                              {bar.value}
                            </span>
                            <div
                              style={{ height: `${bar.heightPercent}%` }}
                              className={`w-full max-w-[34px] rounded-t-md bg-gradient-to-b transition-all duration-500 group-hover:brightness-105 ${bar.barClass}`}
                              title={`${bar.label}: ${bar.value} tin`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 pt-0.5 sm:grid-cols-3">
                      {currentDemand.map((item) => (
                        <div
                          key={item.label}
                          className="flex min-w-0 items-center gap-1"
                          title={item.label}
                        >
                          <span
                            className={`h-1.5 w-3 shrink-0 rounded-full ${item.dotClass}`}
                          />
                          <span className="truncate text-[9.5px] font-semibold text-[#26352B]">
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

export default JobConnectionSection
