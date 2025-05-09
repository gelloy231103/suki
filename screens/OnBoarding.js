// screens/Onboarding.js (corrected)
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Swiper from 'react-native-swiper';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const slides = [
  { 
    key: '1', 
    title: 'Find Local Farms Nearby', 
    description: 'Discover nearby farms and buy fresh produce directly from the source—fast, easy, and local.', 
    image: require('../assets/images/OB1.png') 
  },
  { 
    key: '2', 
    title: 'Connect with farmers directly', 
    description: 'Chat, order, and build relationships with real farmers—no middlemen, just real food.', 
    image: require('../assets/images/OB2.png') 
  },
  { 
    key: '3', 
    title: 'Get Fresh Produce Delivered', 
    description: 'Enjoy fresh, affordable farm goods delivered to your doorstep or ready for pickup.', 
    image: require('../assets/images/OB3.png') 
  },
];

const OnboardingScreen = () => {
  const navigation = useNavigation();
  const swiperRef = useRef(null);

  const onFinish = () => {
    navigation.navigate('WelcomeToFam');
  };

  return (
    <View style={styles.container}>
      <Swiper
        ref={swiperRef}
        loop={false}
        showsPagination={true}
        dotStyle={styles.inactiveDot}
        activeDotStyle={styles.activeDot}
        paginationStyle={styles.paginationStyle}
      >
        {slides.map((slide, index) => (
          <View style={styles.slide} key={slide.key}>
            <Image 
              source={slide.image} 
              style={styles.image} 
              resizeMode="contain" 
            />
            <View style={styles.textContainer}>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.description}>{slide.description}</Text>
            </View>

            {index === slides.length - 1 ? (
              <TouchableOpacity 
                style={styles.finishButton} 
                onPress={onFinish}
                activeOpacity={0.7}
              >
                <Text style={styles.finishButtonText}>Get Started</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.skipButton}
                onPress={onFinish}
              >
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </Swiper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: height * 0.1,
    paddingBottom: height * 0.15,
    paddingHorizontal: 30,
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
    marginBottom: 30,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D2D2D',
    textAlign: 'center',
    marginBottom: 15,
    fontFamily: 'Poppins-Bold',
    lineHeight: 32,
  },
  description: {
    fontSize: 16,
    color: '#6B6B6B',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  finishButton: {
    backgroundColor: '#8CC63F',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  finishButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 25,
    padding: 10,
  },
  skipText: {
    color: '#8CC63F',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },
  inactiveDot: {
    backgroundColor: '#cdeaa9',
    width: 8,
    height: 8,
    borderRadius: 4,
    margin: 3,
  },
  activeDot: {
    backgroundColor: '#8CC63F',
    width: 25,
    height: 8,
    borderRadius: 4,
    margin: 3,
  },
  paginationStyle: {
    bottom: height * 0.12,
  },
});

export default OnboardingScreen;