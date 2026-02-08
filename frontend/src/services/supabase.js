import { createClient } from "@supabase/supabase-js";
import { File as ExpoFile } from "expo-file-system";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = process.env.EXPO_PUBLIC_SUPABASE_ANON;

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON
);

export default supabase;

export const uploadImage = async (uri) => {
  const filename = Date.now() + ".jpg";

  if (typeof SUPABASE_URL !== "string" || typeof SUPABASE_ANON !== "string" || !SUPABASE_URL || !SUPABASE_ANON) {
    throw new Error(
      "Missing Supabase env vars: EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON"
    );
  }

  const supabaseBase = SUPABASE_URL.replace(/\/$/, "");
  // Avoid `fetch(file://...).blob()` on Android (often throws: "Network request failed").
  // Read the local file using expo-file-system's new File API, then upload via supabase-js.
  console.log("[supabase] uploadImage via ExpoFile -> ArrayBuffer", { filename });

  const file = new ExpoFile(uri);
  const arrayBuffer = await file.arrayBuffer();

  const { error } = await supabase.storage
    .from("images")
    .upload(filename, arrayBuffer, { contentType: "image/jpeg", upsert: false });

  if (error) {
    const msg = String(error?.message || error);
    if (msg.toLowerCase().includes("row-level security")) {
      throw new Error(
        "Supabase Storage upload blocked by RLS policy. Add an INSERT policy for bucket 'images' in the Supabase dashboard (Storage -> Policies / SQL editor)."
      );
    }
    throw error;
  }

  // If the bucket is public, this is the public URL format.
  // (This avoids any unexpected undefined access and works without a network call.)
  return `${supabaseBase}/storage/v1/object/public/images/${encodeURIComponent(filename)}`;
};

export const saveTestResult = async ({
  type,
  result,
  probability,
  image_url
}) => {

  const { data, error } = await supabase.from("tests").insert([
    { type, result, probability, image_url }
  ]);

  if (error) {
    const msg = String(error?.message || error);
    if (msg.toLowerCase().includes("row-level security")) {
      console.error("Supabase RLS blocked insert into 'tests' table:", error);
      throw new Error(
        "Supabase DB insert blocked by RLS policy on table 'tests'. Add an INSERT policy for role anon/authenticated (or disable RLS) in the Supabase dashboard."
      );
    }
    console.error("Supabase insert error:", error);
    throw error;
  }

  return data;
};
