import { supabase } from '../supabaseClient';

export interface LessonSummary {
	id: number;
	slug: string;
	title: string;
	description: string | null;
	duration_minutes: number | null;
}

// Fetch a lightweight summary of every lesson (used by the lessons overview grid)
export const fetchLessons = async (): Promise<LessonSummary[] | null> => {
	const { data, error } = await supabase
		.from('lessons')
		.select('id, slug, title, description, duration_minutes')
		.order('id', { ascending: true });
	if (error) {
		console.error('Error fetching lessons', error);
		return null;
	}
	return data;
};
