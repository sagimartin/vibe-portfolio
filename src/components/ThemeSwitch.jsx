import { toggleTheme, useTheme } from '../lib/theme.js'

function Sun() {
  return (
    <svg className="sun" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  )
}

function Moon() {
  return (
    <svg className="moon" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18.96 10.79a8.5 8.5 0 1 1-9.79-9.79 6.5 6.5 0 0 0 9.79 9.79Z" />
    </svg>
  )
}

function ThemeSwitch({ label }) {
  const theme = useTheme()
  const dark = theme === 'dark'

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleTheme()
    }
  }

  return (
    <div
      className={dark ? 'theme-switch is-dark' : 'theme-switch'}
      role="switch"
      aria-checked={dark}
      aria-label={label || 'Toggle theme'}
      tabIndex={0}
      onClick={toggleTheme}
      onKeyDown={handleKeyDown}
    >
      <span className="thumb" aria-hidden="true">
        <Sun />
        <Moon />
      </span>
      <div className="bg" aria-hidden="true">
        <Sun />
        <Moon />
      </div>
    </div>
  )
}

export default ThemeSwitch
