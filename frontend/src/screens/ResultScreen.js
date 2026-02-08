import { View, Text, Image, Button } from "react-native";

export default function Result({ route, navigation }) {

  const { result, uri } = route.params;

  return (
    <View style={{flex:1,alignItems:"center",padding:20}}>
      <Image source={{uri}} style={{width:250,height:250}}/>

      <Text style={{fontSize:22}}>
        {JSON.stringify(result,null,2)}
      </Text>

      <Button title="Back" onPress={()=>navigation.popToTop()} />
    </View>
  );
}
