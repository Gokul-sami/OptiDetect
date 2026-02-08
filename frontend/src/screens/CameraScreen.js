import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import { View, Button, Alert, Platform } from "react-native";
import { useIsFocused } from "@react-navigation/native";

export default function CameraScreen({ route, navigation }) {

  const { mode } = route.params;

  const isFocused = useIsFocused();

  const cameraRef = useRef();
  const [permission, requestPermission] = useCameraPermissions();
  const [capturing, setCapturing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const capture = async () => {
    try {
      if (capturing) return;

      if (!cameraReady) {
        Alert.alert("Please wait", "Camera is still starting up.");
        return;
      }

      if (!permission?.granted) {
        const res = await requestPermission();
        if (!res.granted) {
          Alert.alert("Permission required", "Camera permission is required to continue.");
          return;
        }
      }

      if (!cameraRef.current?.takePictureAsync) {
        throw new Error("Camera not ready");
      }

      setCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
          quality:0.7,
          skipProcessing: Platform.OS === "android",
          // flash is controlled on the view; keep capture options minimal
      });

      // Navigate immediately; Result screen will call API and show loading.
      navigation.navigate("Result", { uri: photo.uri, mode });
    } catch (error) {
      console.error("Capture error:", error);
      Alert.alert("Error", error?.message || String(error) || "Failed to process image");
    } finally {
      setCapturing(false);
    }
  };

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <View style={{ flex: 1, justifyContent: "center", backgroundColor: "Blue", padding: 24 }}>
        <Button title="Grant Camera Permission" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={{flex:1}}>
      <CameraView
        ref={cameraRef}
        style={{flex:1}}
        enableTorch={isFocused && mode === "leukocoria"}
        flash="off"
        onCameraReady={() => setCameraReady(true)}
      />

      <View style={{ position: "absolute", left: 20, right: 20, bottom: 30 }}>
        <Button title="Capture" onPress={capture} disabled={capturing || !cameraReady} />
      </View>
    </View>
  );
}
