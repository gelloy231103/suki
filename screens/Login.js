import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image
} from 'react-native';
import { auth } from "../config/firebase";
import { signInWithEmailAndPassword } from 'firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';

const Login = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const signIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('Login successful!');
    } catch (error) {
      alert(error.message);
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

      <TouchableOpacity style={styles.loginButton} onPress={signIn}>
        <Text style={styles.loginButtonText}>Login</Text>
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
});
