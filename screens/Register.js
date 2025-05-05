import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, KeyboardAvoidingView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const RegisterScreen = ({navigation}) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  return (
    <View style={styles.container}>
      
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create an Account.</Text>
        <Text style={styles.subtitle}>
          Join Suki and Connect with Fresh, Local Produce! Create your account by filling up the form below.
        </Text>
  
        <Text style={styles.label}>First name.</Text>
        <TextInput style={styles.input} placeholder="First Name" />
  
        <Text style={styles.label}>Last name.</Text>
        <TextInput style={styles.input} placeholder="Last Name" />
  
        <Text style={styles.label}>Middle Name.</Text>
        <TextInput style={styles.input} placeholder="Middle Name" />
  
        <Text style={styles.label}>Email.</Text>
        <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" />
  
        <Text style={styles.label}>Phone number.</Text>
        <TextInput style={styles.input} placeholder="Phone Number" keyboardType="phone-pad" />
  
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry={!passwordVisible}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <Icon
              name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#7AC943"
            />
          </TouchableOpacity>
        </View>
  
        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            secureTextEntry={!confirmPasswordVisible}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
          >
            <Icon
              name={confirmPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#7AC943"
            />
          </TouchableOpacity>
        </View>
  
        <TouchableOpacity style={styles.continueButton} onPress={() => navigation.navigate('UploadId')}>
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>

      <Image
        source={require('../assets/bg1.png')}
        style={styles.backgroundImage}
        resizeMode="contain"
      />
  
    </View>
  );  
};

export default RegisterScreen;

const styles = StyleSheet.create({

  scrollContainer: {
    padding: 24,
    paddingTop: 70,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
    backgroundColor: 'none'
  },
  backgroundImage: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 350,
    height: 350,
    opacity: .7,
    zIndex: -1,
    pointerEvents: 'none', 
  },  
  title: {
    fontSize: 29,
    color: '#97C854',
    fontFamily: 'Poppins-Black',
  },
  subtitle: {
    fontSize: 11.5,
    color: '#444',
    marginBottom: 10,
    fontFamily: 'Poppins-Regular',
  },
  label: {
    fontSize: 12,
    color: '#333',
    marginBottom: 0,
    marginTop: 12,
    marginLeft: 5,
    fontFamily: 'Poppins-Regular',
  },
  input: {
    backgroundColor: '#F1F1F11',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#00000',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DFDFDF',
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 12,
  },
  continueButton: {
    marginTop: 30,
    backgroundColor: '#97C854',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  continueText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

  
  