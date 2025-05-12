import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image, Animated, Dimensions, Alert, ActivityIndicator
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../config/firebase';
import { SafeAreaView } from 'react-native-safe-area-context';



const VerifyEmail = ({ navigation, route }) => {
  const { email, userId } = route.params; // Make sure userId is passed in route params
  const { saveUserData } = useContext(AuthContext);
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const floatAnim = useRef(new Animated.Value(0)).current;
  const checkInterval = useRef(null);

  // Save user data when the screen loads
  useEffect(() => {
    if (email && userId) {
      saveUserData(email, userId);
    }
  }, [email, userId]);

  // Animation for floating image
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => {
      if (checkInterval.current) {
        clearInterval(checkInterval.current);
      }
      floatAnim.stopAnimation(); // Stop animation on unmount
    };
  }, [floatAnim]);

  // Countdown timer
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Auto-check verification status
  useEffect(() => {
    // Initial check right away
    checkVerificationStatus();
    
    // Then set up interval for periodic checks
    checkInterval.current = setInterval(() => {
      checkVerificationStatus();
    }, 3000); // Check every 3 seconds (more frequent than before)

    return () => {
      if (checkInterval.current) {
        clearInterval(checkInterval.current);
      }
    };
  }, []);

  const checkVerificationStatus = async () => {
    try {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        clearInterval(checkInterval.current);
        navigation.replace('Verified'); // Replace with your target screen
      }
    } catch (error) {
      console.error("Verification check error:", error);
      // Don't show alert to user - automatic checks shouldn't disrupt UX
    }
  };

  const handleResendEmail = async () => {
    if (countdown > 0 || isResending) return;
    
    setIsResending(true);
    try {
      await sendEmailVerification(auth.currentUser);
      setCountdown(60);
      Alert.alert("Success", "Verification email resent successfully!");
    } catch (error) {
      console.error("Resend error:", error);
      Alert.alert("Error", "Failed to resend verification email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  // Responsive font sizes
  const { width } = Dimensions.get('window');
  const responsiveTitle = width < 400 ? 24 : 29;
  const responsiveCaption = width < 400 ? 11 : 12;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={[styles.title, { fontSize: responsiveTitle }]}>
        Verify Email Address
      </Text>
      <Text style={styles.subtitle}>
        You will need to verify your email to complete registration
      </Text>

      <Animated.Image
        source={require('../assets/verifyEmail.png')}
        resizeMode="contain"
        style={[styles.image, { transform: [{ translateY: floatAnim }]}]}
      />

      <Text style={[styles.captions, { fontSize: responsiveCaption }]}>
        An email has been sent to <Text style={{ fontWeight: 'bold', color: '#97C854' }}>
        {email || 'qabcd@tip.edu.ph'}</Text> with a link to verify your account. 
        If you haven't received the email after a few minutes, please check your spam folder.
      </Text>

      <View style={styles.bottomButs}>
        <TouchableOpacity 
          style={[
            styles.resendButton, 
            (countdown > 0 || isResending) && styles.buttonDisabled
          ]} 
          onPress={handleResendEmail}
          disabled={countdown > 0 || isResending}
        >
          {isResending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Email'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.changeEmail} 
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.buttonTextEmail}>Change Email</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

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
    marginBottom: -10,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    marginBottom: 20,
    color: 'grey',
    fontSize: 12.5,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: Dimensions.get('window').height * 0.5,
    marginVertical: 20,
  },
  captions: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    textAlign: 'center',
    color: 'grey',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  bottomButs: {
    flex: 1,
    marginBottom: 20,
    gap: 10,
    justifyContent: 'flex-end',
  },
  resendButton: {
    backgroundColor: '#A4DC4C',
    paddingVertical: 14,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
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
    borderColor: '#A4DC4C',
  },
  buttonTextEmail: {
    color: '#A4DC4C',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default VerifyEmail;