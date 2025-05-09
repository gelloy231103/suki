import { Pressable, StyleSheet, Text, View } from 'react-native'
import {SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import React from 'react'

export default function Verified({navigation}) {
  return (
    <SafeAreaView style={styles.container}> 
      <Pressable style={styles.container} onPress={ () => navigation.navigate('OnBoarding')}>
        <LottieView
          source={require('../assets/lottie/checkAnimation.json')} // your downloaded .json file
          autoPlay
          loop={true}
          style={{ width: 250, height: 250 }}
        />
        <Text style={styles.title}>
        Email Verification was successful!
        </Text>
        <Text style={styles.subtitle}>
          Press Anywhere to continue
        </Text>
      </Pressable>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title:{
    fontFamily:'Poppins-Bold',
    fontSize: 30,
    textAlign: 'center',
    color: '#9DCD5A',
    marginTop: 110,
  },
  subtitle:{
    color: 'grey',
    fontFamily:"Poppins-Regular",
    position: 'absolute',
    bottom: 20,
    fontSize: 13,
  }
})