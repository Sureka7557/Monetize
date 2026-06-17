import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const Subscriptions = () => {
  const COLORS = {
  background: "#F2DEC7",     
  card: "#FFFFFF",          
  cardBorder: "#E1B8A2",    
  accent: "#CF7D65",         
  accentGreen: "#6B6D43",   
  muted: "#ABA66F",         
  textDark: "#4A3728",      
  white: "#FFFFFF",
  softBlue: "#99B4AA",      
};
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background,padding:10 }}>
      <View>
      <Text>subscriptions</Text>
    </View>
    </SafeAreaView>
  )
}

export default Subscriptions