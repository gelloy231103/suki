import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import { auth, db } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore"; 

const Login = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get the auth context functions
  const { saveUserData } = useContext(AuthContext);

  const signIn = async () => {
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }
  
    setIsLoading(true);
    
    try {
      // 1. Authenticate user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // 2. Get user document from Firestore
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        
        // 3. Save all user data to context
        await saveUserData(
          userCredential.user.email,
          userCredential.user.uid,
          {
            firstName: userData.basicInfo.firstName,
            lastName: userData.basicInfo.lastName,
            middleName: userData.basicInfo.middleName
          }
        );
        {console.log(userData)}
        
        navigation.navigate('OnBoarding');
      } else {
        throw new Error("User profile not found in database");
      }
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Login failed. Please try again.";
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email.";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password.";
      } else if (error.message.includes("User profile not found")) {
        errorMessage = "Account exists but profile is incomplete.";
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back.</Text>
      <Text style={styles.subtitle}>Glad to see you again!</Text>

      <Text style={styles.label}>Email or Username</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Password</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.inputPassword}
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
        >
          <Icon
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color="#777"
          />

        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.forgotPassword}>
        <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.loginButton} 
        onPress={signIn}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.loginButtonText}>Login</Text>
        )}
      </TouchableOpacity>

       <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Don't have an account yet?</Text>
        <TouchableOpacity>
          <Text style={styles.registerNow}
          onPress={() => navigation.navigate('Register')}> Register now</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    marginTop: 100,
    fontSize: 25,
    color: '#9DCD5A',
    fontFamily: 'Poppins-Bold',
    marginBottom: -15,
  },
  subtitle: {
    fontSize: 25,
    fontFamily: 'Poppins-Bold',
    marginBottom: 110,
    color: '#9DCD5A',
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },
  input: {
    height: 48,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  inputPassword: {
    flex: 1,
    height: 48,
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: '#999',
    fontSize: 12,
  },
  loginButton: {
    backgroundColor: '#A4DC4C',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  registerContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  registerText: {
    color: '#777',
  },
  registerNow: {
    color: '#9DCD5A',
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#A4DC4C',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48, 
  },
});
