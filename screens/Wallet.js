import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';


export default function Wallet() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headContainer}>
        <View style={styles.headerTopRow}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <View style={styles.headerIcons}>
            <Ionicons name="chatbox-ellipses" size={24} color="#fff" />
            <Ionicons name="notifications" size={24} color="#fff" />
          </View>
        </View>
        <View style={styles.balanceContainer}>

        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container:{
    flex: 1,
    backgroundColor: 'red',
  },
  headContainer:{
    padding: 15,
    height: 150,
    backgroundColor: 'blue',
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
  },
  headerTopRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  headerIcons: { 
    flexDirection: 'row', 
    width: 60, 
    justifyContent: 'space-between' 
  },
  balanceContainer:{
    backgroundColor: 'green',
    height: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
  }
})