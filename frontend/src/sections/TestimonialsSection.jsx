import { useState } from 'react'

import bannerIcon from '../assets/testimonials/banner-icon.png'
import bannerNumber from '../assets/testimonials/banner-number.png'
import testimonialFrame from '../assets/testimonials/testimonial-frame.png'
import testimonialFrameMascot from '../assets/testimonials/testimonial-frame-mascot.png'
import avatarNam from '../assets/testimonials/avatar-nam.png'
import avatarHa from '../assets/testimonials/avatar-ha.png'
import avatarAnh from '../assets/testimonials/avatar-anh.png'
import sparkleSmall from '../assets/testimonials/sparkle-small.png'
import sparkleMedium from '../assets/testimonials/sparkle-medium.png'
import sparkleBurst from '../assets/testimonials/sparkle-burst.png'

import ScrollReveal from '../components/ScrollReveal'

const testimonials = [
  {
    name: 'TRẦN HOÀNG NAM',
    role: 'Thực tập sinh thiết kế',
    avatar: avatarNam,
    quote:
      'Ban đầu mình khá tự ti vì không có nhiều kinh nghiệm. CView giúp mình nhận ra mình cũng có nhiều điểm mạnh!',
    frame: testimonialFrame,
  },
  {
    name: 'LÊ THU HÀ',
    role: 'Sinh viên năm 4',
    avatar: avatarHa,
    quote:
      'CView đã giúp mình tìm được công việc đầu tiên!',
    frame: testimonialFrameMascot,
  },
  {
    name: 'NGUYỄN ĐỨC ANH',
    role: 'Sinh viên năm 2',
    avatar: avatarAnh,
    quote:
      'CView giúp mình hiểu rõ nhu cầu của nhà tuyển dụng, và biết cần làm gì để cải thiện bản thân.',
    frame: testimonialFrame,
  },
]

function TestimonialCard({ testimonial, index, active, onSelect }) {
  return (
    <article
      onClick={() => onSelect(index)}
      role="button"
      tabIndex={0}
      aria-pressed={active}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(index)
        }
      }}
      className={`relative flex h-full cursor-pointer flex-col items-center rounded-[22px] border bg-[#FFFFF8]/90 px-3.5 pb-3.5 pt-3.5 shadow-[0_8px_24px_rgba(77,139,54,0.06)] transition-all duration-300 ease-out sm:px-4 sm:pb-4 sm:pt-4 ${
        active
          ? 'z-10 scale-[1.01] border-[#4CAF50] shadow-[0_14px_30px_rgba(77,139,54,0.16)]'
          : 'z-0 scale-[0.98] border-[#A8D987] opacity-95 hover:opacity-100'
      }`}
    >
      {/* Avatar and decorative frame */}
      <div className="relative mb-2 aspect-square w-[108px] max-w-full sm:w-[118px] lg:w-[125px]">
        <img
          src={testimonial.avatar}
          alt={`Ảnh đại diện ${testimonial.name}`}
          className={`absolute inset-[13%] h-[74%] w-[74%] rounded-[14px] object-cover ${
            index === 1 ? 'object-[68%_15%]' : 'object-center'
          }`}
        />

        <img
          src={testimonial.frame}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-contain"
        />

        {index === 1 && (
          <img
            src={sparkleSmall}
            alt=""
            aria-hidden="true"
            className="absolute -right-1.5 -top-1.5 w-6 sm:w-7"
          />
        )}
      </div>

      {/* User information */}
      <h3 className="text-center text-xs font-extrabold text-[#26351E] sm:text-sm">
        {testimonial.name}
      </h3>

      <p className="mt-0.5 text-center text-[11px] font-medium text-[#46513E] sm:text-xs">
        {testimonial.role}
      </p>

      {/* Rating stars */}
      <div
        className="mt-1 flex items-center justify-center gap-1 text-[#F2D83D]"
        aria-label="Đánh giá minh họa 5 trên 5 sao"
      >
        {Array.from({ length: 5 }).map((_, starIndex) => (
          <span key={starIndex} className="text-sm sm:text-base">
            ★
          </span>
        ))}
      </div>

      {/* Review content */}
      <div className="relative mt-2 flex-1 w-full rounded-xl bg-[#F5F9E9] px-3 py-2.5">
        <span className="absolute left-1.5 -top-1.5 text-xl font-black text-[#A8DE8D]">
          “
        </span>

        <p className="pl-2.5 text-left text-[11.5px] leading-[1.5] text-[#30392B] sm:text-xs">
          {testimonial.quote}
        </p>
      </div>
    </article>
  )
}

