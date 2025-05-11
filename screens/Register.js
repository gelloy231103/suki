import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Alert, ActivityIndicator 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import PasswordStrengthMeterBar from 'react-native-password-strength-meter-bar';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth, db } from '../config/firebase'; // Import Firebase functions

const RegisterScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Validation functions
  const validateName = (name) => /^[A-Za-z\-'\s]{2,50}$/.test(name.trim());
  const validateEmail = (email) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email.trim());
  const validatePhone = (phone) => /^\d{10,15}$/.test(phone.trim());
  const validatePassword = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$/.test(password);

  const handleContinue = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
  
    try {
      // 1. Create auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      // 2. Send verification email
      await sendEmailVerification(userCredential.user);

      // 3. Save user data to Firestore - matches your screenshot structure
      const userData = {
        basicInfo: {
          firstName: form.firstName,
          lastName: form.lastName,
          middleName: form.middleName || '', // Empty string instead of null
          email: form.email,
          phone: form.phone,
          emailVerified: false,
          profileImage: '', // Empty string to match your structure
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp()
        },
        security: {
          lastLogin: null,
          twoFactorEnabled: false // Matches your screenshot's camelCase
        }
      };

      await setDoc(doc(db, "users", userCredential.user.uid), userData);

      // 4. Navigate to verification screen
      navigation.navigate('VerifyEmail', {
        email: form.email,
        userId: userCredential.user.uid
      });

    } catch (error) {
      console.error("Registration error:", error);
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthError = (error) => {
    console.error("Registration error:", error);
    switch (error.code) {
      case 'auth/email-already-in-use':
        setErrors(prev => ({...prev, email: 'Email is already registered'}));
        break;
      case 'auth/invalid-email':
        setErrors(prev => ({...prev, email: 'Invalid email address'}));
        break;
      case 'auth/weak-password':
        setErrors(prev => ({...prev, password: 'Password is too weak'}));
        break;
      default:
        Alert.alert("Registration Error", "An error occurred during registration. Please try again.");
    }
  };

  // Form validation
  const validateForm = () => {
    let valid = true;
    let newErrors = {};

    if (!form.firstName.trim()) {
      newErrors.firstName = "First name is required";
      valid = false;
    } else if (!validateName(form.firstName)) {
      newErrors.firstName = "Please enter a valid name (letters only, min 2 characters)";
      valid = false;
    }

    if (!form.lastName.trim()) {
      newErrors.lastName = "Last name is required";
      valid = false;
    } else if (!validateName(form.lastName)) {
      newErrors.lastName = "Please enter a valid name (letters only, min 2 characters)";
      valid = false;
    }
    
    if (form.middleName.trim() && !validateName(form.middleName)) {
      newErrors.middleName = "Please enter a valid name (letters only, min 2 characters)";
      valid = false;
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!validateEmail(form.email)) {
      newErrors.email = "Please enter a valid email address";
      valid = false;
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
      valid = false;
    } else if (!validatePhone(form.phone)) {
      newErrors.phone = "Please enter a valid phone number (10-15 digits)";
      valid = false;
    }

    if (!form.password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (!validatePassword(form.password)) {
      newErrors.password = "Password must be at least 8 characters and include uppercase, lowercase, number, and special character";
      valid = false;
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      valid = false;
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFocus = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Calculate password strength
  useEffect(() => {
    const score = calculatePasswordStrength(form.password);
    setPasswordStrength(score);
  }, [form.password]);

  const calculatePasswordStrength = (password) => {
    if (!password) return '';
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@#$%^&+=!]/.test(password)) score++;

    if (score <= 2) return 'Weak';
    if (score === 3 || score === 4) return 'Medium';
    return 'Strong';
  };

  // Check if all required fields are filled
  const isFormValid = () => {
    return (
      form.firstName.trim() &&
      form.lastName.trim() &&
      form.email.trim() &&
      form.phone.trim() &&
      form.password &&
      form.confirmPassword
    );
  };


  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Create an Account.</Text>
        <Text style={styles.subtitle}>
          Join Suki and Connect with Fresh, Local Produce! Create your account by filling up the form below.
        </Text>

        {/* First Name */}
        <Text style={styles.label}>First name.</Text>
        <TextInput
          style={[
            styles.input,
            errors.firstName ? styles.inputError : (touched.firstName && form.firstName && !errors.firstName ? styles.inputSuccess : null),
          ]}
          placeholder="First Name"
          value={form.firstName}
          onChangeText={(val) => handleInputChange('firstName', val)}
          onFocus={() => handleFocus('firstName')}
        />
        {errors.firstName && <Text style={styles.validationText}>{errors.firstName}</Text>}

        {/* Last Name */}
        <Text style={styles.label}>Last name.</Text>
        <TextInput
          style={[
            styles.input,
            errors.lastName ? styles.inputError : (touched.lastName && form.lastName && !errors.lastName ? styles.inputSuccess : null),
          ]}
          placeholder="Last Name"
          value={form.lastName}
          onChangeText={(val) => handleInputChange('lastName', val)}
          onFocus={() => handleFocus('lastName')}
        />
        {errors.lastName && <Text style={styles.validationText}>{errors.lastName}</Text>}

        {/* Middle Name */}
        <Text style={styles.label}>Middle Name.</Text>
        <TextInput
          style={[
            styles.input,
            errors.middleName ? styles.inputError : (touched.middleName && form.middleName && !errors.middleName ? styles.inputSuccess : null),
          ]}
          placeholder="Middle Name (optional)"
          value={form.middleName}
          onChangeText={(val) => handleInputChange('middleName', val)}
          onFocus={() => handleFocus('middleName')}
        />
        {errors.middleName && <Text style={styles.validationText}>{errors.middleName}</Text>}

        {/* Email */}
        <Text style={styles.label}>Email.</Text>
        <TextInput
          style={[
            styles.input,
            errors.email ? styles.inputError : (touched.email && form.email && !errors.email ? styles.inputSuccess : null),
          ]}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={(val) => handleInputChange('email', val)}
          onFocus={() => handleFocus('email')}
        />
        {errors.email && <Text style={styles.validationText}>{errors.email}</Text>}

        {/* Phone */}
        <Text style={styles.label}>Phone number.</Text>
        <TextInput
          style={[
            styles.input,
            errors.phone ? styles.inputError : (touched.phone && form.phone && !errors.phone ? styles.inputSuccess : null),
          ]}
          placeholder="Phone Number"
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={(val) => handleInputChange('phone', val)}
          onFocus={() => handleFocus('phone')}
        />
        {errors.phone && <Text style={styles.validationText}>{errors.phone}</Text>}

        {/* Password */}
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[
              styles.input,
              errors.password ? styles.inputError : (touched.password && form.password && !errors.password ? styles.inputSuccess : null),
            ]}
            placeholder="Password"
            secureTextEntry={!passwordVisible}
            value={form.password}
            onChangeText={(val) => handleInputChange('password', val)}
            onFocus={() => handleFocus('password')}
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
        <PasswordStrengthMeterBar
          password={form.password}
          showStrengthText={true}
          height={4}
          radius={4}
          unfilledColor="#F0F0F0"
        />
        {errors.password && <Text style={styles.validationText}>{errors.password}</Text>}

        {/* Confirm Password */}
        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[
              styles.input,
              errors.confirmPassword ? styles.inputError : (touched.confirmPassword && form.confirmPassword && !errors.confirmPassword ? styles.inputSuccess : null),
            ]}
            placeholder="Confirm Password"
            secureTextEntry={!confirmPasswordVisible}
            value={form.confirmPassword}
            onChangeText={(val) => handleInputChange('confirmPassword', val)}
            onFocus={() => handleFocus('confirmPassword')}
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
        {errors.confirmPassword && <Text style={styles.validationText}>{errors.confirmPassword}</Text>}
      </ScrollView>

      {/* Continue Button */}
      <TouchableOpacity
        style={[styles.continueButton, (!isFormValid() || isLoading) && styles.buttonDisabled]}
        onPress={handleContinue}
        disabled={!isFormValid() || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.continueText}>Continue</Text>
        )}
      </TouchableOpacity>

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
  container: {
    flex: 1,
    position: 'relative',
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 50,
  },
  backgroundImage: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 350,
    height: 350,
    opacity: 0.7,
    zIndex: -1,
    pointerEvents: 'none',
  },
  title: {
    fontSize: 30,
    color: '#97C854',
    fontFamily: 'Poppins-Black',
    marginTop:30
  },
  subtitle: {
    fontSize: 13,
    color: '#444',
    marginBottom: 10,
    fontFamily: 'Poppins-Regular',
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginTop: 12,
    marginLeft: 5,
    fontFamily: 'Poppins-Regular',
  },
  input: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    borderWidth: 1,
    borderColor: '#DFDFDF',
    marginBottom: 4,
  },
  inputError: {
    borderColor: 'red',
  },
  validationText: {
    color: 'red',
    fontSize: 10,
    marginLeft: 5,
    marginBottom: 4,
    fontFamily: 'Poppins-Regular',
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
    backgroundColor: '#97C854',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    margin: 20,
  },
  continueText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  inputSuccess: {
    borderColor: 'green',
    borderWidth: 1.5,
  },
});
