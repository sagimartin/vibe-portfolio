import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import Header from './components/Header.jsx'
import HeroSection from './components/HeroSection.jsx'
import WorkSection from './components/WorkSection.jsx'
import ContactSection from './components/ContactSection.jsx'
import Footer from './components/Footer.jsx'
import LanguageSwitch from './components/LanguageSwitch.jsx'
import ThemeSwitch from './components/ThemeSwitch.jsx'
import WorkModal from './components/WorkModal.jsx'
import { COPY, PROJECT_IMAGES, PROJECT_TRANSLATIONS, TAG_LABELS } from './content/index.js'
import projectsData from './data/projects.json'
import { Analytics } from '@vercel/analytics/react'

function App() {
  const [activeSection, setActiveSection] = useState('hero')
  const [activeProjectId, setActiveProjectId] = useState(null)
  const [showCredits, setShowCredits] = useState(false)
  const [language, setLanguage] = useState('en')
  const [headerVisible, setHeaderVisible] = useState(false)
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return true
    return window.matchMedia('(min-width: 769px)').matches
  })
  const strings = COPY[language] || COPY.en
  const segments = useMemo(
    () => [
      { id: 'hero', label: strings.nav.home },
      { id: 'work', label: strings.nav.work },
      { id: 'contact', label: strings.nav.contact }
    ],
    [strings.nav.home, strings.nav.work, strings.nav.contact]
  )

  const handleIntroDone = useCallback(() => {
    setHeaderVisible(true)
  }, [])

  const localizedProjects = useMemo(() => {
    return projectsData.projects
      .map((project) => {
        const imageKey = project.imageKey
        const imageSet = imageKey ? PROJECT_IMAGES[imageKey] || {} : {}
        const translation =
          language === 'hu' ? (PROJECT_TRANSLATIONS.hu[project.id] || {}) : {}
        const tagLabels = TAG_LABELS[language] || TAG_LABELS.en

        return {
          ...project,
          summary: translation.summary || project.summary,
          description: translation.description || project.description,
          tags: Array.isArray(project.tags)
            ? project.tags.map((tag) => tagLabels[tag] || tag)
            : [],
          imageLight: imageSet.light,
          imageDark: imageSet.dark
        }
      })
      .slice()
      .sort((a, b) => {
        const domainA = (a.title || '').toLowerCase()
        const domainB = (b.title || '').toLowerCase()
        return domainA.localeCompare(domainB, language)
      })
      .map((project, index) => ({
        ...project,
        delayClass: 'delay-' + String(Math.min(index + 1, 3))
      }))
  }, [language])

  const activeProject = useMemo(() => {
    if (!activeProjectId) return null
    return localizedProjects.find((project) => project.id === activeProjectId) || null
  }, [activeProjectId, localizedProjects])

  useEffect(() => {
    document.documentElement.setAttribute('lang', language)
  }, [language])

  useEffect(() => {
    document.documentElement.setAttribute('data-contact-visible', showCredits ? 'true' : 'false')
  }, [showCredits])

  useEffect(() => {
    const mediaQuery = window.matchMedia ? window.matchMedia('(min-width: 769px)') : null
    if (!mediaQuery) return undefined

    function handleChange(event) {
      setIsDesktop(event.matches)
    }

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => {
        mediaQuery.removeEventListener('change', handleChange)
      }
    }

    mediaQuery.addListener(handleChange)
    return () => {
      mediaQuery.removeListener(handleChange)
    }
  }, [])

  const themeSwitchVisible = isDesktop ? headerVisible : showCredits

  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal')
    if (!reveals.length) return undefined

    if (!('IntersectionObserver' in window)) {
      reveals.forEach((el) => {
        el.classList.add('visible')
      })
      return undefined
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible')
        })
      },
      { threshold: 0.15 }
    )

    reveals.forEach((el) => {
      revealObserver.observe(el)
    })

    return () => {
      revealObserver.disconnect()
    }
  }, [segments])

  useEffect(() => {
    const sections = segments.map((segment) => document.getElementById(segment.id)).filter(Boolean)
    if (!sections.length || !('IntersectionObserver' in window)) return undefined

    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
            if (entry.target.id === 'contact') {
              setShowCredits(true)
            }
          } else if (entry.target.id === 'contact') {
            setShowCredits(false)
          }
        })
      },
      { threshold: 0.6 }
    )

    sections.forEach((section) => {
      navObserver.observe(section)
    })

    return () => {
      navObserver.disconnect()
    }
  }, [segments])

  const handleSelectSection = (id) => {
    setActiveSection(id)
    const section = document.getElementById(id)
    if (!section) return

    const reduceMotion = window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

    section.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
  }

  const handleOpenProject = (projectId) => {
    setActiveProjectId(projectId)
  }

  const handleCloseProject = () => {
    setActiveProjectId(null)
  }

  return (
    <>
      <Header
        segments={segments}
        activeSection={activeSection}
        onSelect={handleSelectSection}
        isVisible={headerVisible}
      />
      <ThemeSwitch isVisible={themeSwitchVisible} />
      <main>
        <HeroSection
          greeting={strings.hero.greeting}
          beforeName={strings.hero.beforeName}
          afterName={strings.hero.afterName}
          rotating={strings.hero.rotating}
          ariaLabel={strings.nav.home}
          onIntroDone={handleIntroDone}
        />
        <WorkSection
          title={strings.work.title}
          ctaLabel={strings.work.cta}
          cards={localizedProjects}
          onOpenProject={handleOpenProject}
          ariaLabel={strings.nav.work}
        />
        <ContactSection
          eyebrow={strings.contact.eyebrow}
          title={strings.contact.title}
          text={strings.contact.text}
          ctaMessage={strings.contact.ctaMessage}
          ctaCall={strings.contact.ctaCall}
          replies={strings.contact.replies}
          pills={strings.contact.pills}
          socials={strings.contact.socials}
          messageSubject={strings.contact.messageSubject}
          callLink={strings.contact.callLink}
          metaVisible={showCredits}
        />
      </main>
      <Footer isVisible={showCredits} text={strings.footer.credits} />
      <div className={showCredits ? 'language-corner is-visible' : 'language-corner'}>
        <LanguageSwitch language={language} onChange={setLanguage} variant="corner" />
      </div>
      <WorkModal
        project={activeProject}
        eyebrow={strings.work.eyebrow}
        linkLabel={strings.work.linkLabel}
        onClose={handleCloseProject}
      />
      <Analytics />
    </>
  )
}

export default App
