import projectsData from '../data/projects.json'
import { PROJECT_IMAGES, PROJECT_LOGO_FIT, PROJECT_TRANSLATIONS } from '../content/index.js'

export function getLocalizedProjects(language) {
  return projectsData.projects
    .map((project) => {
      const imageSet = (project.imageKey && PROJECT_IMAGES[project.imageKey]) || {}
      const translation = language === 'hu' ? PROJECT_TRANSLATIONS.hu[project.id] || {} : {}

      const fit = PROJECT_LOGO_FIT[project.imageKey] || {}

      return {
        ...project,
        logoRatio: fit.ratio,
        logoScale: fit.scale,
        summary: translation.summary || project.summary,
        description: translation.description || project.description,
        imageLight: imageSet.light,
        imageDark: imageSet.dark
      }
    })
    .sort((a, b) =>
      (a.title || '').toLowerCase().localeCompare((b.title || '').toLowerCase(), language)
    )
}
