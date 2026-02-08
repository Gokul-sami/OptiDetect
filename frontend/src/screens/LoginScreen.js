import { View, Text, Button } from "react-native";

export default function Login({ navigation }) {
  return (
    <View style={{flex:1,justifyContent:"center",alignItems:"center"}}>
      <Text style={{fontSize:24}}>OptiDetect</Text>
      <Button title="Login" onPress={()=>navigation.replace("Home")} />
    </View>
  );
}