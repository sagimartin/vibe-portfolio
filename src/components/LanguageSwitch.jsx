const OPTIONS = ['en', 'hu']

function LanguageSwitch({ language, onChange, label }) {
  return (
    <div className="langpill" role="group" aria-label={label || 'Language'}>
      {OPTIONS.map((option) => (
        <button
          type="button"
          key={option}
          aria-pressed={language === option}
          onClick={() => onChange(option)}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

export default LanguageSwitch
