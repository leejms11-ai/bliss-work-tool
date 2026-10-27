import { InteriorProject, createDefaultSiteMeasurementForm } from '../types/project';
import { createDefaultDetailedFinalQuote } from './quoteCalculator';
import { INITIAL_PROJECTS } from '../data/initialProjects';

const STORAGE_KEY = 'interior_field_mate_projects_v4';

export function loadProjects(): InteriorProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveProjects(INITIAL_PROJECTS);
      return INITIAL_PROJECTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((p: any, idx: number) => {
        const fallbackProject = INITIAL_PROJECTS[idx] || INITIAL_PROJECTS[0];
        const sheets = p.roughDrawing?.sheets && p.roughDrawing.sheets.length > 0
          ? p.roughDrawing.sheets
          : fallbackProject?.roughDrawing?.sheets || [];

        const orderChecklist = p.orderChecklist && p.orderChecklist.length > 0 && p.orderChecklist.some((o: any) => o.category === '후드' || o.modelName)
          ? p.orderChecklist
          : fallbackProject?.orderChecklist || [];

        const completionPhotos = p.completionPhotos && p.completionPhotos.length > 0
          ? p.completionPhotos.map((photo: any) => ({
              ...photo,
              phase: photo.phase === '시공전' || photo.phase === '시공 전' ? '시공 전' : '시공 후'
            }))
          : fallbackProject?.completionPhotos || [];

        return {
          ...p,
          siteMeasurementForm: p.siteMeasurementForm || createDefaultSiteMeasurementForm(),
          roughDrawing: {
            ...p.roughDrawing,
            sheets
          },
          orderChecklist,
          completionPhotos,
          estimates: {
            ...p.estimates,
            detailedFinalQuote: p.estimates?.detailedFinalQuote || createDefaultDetailedFinalQuote()
          }
        };
      });
    }
    return INITIAL_PROJECTS;
  } catch (err) {
    console.error('Failed to load projects from localStorage:', err);
    return INITIAL_PROJECTS;
  }
}

export function saveProjects(projects: InteriorProject[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to save projects to localStorage:', err);
  }
}

export function resetProjects(): InteriorProject[] {
  saveProjects(INITIAL_PROJECTS);
  return INITIAL_PROJECTS;
}
