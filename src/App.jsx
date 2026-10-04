import { useEffect, useMemo, useState } from 'react'
import './App.css'
import SiteBar from './components/SiteBar.jsx'
import Hero from './components/Hero.jsx'
import Work from './components/Work.jsx'
import Snapshot from './components/Snapshot.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import { COPY } from './content/index.js'
import { getLocalizedProjects } from './lib/projects.js'
import { Analytics } from '@vercel/analytics/react'

const LANG_KEY = 'sagi-lang'

function readLanguage() {
  try {
    const stored = sessionStorage.getItem(LANG_KEY)
    return stored === 'hu' || stored === 'en' ? stored : 'en'
  } catch {
    return 'en'
  }
}

function App() {
  const [language, setLanguage] = useState(readLanguage)
  const strings = COPY[language] || COPY.en
  const projects = useMemo(() => getLocalizedProjects(language), [language])

  useEffect(() => {
    document.documentElement.setAttribute('lang', language)
    try {
      sessionStorage.setItem(LANG_KEY, language)
    } catch {
      // ignore
    }
  }, [language])

  return (
    <>
      <SiteBar language={language} onLanguageChange={setLanguage} strings={strings.bar} />
      <main>
        <Hero strings={strings.hero} scrollLabel={strings.hero.scroll} ariaLabel={strings.nav.home} />
        <Work strings={strings.work} projects={projects} ariaLabel={strings.nav.work} />
        <Snapshot strings={strings.snapshot} language={language} ariaLabel={strings.snapshot.eyebrow} />
        <Contact strings={strings.contact} language={language} ariaLabel={strings.nav.contact} />
      </main>
      <Footer
        strings={strings.footer}
        barStrings={strings.bar}
        language={language}
        onLanguageChange={setLanguage}
      />
      <Analytics />
    </>
  )
}

export default App
