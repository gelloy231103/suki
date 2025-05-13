import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  BackHandler,
  Animated,
  PanResponder
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const BarnIntro = () => {
  const navigation = useNavigation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const pan = useRef(new Animated.ValueXY()).current;

  const slides = [
    {
      id: '1',
      title: 'Your Digital Barn',
      description: 'Manage all farm operations in one modern interface',
      image: require('../assets/images/barnIntro1.png')
    },
    {
      id: '2',
      title: 'Real-Time Insights',
      description: 'Instant updates and alerts for your farm activities',
      image: require('../assets/images/barnIntro2.png')
    },
    {
      id: '3',
      title: 'Smart Management',
      description: 'Organize tasks and track progress effortlessly',
      image: require('../assets/images/barnIntro3.png')
    }
  ];

  // Disable hardware back button
  useEffect(() => {
    const backAction = () => true;
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );
    return () => backHandler.remove();
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (e, gesture) => {
        if (gesture.dx > 50) {
          // Swipe right - go to previous slide
          goToSlide(Math.max(currentSlide - 1, 0));
        } else if (gesture.dx < -50) {
          // Swipe left - go to next slide
          handleNext();
        }
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false
        }).start();
      }
    })
  ).current;

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigation.navigate('EditFarmProfile');
    }
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const handleSkip = () => {
    navigation.navigate('EditFarmProfile');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Skip Button */}
      {currentSlide < slides.length - 1 && (
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={handleSkip}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Swipeable Slide Content */}
      <Animated.View 
        style={[
          styles.slideContainer,
          { transform: [{ translateX: pan.x }] }
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.imageContainer}>
          <Image 
            source={slides[currentSlide].image} 
            style={styles.image} 
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>{slides[currentSlide].title}</Text>
          <Text style={styles.description}>{slides[currentSlide].description}</Text>
        </View>
      </Animated.View>

      {/* Navigation Dots */}
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

      {/* Continue/Create Button */}
      <TouchableOpacity 
        style={styles.button}
        onPress={handleNext}
      >
        <Text style={styles.buttonText}>
          {currentSlide === slides.length - 1 ? 'Create Barn Profile' : 'Continue'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 40
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20
  },
  imageContainer: {
    width: width * 0.85,
    height: height * 0.45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30
  },
  image: {
    width: '100%',
    height: '100%'
  },
  textContainer: {
    paddingHorizontal: 40,
    alignItems: 'center',
    marginTop: 20
  },
  title: {
    fontSize: 26,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 34
  },
  description: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20
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
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4
  },
  activeDot: {
    backgroundColor: '#8CC63F',
    width: 20
  },
  button: {
    backgroundColor: '#8CC63F',
    marginHorizontal: 30,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    shadowColor: '#8CC63F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    width: width * 0.85
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    letterSpacing: 0.5
  },
  skipButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
    padding: 12
  },
  skipText: {
    color: '#8CC63F',
    fontFamily: 'Poppins-Medium',
    fontSize: 16
  }
});

export default BarnIntro;