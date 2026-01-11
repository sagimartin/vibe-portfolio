function LanguageSwitch(props) {
  var language = props.language
  var onChange = props.onChange
  var variant = props.variant || 'footer'

  function setLanguage(next) {
    if (typeof onChange === 'function') onChange(next)
  }
  var options = ['en', 'hu']
  var className = 'language-switch language-switch-' + variant

  return (
    <div className={className} role="group" aria-label="Language">
      {options.map(function (option) {
        return (
          <button
            type="button"
            key={option}
            className={language === option ? 'language-option is-active' : 'language-option'}
            onClick={function () {
              setLanguage(option)
            }}
            aria-pressed={language === option}
          >
            {option.toUpperCase()}
          </button>
        )
      })}
    </div>
  )
}

export default LanguageSwitch
