import React, { useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, PanResponder, Animated } from 'react-native';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Find Local Farms Nearby',
    description: 'Discover nearby farms and buy fresh produce directly from the source—fast, easy, and local.',
    image: require('../assets/Slide1.png'), 
  },
  {
    id: '2',
    title: 'Connect with Farmers Directly',
    description: 'Chat, order, and build relationships with real farmers—no middlemen, just real food.',
    image: require('../assets/Slide2.png'), 
  },
  {
    id: '3',
    title: 'Get Fresh Produce Delivered',
    description: 'Enjoy fresh, affordable farm goods delivered to your doorstep or ready for pickup.',
    image: require('../assets/Slide3.png'), 
  },
];

const OnBoarding = ({ navigation }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const pan = useRef(new Animated.ValueXY()).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x }],
        { useNativeDriver: false } // Keep this false for pan responder
      ),
      onPanResponderRelease: (e, gesture) => {
        if (gesture.dx > 50) {
          goToSlide(Math.max(currentSlide - 1, 0));
        } else if (gesture.dx < -50) {
          handleNext();
        }
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true // Can be true here as it's a simple spring
        }).start();
      }
    })
  ).current;

  const handleNext = () => {
    // Fade out animation with native driver
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      if (currentSlide < slides.length - 1) {
        setCurrentSlide(currentSlide + 1);
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTab' }],
        });
        return; // Skip the fade-in if we're navigating away
      }
      // Fade in animation with native driver
      fadeAnim.setValue(0); // Reset before animating
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
    });
  };

  const goToSlide = (index) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      setCurrentSlide(index);
      fadeAnim.setValue(0); // Reset before animating
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
    });
  };


  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <View style={styles.background} />
      
      {/* Animated Content */}
      <Animated.View 
        style={[
          styles.slideContainer,
          { 
            transform: [{ translateX: pan.x }], // Non-native driver
            opacity: fadeAnim // Native driver
          }
        ]}
        {...panResponder.panHandlers}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <Image 
            source={slides[currentSlide].image} 
            style={styles.slideImage} 
            resizeMode="contain"
          />
        </Animated.View>
        <View style={styles.textContainer}>
          <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
            {slides[currentSlide].title}
          </Animated.Text>
          <Animated.Text style={[styles.description, { opacity: fadeAnim }]}>
            {slides[currentSlide].description}
          </Animated.Text>
        </View>
      </Animated.View>

      {/* Navigation Dots - No animations */}
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dot,
              currentSlide === index && styles.activeDot,
            ]}
            onPress={() => goToSlide(index)}
          />
        ))}
      </View>

      {/* Button - No animations */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleNext}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>
          {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: height * 0.08,
    paddingTop: height * 0.05,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
    backgroundColor: '#F8F8F8',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 30,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  slideImage: {
    width: width * 0.8,
    height: width * 0.8,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D3436',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Poppins-SemiBold',
    lineHeight: 34,
  },
  description: {
    fontSize: 16,
    color: '#636E72',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
    fontFamily: 'Poppins-Regular',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DFE6E9',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#55A630',
    width: 20,
  },
  button: {
    backgroundColor: '#55A630',
    paddingVertical: 16,
    paddingHorizontal: width * 0.3,
    borderRadius: 12,
    shadowColor: '#55A630',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: 0.5,
  },
});

export default OnBoarding;