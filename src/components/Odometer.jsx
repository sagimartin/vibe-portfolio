function Odometer({ value, active }) {
  const chars = Array.from(value)
  let digitIndex = 0

  return (
    <span className="odo" role="img" aria-label={value}>
      {chars.map((ch, i) => {
        if (/\d/.test(ch)) {
          const order = digitIndex
          digitIndex += 1
          const ty = active ? '-' + (10 + Number(ch)) + 'em' : '0em'
          return (
            <span className="dg" key={'d' + i} aria-hidden="true">
              <span
                className="col"
                style={{
                  '--ty': ty,
                  transition: active
                    ? 'transform ' + (1.5 + order * 0.12) + 's cubic-bezier(.16,1,.3,1) ' + order * 0.07 + 's'
                    : 'none'
                }}
              >
                {Array.from({ length: 20 }, (_, k) => (
                  <span key={k}>{k % 10}</span>
                ))}
              </span>
            </span>
          )
        }
        return (
          <span className={ch === ' ' ? 'ch sep' : 'ch'} key={'c' + i} aria-hidden="true">
            {ch === ' ' ? '' : ch}
          </span>
        )
      })}
    </span>
  )
}

export default Odometer
