import { useEffect, useState } from "react";
import { View, Text, Image, Button, ActivityIndicator } from "react-native";

import { predictLeukocoria, predictSquint } from "../api/api";
import { uploadImage, saveTestResult } from "../services/supabase";

export default function Result({ route, navigation }) {

  const { uri, mode } = route.params;
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [errorText, setErrorText] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setErrorText(null);

        if (!uri || !mode) {
          throw new Error("Missing image or mode");
        }

        const prediction = mode === "leukocoria"
          ? await predictLeukocoria(uri)
          : await predictSquint(uri);

        if (cancelled) return;

        if (prediction?.error) {
          throw new Error(prediction.error);
        }

        setResult(prediction);
        setLoading(false);

        // Persist in background (do not block the UI)
        void (async () => {
          try {
            console.log("[bg-save] start", { mode });
            console.log("[bg-save] uploading image");
            const imageUrl = await uploadImage(uri);
            if (!imageUrl) {
              throw new Error("Background save: image upload returned empty URL");
            }
            console.log("[bg-save] uploaded image", { imageUrl });
            const isAbnormal = prediction.prediction === "LEUKOCORIA" || prediction.prediction === "SQUINT";
            console.log("[bg-save] inserting test row", { isAbnormal });
            await saveTestResult({
              type: mode,
              result: isAbnormal,
              probability: prediction.probability || 0,
              image_url: imageUrl,
            });
            console.log("[bg-save] done");
          } catch (e) {
            console.error(
              "Background save failed:",
              e?.name,
              e?.message,
              e
            );
          }
        })();
      } catch (e) {
        if (cancelled) return;
        setLoading(false);
        setErrorText(e?.message || String(e));
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [uri, mode]);

  return (
    <View style={{flex:1,alignItems:"center",padding:20}}>
      <Image source={{uri}} style={{width:250,height:250}}/>

      {loading ? (
        <View style={{ marginTop: 16, alignItems: "center" }}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 12, fontSize: 16 }}>Processing…</Text>
        </View>
      ) : errorText ? (
        <Text style={{ marginTop: 16, fontSize: 16, textAlign: "center" }}>
          {errorText}
        </Text>
      ) : (
        <Text style={{fontSize:22}}>
          {JSON.stringify(result,null,2)}
        </Text>
      )}

      <Button title="Back" onPress={()=>navigation.popToTop()} />
    </View>
  );
}
