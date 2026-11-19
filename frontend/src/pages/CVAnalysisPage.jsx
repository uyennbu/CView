
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
    <main className="relative mx-auto min-h-[80vh] w-full max-w-[1440px] px-4 py-8 sm:px-6 sm:py-12 lg:px-14">

      {!showResults ? (
        <>
          <section className="mx-auto mb-8 max-w-3xl text-center">
            <h1 className="text-3xl font-extrabold uppercase text-cview-dark sm:text-4xl lg:text-5xl">
              Phân tích CV
            </h1>

            <p className="mt-4 text-sm leading-relaxed text-cview-dark sm:text-base lg:text-lg">
              Phân tích độ phù hợp của CV với các công việc đang có,
              gợi ý cách cải thiện CV, nâng cao cơ hội nghề nghiệp.
            </p>
          </section>

          <CVUpload onAnalyze={handleAnalyze} />
        </>
      ) : (
        <CVAnalysisOverview />
      )}

    </main>
  )
}
