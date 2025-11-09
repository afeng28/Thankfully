import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
  "Access-Control-Max-Age": "86400", // Cache preflight for 24 hours
};

interface Theme {
  label: string;
  count: number;
  avg_sentiment: number;
  score: number;
  sample_excerpts: string[];
  example_entry_ids: string[];
}

interface AnalysisResponse {
  total_entries: number;
  themes: Theme[];
  top_3: string[];
}

// PII Redaction patterns
function redactPII(text: string): string {
  let redacted = text;

  // Redact email addresses
  redacted = redacted.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, "[EMAIL]");

  // Redact phone numbers (various formats)
  redacted = redacted.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, "[PHONE]");
  redacted = redacted.replace(/\b\(\d{3}\)\s?\d{3}[-.]?\d{4}\b/g, "[PHONE]");
  redacted = redacted.replace(/\b\d{10}\b/g, "[PHONE]");

  // Redact capitalized names (common first/last name patterns)
  // This is a simple heuristic - matches capitalized words that might be names
  // We'll be conservative and only match common name patterns
  const namePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/g;
  // We'll let Gemini handle name detection more intelligently, but we can add basic redaction
  // For now, we'll rely on Gemini's instruction to replace names with [PERSON]

  return redacted;
}

// Cache key generation
function getCacheKey(userId: string): string {
  return `theme_analysis_${userId}`;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204, // No Content - standard for OPTIONS
      headers: {
        ...corsHeaders,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  try {
    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user_id from query params or default to 'default_user'
    const url = new URL(req.url);
    const userId = url.searchParams.get("user_id") || "default_user";

    // Check cache first (24 hour cache)
    const cacheKey = getCacheKey(userId);
    let cacheEntry = null;
    try {
      const { data, error } = await supabase
        .from("theme_analysis_cache")
        .select("*")
        .eq("cache_key", cacheKey)
        .maybeSingle();

      if (!error && data) {
        cacheEntry = data;
      }
    } catch (cacheError) {
      // Cache table might not exist yet, continue without cache
      console.log("Cache check failed (non-fatal):", cacheError);
    }

    if (cacheEntry?.data && cacheEntry.created_at) {
      const cacheAge = Date.now() - new Date(cacheEntry.created_at).getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000;

      if (cacheAge < twentyFourHours) {
        return new Response(
          JSON.stringify(cacheEntry.data),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }
    }

    // Fetch last 60 gratitude entries
    const { data: entries, error: entriesError } = await supabase
      .from("gratitude_entries")
      .select("id, entry_date, answers")
      .eq("user_id", userId)
      .order("entry_date", { ascending: false })
      .limit(60);

    if (entriesError) {
      console.error("Error fetching entries:", entriesError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch entries" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!entries || entries.length === 0) {
      return new Response(
        JSON.stringify({
          total_entries: 0,
          themes: [],
          top_3: [],
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Prepare entries for analysis with PII redaction
    const entriesForAnalysis = entries.map((entry) => {
      const answers = entry.answers as Array<{ question: string; answer: string }>;
      const entryText = answers
        .map((qa) => `${qa.question}: ${qa.answer}`)
        .join("\n");
      const redactedText = redactPII(entryText);
      return {
        id: entry.id,
        text: redactedText,
      };
    });

    // Build user message with entries
    const entriesText = entriesForAnalysis
      .map((entry, idx) => `Entry ${idx + 1} (ID: ${entry.id}):\n${entry.text}`)
      .join("\n\n---\n\n");

    const systemPrompt = `You are a precise text analyst. Output only valid JSON and nothing else. When given journal entries, extract concise recurring themes (2–4 words, Title Case), compute per-entry sentiment valence (-1.0 .. 1.0), group entries into themes, and return per-theme aggregates. Replace any detected person names or PII with "[PERSON]" placeholders. Even with just a few entries, try to identify at least 1-3 meaningful themes. Only return {"themes": []} if absolutely no patterns can be found.`;

    const userMessage = `Analyze these gratitude journal entries and extract themes. Be generous in identifying themes - even if entries share similar topics or emotions, group them into meaningful themes.

${entriesText}

Instructions:
1. Extract themes (2-4 words, Title Case) - look for common topics, activities, people, emotions, or experiences across entries
2. For each entry, compute sentiment valence (-1.0 to 1.0, where 1.0 is most positive)
3. Group entries by theme - a theme can have as few as 1 entry if it's meaningful
4. For each theme, calculate:
   - count: number of entries in this theme
   - avg_sentiment: average sentiment of entries in this theme
   - score: weighted score = (count / total_entries) * 0.6 + (avg_sentiment + 1) / 2 * 0.4
   - sample_excerpts: 2-3 short excerpts (max 50 chars each) from entries in this theme, with [PERSON] placeholders
   - example_entry_ids: array of entry IDs (as strings) that belong to this theme

5. Return top themes sorted by score (descending) - include at least 1-3 themes if possible
6. Return top_3 array with the top 3 theme labels (or fewer if less than 3 themes exist)

Output format (JSON only):
{
  "total_entries": <number>,
  "themes": [
    {
      "label": "<Theme Name>",
      "count": <number>,
      "avg_sentiment": <number between -1.0 and 1.0>,
      "score": <number between 0 and 1>,
      "sample_excerpts": ["<excerpt 1>", "<excerpt 2>"],
      "example_entry_ids": ["<id1>", "<id2>"]
    }
  ],
  "top_3": ["<Theme 1>", "<Theme 2>", "<Theme 3>"]
}

Example output:
{
  "total_entries": 45,
  "themes": [
    {
      "label": "Family Time",
      "count": 12,
      "avg_sentiment": 0.85,
      "score": 0.763,
      "sample_excerpts": ["Dinner with [PERSON] was lovely", "Spent quality time with family"],
      "example_entry_ids": ["e1", "e3"]
    }
  ],
  "top_3": ["Family Time", "Work Wins", "Nature Walks"]
}`;

    const fullPrompt = `System: ${systemPrompt}\n\nUser: ${userMessage}`;

    // Get Gemini API key
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")?.trim();

    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY environment variable is not set");
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY is not configured" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Call Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: fullPrompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 800,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", errorText);
      return new Response(
        JSON.stringify({
          error: "Failed to call Gemini API",
          details: errorText,
        }),
        {
          status: geminiResponse.status,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const geminiData = await geminiResponse.json();
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      return new Response(
        JSON.stringify({ error: "No response from Gemini API" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Parse JSON response (remove markdown code blocks if present)
    let cleanedResponse = responseText.trim();
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    } else if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse.replace(/^```\n?/, "").replace(/\n?```$/, "");
    }

    let analysisResult: AnalysisResponse;
    try {
      analysisResult = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", cleanedResponse);
      return new Response(
        JSON.stringify({
          error: "Failed to parse analysis result",
          raw_response: responseText.substring(0, 200),
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Ensure total_entries is set correctly
    analysisResult.total_entries = entries.length;
    
    // Ensure top_3 is populated if themes exist
    if (analysisResult.themes && analysisResult.themes.length > 0 && (!analysisResult.top_3 || analysisResult.top_3.length === 0)) {
      analysisResult.top_3 = analysisResult.themes.slice(0, 3).map(t => t.label);
    }
    
    // Log the result for debugging
    console.log('Analysis result:', JSON.stringify(analysisResult, null, 2));

    // Cache the result
    try {
      // Delete old cache entry if exists
      await supabase
        .from("theme_analysis_cache")
        .delete()
        .eq("cache_key", cacheKey);

      // Insert new cache entry
      await supabase.from("theme_analysis_cache").insert({
        cache_key: cacheKey,
        data: analysisResult,
        created_at: new Date().toISOString(),
      });
    } catch (cacheError) {
      console.error("Cache error (non-fatal):", cacheError);
      // Continue even if caching fails
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

