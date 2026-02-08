import { Camera } from "expo-camera";
import { useRef, useState, useEffect } from "react";
import { View, Button, Alert } from "react-native";
import { uploadImage, saveTestResult } from "../services/supabase";

import { predictLeukocoria, predictSquint } from "../api/api";

export default function CameraScreen({ route, navigation }) {

  const { mode } = route.params;

  const cameraRef = useRef();
  const [perm, setPerm] = useState(false);

  useEffect(()=>{
    (async ()=>{
      const { status } = await Camera.requestCameraPermissionsAsync();
      setPerm(status==="granted");
    })();
  },[]);

  const capture = async () => {
    try {
      const photo = await cameraRef.current.takePictureAsync({
          quality:0.7,
          flashMode: Camera.Constants.FlashMode.torch
      });

      let result;

      if(mode==="leukocoria")
          result = await predictLeukocoria(photo.uri);
      else
          result = await predictSquint(photo.uri);

      // upload to supabase storage
      const imageUrl = await uploadImage(photo.uri);

      // Determine if result is positive (abnormal condition detected)
      const isAbnormal = result.prediction === "LEUKOCORIA" || result.prediction === "SQUINT";

      // save to DB
      await saveTestResult({
          type: mode,
          result: isAbnormal,
          probability: result.probability || 0,
          image_url: imageUrl
      });

      navigation.navigate("Result",{ result, uri:photo.uri });
    } catch (error) {
      console.error("Capture error:", error);
      Alert.alert("Error", error.message || "Failed to process image");
    }
  };

  if(!perm) return null;

  return (
    <View style={{flex:1}}>
      <Camera
        ref={cameraRef}
        style={{flex:1}}
        flashMode={Camera.Constants.FlashMode.torch}
      />

      <Button title="Capture" onPress={capture}/>
    </View>
  );
}
