import { createClient, User } from '@supabase/supabase-js';
import { InteriorProject } from '../types/project';
import { INITIAL_PROJECTS } from '../data/initialProjects';
import { saveProjects as saveLocalProjects } from '../utils/storage';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://keapzhxfyqevswsjiwr.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_keapzhxfyqevswsjiwr';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper to convert DB snake_case row to TS camelCase InteriorProject
export function mapDbRowToProject(row: any): InteriorProject {
  return {
    id: row.id,
    name: row.name || '',
    clientCompany: row.client_company || '',
    startDate: row.start_date || '',
    endDate: row.end_date || '',
    status: row.status || '준비중',
    color: row.color || '#3b82f6',
    constructionTeam: row.construction_team || '',
    teamCount: row.team_count || 1,
    teamMembers: row.team_members || '',
    address: row.address || '',
    addressDetail: row.address_detail || '',
    accessCode: row.access_code || '',
    buildingAccessCode: row.building_access_code || '',
    unitAccessCode: row.unit_access_code || '',
    scopeSummary: row.scope_summary || '',
    managerName: row.manager_name || '',
    managerPhone: row.manager_phone || '',
    siteMeasurementForm: row.site_measurement_form || undefined,
    measurementChecklist: row.measurement_checklist || [],
    roughDrawing: row.rough_drawing || { imageDataUrl: null, notes: '' },
    officialBlueprints: row.official_blueprints || [],
    orderChecklist: row.order_checklist || [],
    completionPhotos: row.completion_photos || [],
    estimates: row.estimates || { preliminaryQuote: [], finalQuote: [], marginRate: 15, includeVat: true, discountAmount: 0 },
    defectAndAS: row.defect_and_as || [],
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString()
  };
}

// Helper to convert TS camelCase InteriorProject to DB snake_case row
export function mapProjectToDbRow(project: InteriorProject): any {
  return {
    id: project.id,
    name: project.name,
    client_company: project.clientCompany,
    start_date: project.startDate,
    end_date: project.endDate,
    status: project.status,
    color: project.color,
    construction_team: project.constructionTeam,
    team_count: project.teamCount,
    team_members: project.teamMembers,
    address: project.address,
    address_detail: project.addressDetail,
    access_code: project.accessCode,
    building_access_code: project.buildingAccessCode || '',
    unit_access_code: project.unitAccessCode || '',
    scope_summary: project.scopeSummary,
    manager_name: project.managerName,
    manager_phone: project.managerPhone,
    site_measurement_form: project.siteMeasurementForm || null,
    measurement_checklist: project.measurementChecklist || [],
    rough_drawing: project.roughDrawing || null,
    official_blueprints: project.officialBlueprints || [],
    order_checklist: project.orderChecklist || [],
    completion_photos: project.completionPhotos || [],
    estimates: project.estimates || null,
    defect_and_as: project.defectAndAS || [],
    updated_at: new Date().toISOString()
  };
}

// Auth API
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });
  if (error) {
    console.error('Google login error:', error);
    throw error;
  }
  return data;
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Sign out error:', error);
  }
}

export async function getCurrentSessionUser(): Promise<User | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
}

// Database API
export async function fetchProjectsFromSupabase(): Promise<InteriorProject[]> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('start_date', { ascending: true });

    if (error) {
      console.warn('Supabase fetch error, falling back to local storage:', error.message);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('No projects in Supabase DB. Seeding initial projects...');
      // Seed default projects to Supabase
      await seedInitialProjectsToSupabase();
      return INITIAL_PROJECTS;
    }

    const projects = data.map(mapDbRowToProject);
    saveLocalProjects(projects); // keep local cache updated
    return projects;
  } catch (err) {
    console.error('Failed to fetch projects from Supabase:', err);
    return [];
  }
}

export async function seedInitialProjectsToSupabase(): Promise<void> {
  try {
    const rows = INITIAL_PROJECTS.map(mapProjectToDbRow);
    const { error } = await supabase.from('projects').upsert(rows, { onConflict: 'id' });
    if (error) {
      console.error('Failed to seed initial projects to Supabase:', error);
    } else {
      console.log('Successfully seeded initial projects to Supabase!');
    }
  } catch (err) {
    console.error('Seed exception:', err);
  }
}

export async function saveProjectToSupabase(project: InteriorProject): Promise<boolean> {
  try {
    const row = mapProjectToDbRow(project);
    const { error } = await supabase
      .from('projects')
      .upsert(row, { onConflict: 'id' });

    if (error) {
      console.error('Supabase project upsert error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to save project to Supabase:', err);
    return false;
  }
}

export async function deleteProjectFromSupabase(projectId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      console.error('Supabase project delete error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to delete project from Supabase:', err);
    return false;
  }
}

// Supabase Realtime Subscription Listener
export function subscribeToProjectsRealtime(onUpdateCallback: () => void) {
  const channel = supabase
    .channel('public:projects')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'projects'
      },
      (_payload) => {
        console.log('Supabase Realtime update received!');
        onUpdateCallback();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