function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0)

  const showPrevious = () => {
    setActiveIndex((prev) => (
      prev - 1 + testimonials.length
    ) % testimonials.length)
  }

  const showNext = () => {
    setActiveIndex((prev) => (
      prev + 1
    ) % testimonials.length)
  }

  return (
    <section
      id="danh-gia"
      className="relative isolate w-full overflow-hidden bg-transparent px-4 py-6 sm:px-6 sm:py-8 md:px-10 lg:px-[6%] lg:py-10"
    >
      {/* Background decorations */}
      <div className="pointer-events-none absolute -left-24 -top-24 -z-10 h-64 w-64 rounded-full bg-[#D9F6D2]/70 blur-3xl" />

      <div className="pointer-events-none absolute -right-24 top-20 -z-10 h-72 w-72 rounded-full bg-[#E8F8C8]/70 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-28 left-1/4 -z-10 h-64 w-96 rounded-full bg-[#E4F8D8]/70 blur-3xl" />

      <div className="relative mx-auto w-full max-w-[1040px] px-2 sm:px-6">
        {/* Section heading */}
        <ScrollReveal direction="up">
          <div className="relative mx-auto mb-4 flex w-fit max-w-full items-center justify-center px-7 sm:mb-5">
            <img
              src={sparkleMedium}
              alt=""
              aria-hidden="true"
              className="absolute left-0 top-1/2 w-5 -translate-x-full -translate-y-1/2 -rotate-[20deg] sm:w-8 md:w-9"
            />

            <h2 className="text-center text-xl font-extrabold tracking-tight text-[#26351E] sm:text-2xl md:text-[30px]">
              ĐÁNH GIÁ TỪ NGƯỜI DÙNG
            </h2>

            <img
              src={sparkleMedium}
              alt=""
              aria-hidden="true"
              className="absolute right-0 top-1/2 w-5 translate-x-full -translate-y-1/2 scale-x-[-1] rotate-[20deg] sm:w-8 md:w-9"
            />
          </div>
        </ScrollReveal>

        {/* Achievement banner */}
        <ScrollReveal direction="up" delay={100}>
          <div className="relative mx-auto mb-6 flex w-full max-w-[780px] flex-col items-center justify-center gap-2.5 rounded-3xl border border-[#A6D96F] bg-gradient-to-r from-[#F5FBD9] via-[#FFFFE9] to-[#F4FBD9] px-4 py-3 shadow-[0_5px_20px_rgba(130,174,76,0.08)] sm:flex-row sm:gap-4 sm:rounded-full sm:px-6 md:mb-7 md:gap-5 md:px-9 md:py-3.5">
            <img
              src={bannerIcon}
              alt=""
              aria-hidden="true"
              className="h-10 w-10 shrink-0 object-contain sm:h-12 sm:w-12 md:h-14 md:w-14"
            />

            <div className="flex min-w-0 flex-col items-center">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4">
                <span className="text-xs font-extrabold text-[#26351E] sm:text-sm md:text-base">
                  HƠN
                </span>

                <img
                  src={bannerNumber}
                  alt="1.000 cộng"
                  className="w-28 object-contain sm:w-36 md:w-44"
                />

                <span className="max-w-[165px] text-center text-[11px] font-extrabold leading-tight text-[#26351E] sm:text-xs md:text-sm">
                  NGƯỜI ĐÃ TÌM ĐƯỢC CÔNG VIỆC ƯNG Ý
                </span>
              </div>

              <p className="mt-1 text-center text-[11px] font-medium text-[#34432B] sm:text-xs">
                Kết nối đúng cơ hội, tự tin bứt phá sự nghiệp
              </p>
            </div>

            <img
              src={sparkleBurst}
              alt=""
              aria-hidden="true"
              className="absolute -right-2 top-1/2 hidden w-10 -translate-y-1/2 md:block lg:w-14"
            />
          </div>
        </ScrollReveal>

        {/* Testimonial cards */}
        <div className="mx-auto grid w-full max-w-[960px] grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className={
                index === activeIndex
                  ? 'block'
                  : 'hidden sm:block'
              }
            >
              <ScrollReveal
                direction="up"
                delay={150 + index * 120}
                className="h-full"
              >
                <TestimonialCard
                  testimonial={testimonial}
                  index={index}
                  active={index === activeIndex}
                  onSelect={setActiveIndex}
                />
              </ScrollReveal>
            </div>
          ))}
        </div>

        {/* Carousel controls */}
        <div className="mt-4 flex items-center justify-center gap-4 sm:mt-5">
          <button
            type="button"
            onClick={showPrevious}
            aria-label="Đánh giá trước"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#43A943] text-base font-bold text-[#1E5631] transition hover:bg-[#E6FADD] sm:hidden"
          >
            ‹
          </button>

          <div className="flex items-center justify-center gap-2.5">
            {testimonials.map((testimonial, index) => (
              <button
                key={testimonial.name}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Xem đánh giá ${index + 1}`}
                aria-pressed={activeIndex === index}
                className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                  activeIndex === index
                    ? 'bg-[#43A943]'
                    : 'border-2 border-[#43A943] bg-transparent hover:bg-[#BDE8A7]'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={showNext}
            aria-label="Đánh giá tiếp theo"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#43A943] text-base font-bold text-[#1E5631] transition hover:bg-[#E6FADD] sm:hidden"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
