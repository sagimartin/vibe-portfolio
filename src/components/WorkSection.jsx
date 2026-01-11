import WorkCard from './WorkCard.jsx'

function WorkSection(props) {
  const cards = props.cards
  const onOpenProject = props.onOpenProject
  const title = props.title || 'Selected Work'
  const ctaLabel = props.ctaLabel
  const ariaLabel = props.ariaLabel || 'Work'

  return (
    <section id="work" aria-label={ariaLabel}>
      <div className="container section-inner work-section-inner">
        <h2 className="section-title reveal delay-1">{title}</h2>
        <div className="grid">
          {cards.map(function (card) {
            return (
              <WorkCard
                key={card.id}
                card={card}
                ctaLabel={ctaLabel}
                onOpen={onOpenProject}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default WorkSection
