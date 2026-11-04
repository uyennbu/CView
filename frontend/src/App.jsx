import Navbar from './components/Navbar'
import HeroSection from './sections/HeroSection'

function App() {
  return (
   <div className="cview-page-background text-cview-dark">
      <Navbar />

      <main>
        <HeroSection />
      </main>
    </div>
  )
}

export default App