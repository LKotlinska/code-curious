import { supabase } from "../supabaseClient";

// Use Supabase client to fetch solution data from lesson table
export const fetchSolution = async (lessonSlug: string) => {
    const { data, error } = await supabase
        .from('lessons')
        .select('solution')
        .eq('slug', lessonSlug)
        .single();
    if (error) {
        console.error('Error fetching data', error);
    }
    return data;
}