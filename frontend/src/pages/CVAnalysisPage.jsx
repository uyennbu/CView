import { useState } from 'react'
import CVUpload from '../components/CVUpload'
import CVAnalysisOverview from '../components/analysis/CVAnalysisOverview'

export default function CVAnalysisPage() {
  const [showResults, setShowResults] = useState(false)

  const handleAnalyze = (file) => {
    if (!file) return

    // Demo UI: chuyển sang giao diện kết quả.
    // Chưa thực hiện phân tích CV thật.
    setShowResults(true)
  }

  return (
    <main className="relative w-full overflow-x-clip">
      <div
        className="
          mx-auto w-full max-w-[1140px]
          px-4 pb-6 pt-3
          sm:px-6 sm:pb-8 sm:pt-4
          lg:px-12 lg:pb-10 lg:pt-5
        "
      >
        {!showResults ? (
          <>
            {/* Page Heading */}
            <section
              className="
                mx-auto mb-5 w-full max-w-2xl
                text-center
                sm:mb-6
              "
            >
              <h1
                className="
                  break-words text-2xl font-extrabold
                  uppercase leading-tight tracking-tight
                  text-cview-dark
                  sm:text-3xl
                  md:text-4xl
                "
              >
                Phân tích CV
              </h1>

              <p
                className="
                  mx-auto mt-2 max-w-xl
                  text-xs leading-relaxed text-cview-dark
                  sm:mt-2.5 sm:text-sm
                  md:text-base
                "
              >
                Phân tích độ phù hợp của CV với các công việc đang có,
                gợi ý cách cải thiện CV, nâng cao cơ hội nghề nghiệp.
              </p>
            </section>

            {/* CV Upload */}
            <section className="mx-auto w-full max-w-3xl">
              <CVUpload onAnalyze={handleAnalyze} />
            </section>
          </>
        ) : (
          /* Analysis Results */
          <section className="w-full min-w-0">
            <CVAnalysisOverview />
          </section>
        )}
      </div>
    </main>
  )
}
