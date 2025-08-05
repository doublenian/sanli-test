import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request parameters
    const url = new URL(req.url);
    const userId = url.searchParams.get('p_user_id');
    const includeMastered = url.searchParams.get('p_include_mastered') === 'true';

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing p_user_id parameter' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Query wrong questions with question details
    let query = supabaseClient
      .from('user_wrong_questions')
      .select(`
        id,
        question_id,
        wrong_count,
        first_wrong_at,
        last_wrong_at,
        is_mastered,
        created_at,
        updated_at,
        questions (
          id,
          category_id,
          type,
          question_text,
          options,
          correct_answer,
          explanation,
          image_url,
          difficulty_level,
          question_categories (
            name,
            description,
            icon
          )
        )
      `)
      .eq('user_id', userId)
      .order('last_wrong_at', { ascending: false });

    if (!includeMastered) {
      query = query.eq('is_mastered', false);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify(data || []),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in get-user-wrong-questions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});