import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = process.env.EXPO_PUBLIC_SUPABASE_ANON;

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON
);

export default supabase;

export const uploadImage = async (uri) => {

  const blob = await fetch(uri).then(r => r.blob());

  const filename = Date.now() + ".jpg";

  const { error } = await supabase.storage
    .from("images")
    .upload(filename, blob);

  if (error) throw error;

  const { data } = supabase.storage
    .from("images")
    .getPublicUrl(filename);

  return data.publicUrl;
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
    console.error("Supabase insert error:", error);
    throw error;
  }

  return data;
};
