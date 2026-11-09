
import mascotContact from '../assets/contact/mascot-contact.png'
import envelope from '../assets/contact/envelope.png'
import speechBubble from '../assets/contact/speech-bubble.png'
import contactCard from '../assets/contact/contact-card.png'
import lightbulb from '../assets/contact/lightbulb.png'
import facebook from '../assets/contact/facebook.png'
import instagram from '../assets/contact/instagram.png'
import ScrollReveal from '../components/ScrollReveal'

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.56 3.58.56a1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.19 2.46.56 3.58a1 1 0 01-.25 1.01l-2.19 2.2z" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M4 7l8 6 8-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M12 2a8 8 0 00-8 8c0 5.5 8 12 8 12s8-6.5 8-12a8 8 0 00-8-8zm0 11a3 3 0 110-6 3 3 0 010 6z" />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-9 w-9">
      <path d="M12 .9a11.1 11.1 0 00-3.51 21.63c.56.1.76-.24.76-.54v-2.1c-3.1.68-3.76-1.32-3.76-1.32-.5-1.3-1.24-1.64-1.24-1.64-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.71 2.62 1.22 3.26.93.1-.72.39-1.22.71-1.5-2.48-.28-5.09-1.24-5.09-5.52 0-1.22.44-2.21 1.16-2.99-.12-.28-.5-1.42.11-2.95 0 0 .95-.3 3.05 1.14a10.6 10.6 0 015.55 0c2.1-1.44 3.04-1.14 3.04-1.14.61 1.53.23 2.67.12 2.95.72.78 1.15 1.77 1.15 2.99 0 4.29-2.61 5.23-5.1 5.51.4.35.76 1.03.76 2.08v3.09c0 .3.2.65.77.54A11.1 11.1 0 0012 .9z" />
    </svg>
  )
}

const contactItems = [
  {
    icon: PhoneIcon,
    value: '0825630210',
    href: 'tel:0825630210',
    label: 'Điện thoại',
  },
  {
    icon: MailIcon,
    value: 'cview@gmail.com',
    href: 'mailto:cview@gmail.com',
    label: 'Email',
  },
  {
    icon: LocationIcon,
    value: '336 Nguyễn Trãi, Thanh Xuân, Hà Nội',
    href: 'https://www.google.com/maps/search/?api=1&query=336+Nguyen+Trai+Thanh+Xuan+Ha+Noi',
    label: 'Địa chỉ',
  },
]

function ContactSection() {
  return (
    <section
      id="lien-he"
      className="relative isolate min-h-[560px] overflow-hidden bg-transparent px-6 py-12 md:min-h-[620px] md:px-10 lg:min-h-[650px] lg:px-[6%] lg:py-16"
    >
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-28 h-64 w-64 rounded-full border border-[#A7DFA0]/70"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-28 top-24 h-44 w-44 rounded-full bg-[#F9FACA]/70 blur-2xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-36 left-[28%] h-72 w-96 rounded-full bg-[#E6FADD]/70 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-36 right-[-8%] h-64 w-96 rounded-full bg-[#F0FDE1]/80 blur-3xl"
      />

      {/* Main content */}
      <div className="relative mx-auto grid min-h-[480px] max-w-[1400px] items-center gap-4 lg:grid-cols-[1.08fr_0.92fr]">

        {/* Left: contact information */}
        <div className="relative z-20 flex flex-col justify-center">

          {/* Heading */}
          <ScrollReveal direction="up">
            <h2 className="mb-8 text-center text-[30px] font-extrabold leading-tight tracking-tight text-[#1A241E] sm:text-4xl lg:mb-9 lg:-translate-x-9 lg:text-[42px] xl:text-[48px]">
              LIÊN HỆ VỚI CHÚNG TÔI
            </h2>
          </ScrollReveal>

          {/* Contact information */}
          <ScrollReveal direction="left" delay={100}>
            <div className="flex max-w-[650px] flex-col gap-5">
              {contactItems.map((item) => {
                const Icon = item.icon

                return (
                  <a
                    key={item.label}
                    href={item.href}
                    aria-label={`${item.label}: ${item.value}`}
                    className="group flex min-h-[54px] items-center gap-4 rounded-full border-[2.5px] border-[#4CAF50] bg-[#FEFFFA]/85 px-2 py-2 text-[#263322] shadow-sm transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-md md:min-h-[58px] md:gap-5"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#075B3D] text-white transition group-hover:bg-[#1E5631] md:h-10 md:w-10">
                      <Icon />
                    </span>

                    <span className="min-w-0 flex-1 text-center text-base font-medium md:text-lg lg:text-xl">
                      {item.value}
                    </span>

                    <span className="w-2 shrink-0" />
                  </a>
                )
              })}
            </div>
          </ScrollReveal>

          {/* Social media */}
          <ScrollReveal direction="up" delay={200}>
            <div className="mt-9 flex items-center justify-center gap-7 lg:-translate-x-9 lg:gap-8">
              <a
                href="#"
                aria-label="Facebook CView"
                className="transition duration-300 hover:-translate-y-1 hover:scale-110"
              >
                <img
                  src={facebook}
                  alt=""
                  className="h-9 w-9 object-contain md:h-10 md:w-10"
                />
              </a>

              <a
                href="#"
                aria-label="Instagram CView"
                className="transition duration-300 hover:-translate-y-1 hover:scale-110"
              >
                <img
                  src={instagram}
                  alt=""
                  className="h-9 w-9 object-contain md:h-10 md:w-10"
                />
              </a>

              <a
                href="#"
                aria-label="GitHub CView"
                className="text-[#075B3D] transition duration-300 hover:-translate-y-1 hover:scale-110 hover:text-[#4CAF50]"
              >
                <GithubIcon />
              </a>
            </div>
          </ScrollReveal>

        </div>

        {/* Right: mascot and decorations */}
        <ScrollReveal direction="right" delay={150}>
          <div className="relative mx-auto flex w-full max-w-[650px] items-center justify-center lg:min-h-[500px]">

            <img
              src={mascotContact}
              alt="Mascot CView đang làm việc bên laptop"
              className="relative z-10 w-full object-contain"
            />

            <img
              src={speechBubble}
              alt=""
              aria-hidden="true"
              className="absolute -top-5 right-[18%] z-20 w-[42%] max-w-[240px] object-contain md:-top-8 md:right-[18%]"
            />

            <img
              src={envelope}
              alt=""
              aria-hidden="true"
              className="absolute right-[5%] top-[8%] z-20 w-10 object-contain md:w-12"
            />

            <img
              src={contactCard}
              alt=""
              aria-hidden="true"
              className="absolute left-[48%] top-[15%] z-20 w-14 object-contain md:w-16"
            />

            <img
              src={lightbulb}
              alt=""
              aria-hidden="true"
              className="absolute left-[13%] top-[23%] z-20 w-12 object-contain md:w-14"
            />

          </div>
        </ScrollReveal>

      </div>

      {/* Bottom decorative curves */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="pointer-events-none absolute bottom-0 left-0 h-20 w-full opacity-70 md:h-28"
      >
        <path
          d="M-20 65 C180 -15 280 120 470 70 S760 15 930 65 S1240 120 1460 45"
          fill="none"
          stroke="#A7DFA0"
          strokeWidth="1.5"
        />

        <path
          d="M-20 88 C180 20 310 140 510 90 S790 35 960 85 S1260 140 1460 70"
          fill="none"
          stroke="#D8EFA9"
          strokeWidth="1.5"
        />
      </svg>
    </section>
  )
}

export default ContactSection
