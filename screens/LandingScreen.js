import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const LandingScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
          <Image
            source={require('../assets/suki-logo.png')}
            style={styles.windmill}
          />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.registerButton}
        onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerText}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LandingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },  
  windmill: {
    width: 348,
    height: 348,
  },
  buttonContainer: {
    width: '100%',
  },
  loginButton: {
    backgroundColor: '#7AC943',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    borderWidth: 1,
    borderColor: '#7AC943',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  registerText: {
    color: '#7AC943',
    fontSize: 16,
    fontWeight: '600',
  },
});
