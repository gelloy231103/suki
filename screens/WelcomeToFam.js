import React, { useRef, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Animated,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Easing,
} from 'react-native';


const { width, height } = Dimensions.get('window');

export default function WelcomeToFamilyScreen({ navigation }) {
  const handleSetup = () => {
    navigation.navigate('ProfileDashboard');
  };

  // Bouncy floating animation for image
  const imageAnim = useRef(new Animated.Value(0)).current;
  const circleLargeAnim = useRef(new Animated.Value(0)).current;
  const circleMediumAnim = useRef(new Animated.Value(0)).current;
  const circleSmallAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(imageAnim, {
          toValue: -30,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(imageAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(circleLargeAnim, {
          toValue: 15,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(circleLargeAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(circleMediumAnim, {
          toValue: -12,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(circleMediumAnim, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(circleSmallAnim, {
          toValue: 8,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(circleSmallAnim, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Decorative Circles */}
      <Animated.View style={[styles.circle, styles.circleLarge, { transform: [{ translateY: circleLargeAnim }] }]} />
      <Animated.View style={[styles.circle, styles.circleMedium, { transform: [{ translateY: circleMediumAnim }] }]} />
      <Animated.View style={[styles.circle, styles.circleSmall, { transform: [{ translateY: circleSmallAnim }] }]} />

      {/* Main Content */}
      <View style={styles.content}>
        <Animated.Image
          source={require('../assets/images/farmer_woman.png')}
          style={[styles.image, { transform: [{ translateY: imageAnim }, { scale: imageAnim.interpolate({ inputRange: [-60, 0], outputRange: [1.05, 1] }) }] }]}
          resizeMode="contain"
        />
        <Text style={styles.title}>Welcome to the Family!</Text>
        <Text style={styles.subtitle}>
        We're thrilled to have you join our community. Suki is your direct link to fresh, locally produced agricultural products, cutting out the middlemen for better prices and a more sustainable approach to farming. 
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleSetup}>
          <Text style={styles.buttonText}>Set Up My Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const CIRCLE_COLOR_GREEN = '#8CC63F';
const CIRCLE_COLOR_BEIGE = '#F4E3C3';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: CIRCLE_COLOR_GREEN,
  },
  circleLarge: {
    width: 200,
    height: 200,
    top: -50,
    right: -50,
    opacity: 0.3,
  },
  circleMedium: {
    width: 120,
    height: 120,
    top: 200,
    left: -30,
    backgroundColor: CIRCLE_COLOR_BEIGE,
    opacity: 0.4,
  },
  circleSmall: {
    width: 40,
    height: 40,
    top: 200,
    right: 50,
    opacity: 0.6,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: width * 0.75,
    height: height * 0.5,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    color: CIRCLE_COLOR_GREEN,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Poppins-Bold',
  },
  subtitle: {
    fontSize: 12,
    color: '#444444',
    textAlign: 'center',
    paddingHorizontal: 10,
    marginBottom: 30,
    lineHeight: 20,
    fontFamily: 'Poppins-Regular',
  },
  highlight: {
    color: CIRCLE_COLOR_GREEN,
    fontFamily: 'Poppins-Bold',
  },
  button: {
    backgroundColor: CIRCLE_COLOR_GREEN,
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    position: 'absolute',
    bottom: 30,
  },
  buttonText: {
    fontFamily: 'Poppins-Bold',
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
});
