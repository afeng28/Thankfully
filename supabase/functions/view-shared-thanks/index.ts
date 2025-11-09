import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const shareId = url.searchParams.get("id");

    if (!shareId) {
      return new Response("Missing share ID", {
        status: 400,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseKey) {
      return new Response("Server configuration error", {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("shared_thanks")
      .select("*")
      .eq("share_id", shareId)
      .maybeSingle();

    if (error || !data) {
      return new Response("Thank you message not found", {
        status: 404,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta property="og:title" content="Thank you, ${data.recipient_name}!" />
  <meta property="og:image" content="${data.image_url}" />
  <meta property="og:description" content="Someone sent you a special thank you message!" />
  <title>Thank You, ${data.recipient_name}!</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(to bottom, #1a1d2e, #25283d, #2d3250);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      width: 100%;
      text-align: center;
    }
    .message {
      font-size: 32px;
      font-weight: 600;
      color: #e8d4e8;
      margin-bottom: 30px;
      line-height: 1.4;
    }
    .image-container {
      background: #3d4260;
      border-radius: 24px;
      padding: 20px;
      margin-bottom: 20px;
    }
    img {
      max-width: 100%;
      height: auto;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    }
    .custom-message {
      color: #d4a5d4;
      font-size: 18px;
      margin: 20px 0;
      line-height: 1.6;
      padding: 20px;
      background: #3d4260;
      border-radius: 16px;
    }
    .footer {
      color: #a8b5d4;
      font-size: 14px;
      margin-top: 30px;
    }
    @media (max-width: 640px) {
      .message {
        font-size: 24px;
      }
      .custom-message {
        font-size: 16px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="message">Thank you, ${data.recipient_name}!</div>
    <div class="image-container">
      <img src="${data.image_url}" alt="Thank you sticker" />
    </div>
    ${data.message ? `<div class="custom-message">${data.message}</div>` : ''}
    <div class="footer">
      Sent with gratitude
    </div>
  </div>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response("An error occurred", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
});