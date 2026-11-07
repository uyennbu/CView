
import { useState } from 'react'

import bannerIcon from '../assets/testimonials/banner-icon.png'
import bannerNumber from '../assets/testimonials/banner-number.png'
import testimonialFrame from '../assets/testimonials/testimonial-frame.png'
import testimonialFrameMascot from '../assets/testimonials/testimonial-frame-mascot.png'
import avatarNam from '../assets/testimonials/avatar-nam.png'
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
      'Ban đầu mình khá tự ti vì không có nhiều kinh nghiệm. CView giúp mình nhận ra những điểm mạnh và định hướng cơ hội nghề nghiệp phù hợp hơn.',
    frame: testimonialFrame,
  },
  {
    name: 'LÊ THU HÀ',
    role: 'Sinh viên năm 4',
    initials: 'H',
    quote:
      'CView giúp mình tìm được những cơ hội việc làm phù hợp với định hướng và kỹ năng của bản thân.',
    frame: testimonialFrameMascot,
  },
  {
    name: 'NGUYỄN ĐỨC ANH',
    role: 'Sinh viên năm 2',
    initials: 'A',
    quote:
      'Giao diện dễ sử dụng, thông tin tuyển dụng đa dạng. Mình có thể chủ động khám phá những cơ hội mới.',
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
      className={`relative flex h-full cursor-pointer flex-col items-center rounded-[26px] border bg-[#FFFFF8]/90 px-4 pb-5 pt-5 shadow-[0_8px_24px_rgba(77,139,54,0.06)] transition-all duration-500 ease-out ${
        active
          ? 'z-10 scale-[1.03] border-[#4CAF50] shadow-[0_16px_35px_rgba(77,139,54,0.18)] lg:scale-[1.07]'
          : 'z-0 scale-[0.97] border-[#A8D987] opacity-80 hover:opacity-100 lg:scale-[0.94]'
      }`}
    >
      {/* Avatar and decorative frame */}
      <div className="relative mb-3 aspect-square w-[145px] max-w-full">
        {testimonial.avatar ? (
          <img
            src={testimonial.avatar}
            alt={`Ảnh đại diện ${testimonial.name}`}
            className="absolute inset-[13%] h-[74%] w-[74%] rounded-[18px] object-cover"
          />
        ) : (
          <div className="absolute inset-[16%] flex items-center justify-center rounded-[18px] bg-gradient-to-br from-[#E5F7D9] to-[#B9E9A5] text-5xl font-extrabold text-[#347C36]">
            {testimonial.initials}
          </div>
        )}

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
            className="absolute -right-2 -top-2 w-8"
          />
        )}
      </div>

      {/* User information */}
      <h3 className="text-center text-sm font-extrabold text-[#26351E] md:text-base">
        {testimonial.name}
      </h3>

      <p className="mt-1 text-center text-xs font-medium text-[#46513E] md:text-sm">
        {testimonial.role}
      </p>

      {/* Rating stars */}
      <div
        className="mt-2 flex items-center justify-center gap-1 text-[#F2D83D]"
        aria-label="Đánh giá minh họa 5 trên 5 sao"
      >
        {Array.from({ length: 5 }).map((_, starIndex) => (
          <span key={starIndex} className="text-base md:text-lg">
            ★
          </span>
        ))}
      </div>

      {/* Review content */}
      <div className="relative mt-3 w-full rounded-2xl bg-[#F5F9E9] px-3 py-3">
        <span className="absolute -left-1 -top-3 text-3xl font-black text-[#A8DE8D]">
          “
        </span>

        <p className="text-justify text-xs leading-[1.6] text-[#30392B] md:text-sm">
          {testimonial.quote}
        </p>
      </div>
    </article>
  )
}

function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <section
      id="danh-gia"
      className="relative isolate min-h-screen overflow-hidden bg-transparent px-5 py-16 md:px-10 lg:px-[8%] lg:py-20"
    >
      {/* Background decorations */}
      <div className="pointer-events-none absolute -left-24 -top-24 -z-10 h-64 w-64 rounded-full bg-[#D9F6D2]/70 blur-3xl" />

      <div className="pointer-events-none absolute -right-24 top-20 -z-10 h-72 w-72 rounded-full bg-[#E8F8C8]/70 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-28 left-1/4 -z-10 h-64 w-96 rounded-full bg-[#E4F8D8]/70 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        {/* Section heading */}
        <ScrollReveal direction="up">
          <div className="relative mx-auto mb-8 flex w-fit items-center justify-center">
            {/* Left sparkle */}
            <img
              src={sparkleMedium}
              alt=""
              aria-hidden="true"
              className="absolute -left-10 -top-5 w-10 -rotate-[20deg] md:w-12"
            />

            <h2 className="text-center text-2xl font-extrabold tracking-tight text-[#26351E] md:text-3xl lg:text-4xl">
              ĐÁNH GIÁ TỪ NGƯỜI DÙNG
            </h2>

            {/* Right sparkle */}
            <img
              src={sparkleMedium}
              alt=""
              aria-hidden="true"
              className="absolute -right-10 -top-5 w-10 scale-x-[-1] rotate-[20deg] md:w-12"
            />
          </div>
        </ScrollReveal>

        {/* Achievement banner */}
        <ScrollReveal direction="up" delay={100}>
          <div className="relative mx-auto mb-14 flex w-full max-w-[900px] items-center justify-center gap-4 rounded-full border border-[#A6D96F] bg-gradient-to-r from-[#F5FBD9] via-[#FFFFE9] to-[#F4FBD9] px-7 py-5 shadow-[0_5px_20px_rgba(130,174,76,0.08)] md:gap-7 md:px-12 md:py-6">
            {/* Briefcase icon */}
            <img
              src={bannerIcon}
              alt=""
              className="h-16 w-16 shrink-0 object-contain md:h-20 md:w-20"
            />

            <div className="flex min-w-0 flex-col items-center">
              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5">
                <span className="text-base font-extrabold text-[#26351E] md:text-lg lg:text-xl">
                  HƠN
                </span>

                <img
                  src={bannerNumber}
                  alt="1.000 cộng"
                  className="w-40 object-contain md:w-56 lg:w-60"
                />

                <span className="max-w-[170px] text-sm font-extrabold leading-tight text-[#26351E] md:text-base">
                  NGƯỜI ĐÃ TÌM ĐƯỢC CÔNG VIỆC ƯNG Ý
                </span>
              </div>

              <p className="mt-2 text-center text-xs font-medium text-[#34432B] md:text-sm">
                Kết nối đúng cơ hội, tự tin bứt phá sự nghiệp
              </p>
            </div>

            {/* Banner sparkle */}
      <img
  src={sparkleBurst}
  alt=""
  aria-hidden="true"
  className="absolute -right-2 top-1/2 hidden w-16 -translate-y-1/2 md:block lg:w-20"
/>
          </div>
        </ScrollReveal>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
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

        {/* Carousel indicators */}
        <div className="mt-8 flex items-center justify-center gap-3">
          {testimonials.map((testimonial, index) => (
            <button
              key={testimonial.name}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Xem đánh giá ${index + 1}`}
              aria-pressed={activeIndex === index}
              className={`h-3 rounded-full transition-all duration-300 ${
                activeIndex === index
                  ? 'w-3 bg-[#43A943]'
                  : 'w-3 border-2 border-[#43A943] bg-transparent hover:bg-[#BDE8A7]'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
