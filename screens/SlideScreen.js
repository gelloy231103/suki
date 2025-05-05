import React, { useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, PanResponder, Animated } from 'react-native';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Find Local Farms Nearby',
    description: 'Discover nearby farms and buy fresh produce directly from the source—fast, easy, and local.',
    image: require('../assets/Slide1.png'), 
  },
  {
    id: '2',
    title: 'Connect with farmers directly',
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

const SlideScreen = ({ navigation }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const pan = useRef(new Animated.ValueXY()).current;
  
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
        navigation.navigate('ListProducts');
      }
    };
  
    const goToSlide = (index) => {
      setCurrentSlide(index);
    };
  
    return (
      <View style={styles.container}>
        {/* Swipeable Slide Content */}
        <Animated.View 
          style={[
            styles.slideContainer,
            { transform: [{ translateX: pan.x }] }
          ]}
          {...panResponder.panHandlers}
        >
          <Image 
            source={slides[currentSlide].image} 
            style={styles.slideImage} 
            resizeMode="contain"
          />
          <Text style={styles.title}>{slides[currentSlide].title}</Text>
          <Text style={styles.description}>{slides[currentSlide].description}</Text>
        </Animated.View>
  
        {/* Next/Proceed Button */}
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentSlide === slides.length - 1 ? 'Proceed' : 'Next'}
          </Text>
        </TouchableOpacity>
  
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
      </View>
    );
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  slideImage: {
    width: width * 0.8,
    height: width * 0.8,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#403F3F',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  dot: {
    width: 40,
    height: 15,
    borderRadius: 5,
    backgroundColor: '#CCCCCC',
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: '#9DCD5A',
  },
  button: {
    backgroundColor: '#9DCD5A',
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 15,
    marginTop: 5,
    marginBottom: 40,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SlideScreen;