import Navbar from './components/Navbar'
import HeroSection from './sections/HeroSection'
import CVAnalysisSection from './sections/CVAnalysisSection'
import JobConnectionSection from './sections/JobConnectionSection'
import TestimonialsSection from './sections/TestimonialsSection'
function App() {
  return (
    <div className="cview-page-background text-cview-dark">
      <Navbar />

      <main>
        <HeroSection />
        <CVAnalysisSection />
        <JobConnectionSection />
        <TestimonialsSection />
      </main>
    </div>
  )
}

export default App