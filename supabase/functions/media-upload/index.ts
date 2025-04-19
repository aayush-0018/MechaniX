// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: any) => {
  // ✅ Handle preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      },
    });
  }

  console.log("➡️ Function called");

  try {
    const supabase = createClient(
      // @ts-ignore
      Deno.env.get("SUPABASE_URL")!,
      // @ts-ignore
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    console.log("✅ Supabase client initialized");

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    console.log(`📦 Received ${files.length} files`);

    const uploadedUrls: string[] = [];

    for (const file of files) {
      console.log(`🔄 Uploading file: ${file.name}`);

      const fileExt = file.name.split(".").pop();
      const filePath = `media/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error } = await supabase.storage
        .from("media")
        .upload(filePath, file, {
          contentType: file.type,
        });

      if (error) {
        console.error("❌ Upload error:", error.message);
        return new Response(JSON.stringify({ error: "Failed to upload file" }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      const { data } = supabase.storage.from("media").getPublicUrl(filePath);
      uploadedUrls.push(data.publicUrl);
      console.log(`✅ Uploaded: ${data.publicUrl}`);
    }

    console.log("✅ All files uploaded successfully");

    return new Response(JSON.stringify({ urls: uploadedUrls }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("🔥 Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
