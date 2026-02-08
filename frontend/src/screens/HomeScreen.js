import { View, Button } from "react-native";

export default function Home({ navigation }) {

  return (
    <View style={{flex:1,justifyContent:"center",gap:20,padding:40}}>
      <Button
        title="Test Leukocoria"
        onPress={()=>navigation.navigate("Camera",{mode:"leukocoria"})}
      />

      <Button
        title="Test Squint"
        onPress={()=>navigation.navigate("Camera",{mode:"squint"})}
      />
    </View>
  )
}