import projectsData from '../data/projects.json'
import { PROJECT_IMAGES, PROJECT_TRANSLATIONS } from '../content/index.js'

export function getLocalizedProjects(language) {
  return projectsData.projects
    .map((project) => {
      const imageSet = (project.imageKey && PROJECT_IMAGES[project.imageKey]) || {}
      const translation = language === 'hu' ? PROJECT_TRANSLATIONS.hu[project.id] || {} : {}

      return {
        ...project,
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
