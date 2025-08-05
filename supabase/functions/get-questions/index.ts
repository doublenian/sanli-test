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

    if (req.method === 'GET') {
      // Get all questions
      const { data, error } = await supabaseClient
        .from('questions')
        .select(`
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
            name
          )
        `)
        .eq('is_active', true)
        .order('created_at');

      if (error) throw error;

      return new Response(
        JSON.stringify(data || []),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (req.method === 'POST') {
      const requestBody = await req.json();
      const { type, count = 20, category, startIndex = 0 } = requestBody;

      let query = supabaseClient
        .from('questions')
        .select(`
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
            name
          )
        `)
        .eq('is_active', true);

      if (category) {
        // Filter by category if specified
        const { data: categoryData } = await supabaseClient
          .from('question_categories')
          .select('id')
          .eq('name', category)
          .single();
        
        if (categoryData) {
          query = query.eq('category_id', categoryData.id);
        }
      }

      if (type === 'random') {
        // Random questions using PostgreSQL's TABLESAMPLE or ORDER BY random()
        query = query.order('created_at', { ascending: false }).limit(count);
        
        const { data, error } = await query;
        if (error) throw error;
        
        // Shuffle the results in JavaScript for better randomization
        const shuffled = (data || []).sort(() => 0.5 - Math.random());
        return new Response(
          JSON.stringify(shuffled.slice(0, count)),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      } else if (type === 'sequential') {
        // Sequential questions with pagination
        query = query
          .order('created_at')
          .range(startIndex, startIndex + count - 1);
      } else if (type === 'by_category') {
        // Questions by category
        query = query.order('created_at').limit(count);
      }

      const { data, error } = await query;
      if (error) throw error;

      return new Response(
        JSON.stringify(data || []),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in get-questions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});