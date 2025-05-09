import React, {useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    Animated,
  } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Animatable from 'react-native-animatable';


const VerifyEmail = ({navigation}) =>{

  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10, // move up by 20px
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0, // move back down
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [floatAnim]);

  return(
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Verify Email Address</Text>
      <Text style={styles.subtitle}>You will need to verify your email to complete registration</Text>
      <Animated.Image
        source={require('../assets/verifyEmail.png')}
        resizeMode="contain"
        style={[styles.image,  { transform: [{ translateY: floatAnim }]}]}
      />
      <Text style={styles.captions}>
      An email has been sent to qabcd@tip.edu.ph with a link to verify your account. If you have not received the email after a few minutes, please check your spam folder
      </Text>
      <View style={styles.bottomButs}>
        <TouchableOpacity style={styles.resendButton} onPress={() => navigation.navigate('Verified')}>
            <Text style={styles.buttonText}>Resend Email</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.changeEmail} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.buttonTextEmail}>Change Email</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
};

export default VerifyEmail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 29,
    color: '#97C854',
    fontFamily: 'Poppins-Black',
    marginBottom: -10
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    marginBottom: 10,
    color: 'grey',
    fontSize: 12.5,
    marginBottom: 20,
  },
  image: {
    width: '100%',
  },
  captions: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    textAlign: 'center',
    color: 'grey',
    marginVertical:10,
  },
  bottomButs: {
    display: 'flex',
    flex: 1,
    marginBottom: 20,
    gap: 10,
    justifyContent: 'flex-end'
  },
  resendButton: {
    backgroundColor: '#A4DC4C',
    paddingVertical: 14,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  changeEmail: {
    backgroundColor: 'white',
    paddingVertical: 14,
    borderRadius: 5,
    alignItems: 'center',
    borderWidth: 0.8,
    borderColor: '#A4DC4C'
  },
  buttonTextEmail: {
    color: '#A4DC4C',
    fontWeight: 'bold',
    fontSize: 14,
  },
});