import { supabase } from '../supabaseClient';

// Use Supabase client to fetch data from countries table
export const fetchLessonTitle = async (lessonSlug: string) => {
	// Use maybeSingle (not single): a prev/next lesson slug that doesn't exist
	// (e.g. the first lesson has no previous lesson) is an expected state, not an error.
	const { data, error } = await supabase
		.from('lessons')
		.select('title')
		.eq('slug', lessonSlug)
		.maybeSingle();
	if (error) {
		console.error('Error fetching data', error);
	}
	return data;
};
