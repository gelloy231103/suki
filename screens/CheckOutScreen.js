import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CheckOutScreen = () => {
    const navigation = useNavigation();
  
    return (
      <View style={styles.container}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Image
            source={require('../assets/L1.png')} 
            style={styles.imgDone}
            resizeMode="contain"
          />
        </View>
        
        {/* Success Message */}
        <Text style={styles.successMessage}>CHECK OUT WAS DONE SUCCESSFULLY.</Text>
        
        {/* Confirmation Button */}
        <TouchableOpacity 
          style={styles.confirmButton}
          onPress={() => navigation.navigate('ListProducts')} // Updated navigation target
        >
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    );
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 30,
  },
  imgDone:{
    height:150,
    width: 150,
  },
  successMessage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9DCD5A',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 28,
  },
  confirmButton: {
    backgroundColor: '#9DCD5A',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '80%',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default CheckOutScreen;