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

function App() {
  const [activeSection, setActiveSection] = useState('hero')
  const [activeProjectId, setActiveProjectId] = useState(null)
  const [showCredits, setShowCredits] = useState(false)
  const [language, setLanguage] = useState('en')
  const [headerVisible, setHeaderVisible] = useState(false)
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

  useEffect(() => {
    const reduceMotion = window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

    if (reduceMotion) return undefined

    const sections = segments.map((segment) => document.getElementById(segment.id)).filter(Boolean)
    if (!sections.length) return undefined

    let isSnapping = false
    let wheelLockTimer = null

    const getHeaderHeight = () => {
      const value = getComputedStyle(document.documentElement).getPropertyValue('--header-h')
      const parsed = parseInt(value, 10)
      return Number.isNaN(parsed) ? 64 : parsed
    }

    const getNearestSectionIndex = () => {
      let bestIdx = 0
      let bestDist = Infinity
      const headerH = getHeaderHeight()

      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect()
        const dist = Math.abs(rect.top - headerH)
        if (dist < bestDist) {
          bestDist = dist
          bestIdx = index
        }
      })

      return bestIdx
    }

    const snapToIndex = (idx) => {
      let nextIndex = idx
      if (nextIndex < 0) nextIndex = 0
      if (nextIndex > sections.length - 1) nextIndex = sections.length - 1

      isSnapping = true
      const id = sections[nextIndex].id
      setActiveSection(id)
      sections[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'start' })

      window.clearTimeout(wheelLockTimer)
      wheelLockTimer = window.setTimeout(() => {
        isSnapping = false
      }, 650)
    }

    const onWheel = (event) => {
      if (event.ctrlKey) return
      if (isSnapping) {
        event.preventDefault()
        return
      }

      const deltaY = event.deltaY || 0
      if (Math.abs(deltaY) < 12) return

      event.preventDefault()
      const currentIdx = getNearestSectionIndex()
      const nextIdx = deltaY > 0 ? currentIdx + 1 : currentIdx - 1
      snapToIndex(nextIdx)
    }

    window.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      window.removeEventListener('wheel', onWheel)
      window.clearTimeout(wheelLockTimer)
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
      <ThemeSwitch isVisible={showCredits} />
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
    </>
  )
}

export default App
