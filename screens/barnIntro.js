import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar
} from 'react-native';
import Swiper from 'react-native-swiper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const BarnIntro = () => {
  const navigation = useNavigation();
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = [
    {
      id: 1,
      title: 'Welcome to Your Digital Barn',
      description: 'Manage your farm operations, track livestock, and monitor crops all in one place.',
      image: require('../assets/images/barnIntro1.png'),
      icon: 'barn'
    },
    {
      id: 2,
      title: 'Real-Time Monitoring',
      description: 'Get instant updates on your farm activities and receive alerts when attention is needed.',
      image: require('../assets/images/barnIntro2.png'),
      icon: 'chart-line'
    },
    {
      id: 3,
      title: 'Farm Management Made Easy',
      description: 'Organize tasks, schedule activities, and keep records of your farm operations.',
      image: require('../assets/images/barnIntro3.png'),
      icon: 'clipboard-list'
    }
  ];

  const handleCreateBarn = () => {
    navigation.navigate('EditFarmProfile');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Skip Button (only shows on first two slides) */}
      {activeIndex < slides.length - 1 && (
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={() => setActiveIndex(slides.length - 1)}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      <Swiper
        style={styles.wrapper}
        showsButtons={false}
        loop={false}
        dotStyle={styles.dot}
        activeDotStyle={styles.activeDot}
        onIndexChanged={(index) => setActiveIndex(index)}
      >
        {slides.map((slide) => (
          <View key={slide.id} style={styles.slide}>
            <View style={styles.imageContainer}>
              <Image source={slide.image} style={styles.image} resizeMode="contain" />
            </View>
            
            <View style={styles.contentContainer}>
              
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.description}>{slide.description}</Text>
            </View>
          </View>
        ))}
      </Swiper>

      {/* Bottom section */}
      <View style={styles.bottomContainer}>
        

        {/* Action Button */}
        <TouchableOpacity 
          style={styles.button}
          onPress={handleCreateBarn}
        >
          <Text style={styles.buttonText}>
            {activeIndex === slides.length - 1 ? 'Create My Barn Account' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  wrapper: {},
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  imageContainer: {
    width: width * 0.8,
    height: height * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30
  },
  image: {
    width: '100%',
    height: '100%'
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: 40
  },
  icon: {
    marginBottom: 20
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 32
  },
  description: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24
  },
  dot: {
    backgroundColor: '#E0E0E0',
    width: 8,
    height: 8,
    borderRadius: 4,
    margin: 3
  },
  activeDot: {
    backgroundColor: '#8CC63F',
    width: 20,
    height: 8,
    borderRadius: 4,
    margin: 3
  },
  bottomContainer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
    alignItems: 'center'
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: 30
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4
  },
  paginationDotActive: {
    backgroundColor: '#8CC63F',
    width: 20
  },
  button: {
    backgroundColor: '#8CC63F',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16
  },
  skipButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
    padding: 10
  },
  skipText: {
    color: '#8CC63F',
    fontFamily: 'Poppins-Regular',
    fontSize: 16
  }
});

export default BarnIntro;