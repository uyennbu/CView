import Navbar from './components/Navbar'
import HeroSection from './sections/HeroSection'
import CVAnalysisSection from './sections/CVAnalysisSection'

function App() {
  return (
    <div className="cview-page-background text-cview-dark">
      <Navbar />

      <main>
        <HeroSection />
        <CVAnalysisSection />
      </main>
    </div>
  )
}

export default App