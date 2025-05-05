import React, { useState, useEffect } from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoaderScreen from './screens/LoaderScreen';
import SlideScreen from './screens/SlideScreen';
import ListProductsScreen from './screens/ListProductsScreen';
import FocusedProductScreen from './screens/FocusedProductScreen';
import CheckOutScreen from './screens/CheckOutScreen';
import Login from './screens/Login';
import LandingScreen from './screens/LandingScreen';
import RegisterScreen from './screens/Register';
import UploadId from './screens/UploadId'; 
import * as Font from 'expo-font';
import AppLoading from 'expo-app-loading';

const Stack = createStackNavigator();

// Function to load fonts
const fetchFonts = () => {
  return Font.loadAsync({
    'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
    'Poppins-Black': require('./assets/fonts/Poppins-Black.ttf'),
  });
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    // Load fonts asynchronously
    fetchFonts().then(() => {
      setFontsLoaded(true);
    });
  }, []);

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LandingScreen">
        <Stack.Screen
          name="Slides"
          component={SlideScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ListProducts"
          component={ListProductsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="FocusedProduct"
          component={FocusedProductScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CheckOut"
          component={CheckOutScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
            name="Login"
            component={Login}
            options={{ headerShown: false }}
        />
        <Stack.Screen
            name="LandingScreen"
            component={LandingScreen}
            options={{ headerShown: false }}
        />
        <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
        />
        <Stack.Screen
            name="UploadId"
            component={UploadId}
            options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
