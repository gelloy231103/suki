import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import * as Progress from 'react-native-progress';

const LoaderScreen = ({ navigation }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress bar animation over 30 seconds
    const totalDuration = 10000; // 30 seconds in milliseconds
    const intervalDuration = 50; // Update every 50ms (smooth animation)
    const increment = intervalDuration / totalDuration; // Calculated automatically
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + increment;
        if (newProgress >= 1) {
          clearInterval(interval);
          navigation.replace('Login');
        }
        return newProgress;
      });
    }, intervalDuration);
  
    return () => clearInterval(interval);
  }, [navigation]);

  return (
    <View style={styles.container}>
      
      {/* GIF placeholder - replace with your actual GIF */}
      <View style={styles.gifContainer}>
        <Image
          source={require('../assets/suki-logo.png')} // Replace with your GIF path
          style={styles.gif}
          resizeMode="contain"
        />
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <Progress.Bar 
          progress={progress} 
          width={300} 
          height={16} 
          color="#9DCD5A" 
          borderRadius={10}
          borderWidth={0}
          unfilledColor="#D9D9D9"
        />
        <Text style={styles.percentage}>{Math.round(progress * 100)}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  gifContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxHeight: 500,
  },
  gif: {
    width: 348,
    height: 348,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  percentage: {
    marginTop: 8,
    fontSize: 18,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
});

export default LoaderScreen;