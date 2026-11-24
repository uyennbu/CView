
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
    <main className="relative min-h-[80vh] w-full overflow-x-clip">
      <div
        className="
          mx-auto w-full max-w-[1440px]
          px-4 py-8
          sm:px-6 sm:py-10
          md:py-12
          lg:px-14 lg:py-14
        "
      >
        {!showResults ? (
          <>
            {/* Page Heading */}
            <section
              className="
                mx-auto mb-8 w-full max-w-3xl
                text-center
                sm:mb-10
                lg:mb-12
              "
            >
              <h1
                className="
                  break-words text-3xl font-extrabold
                  uppercase leading-tight tracking-tight
                  text-cview-dark
                  sm:text-4xl
                  md:text-5xl
                "
              >
                Phân tích CV
              </h1>

              <p
                className="
                  mx-auto mt-3 max-w-2xl
                  text-sm leading-relaxed text-cview-dark
                  sm:mt-4 sm:text-base
                  md:text-lg
                "
              >
                Phân tích độ phù hợp của CV với các công việc đang có,
                gợi ý cách cải thiện CV, nâng cao cơ hội nghề nghiệp.
              </p>
            </section>

            {/* CV Upload */}
            <section className="mx-auto w-full max-w-5xl">
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
