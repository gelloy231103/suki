import React, { useState, useEffect } from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import * as Font from 'expo-font';
import AppLoading from 'expo-app-loading';
import 'react-native-gesture-handler';

import 'react-native-gesture-handler';

// Screen imports
import LoaderScreen from './screens/LoaderScreen';
import ListProductsScreen from './screens/ListProductsScreen'
import FocusedProductScreen from './screens/FocusedProductScreen';
import CheckOutScreen from './screens/CheckOutScreen';
import Login from './screens/Login';
import LandingScreen from './screens/LandingScreen';
import RegisterScreen from './screens/Register';
import UploadId from './screens/UploadId';
import VerifyEmail from './screens/VerifyEmail';
import WelcomeToFam from './screens/WelcomeToFam';
import Verified from './screens/Verified';
import DashboardScreen from './screens/dashboardScreen'; 
import ProfileDashboard from './screens/ProfileDashboard';
import EditUserProfile from './screens/EditUserProfile';
import WalletScreen from './screens/Wallet';
import { AuthProvider } from './context/AuthContext';
import AddCardScreen from './screens/AddCardScreen';
import OnBoarding from './screens/OnBoarding';
import MainTab from './navigation/MainTab';
import CardPage from './screens/CardPage';
import FarmDashboard from './screens/FarmDashboard';
import EditFarmProfile from './screens/EditFarmProfile.js'
import ProductDetails from './screens/productDetails.js';
import ProductList from './screens/ProductList.js';
import AddProductScreen from './screens/AddProductScreen.js';
import CartScreen from './screens/CartScreen.js';
import ProductsScreen from './screens/ProductsScreen.js';
import ListofProduct from './screens/ListProductsScreen.js';
import BarnIntro from './screens/barnIntro.js';

const Stack = createStackNavigator();

// Custom theme configuration
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#9DCD5A',
    accent: '#8BC34A',
  },
};

// Font loading function
const fetchFonts = () => {
  return Font.loadAsync({
    'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
    'Poppins-Black': require('./assets/fonts/Poppins-Black.ttf'),
    'Poppins-Medium': require('./assets/fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('./assets/fonts/Poppins-SemiBold.ttf'),
  });
};

const App = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    fetchFonts().then(() => {
      setFontsLoaded(true);
    });
  }, []);

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <AuthProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="AddProductScreen"
            screenOptions={{
              gestureEnabled: true,
              ...TransitionPresets.SlideFromRightIOS,
            }}
          >
            <Stack.Screen
              name="ListProducts"
              component={ListProductsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
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
              name="BarnIntro"
              component={BarnIntro}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="UploadId"
              component={UploadId}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="VerifyEmail"
              component={VerifyEmail}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="WelcomeToFam"
              component={WelcomeToFam}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Verified"
              component={Verified}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="OnBoarding"
              component={OnBoarding}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ProfileDashboard"
              component={ProfileDashboard}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CardPage"
              component={CardPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="EditUserProfile"
              component={EditUserProfile}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="WalletScreen"
              component={WalletScreen}
              options={{ headerShown: false }}
            />
          <Stack.Screen
            name="MainTab"
            component={MainTab}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CartScreen"
            component={CartScreen}
            options={{ headerShown: false }}
          />
            <Stack.Screen
              name="AddCardScreen"
              component={AddCardScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
            name="FarmDashboard"
            component={FarmDashboard}
            options={{ headerShown: false }}
            />
            <Stack.Screen
            name="EditFarmProfile"
            component={EditFarmProfile}
            options={{ headerShown: false }}
            />
            <Stack.Screen
            name="ProductDetails"
            component={ProductDetails}
            options={{ headerShown: false }}
            />
            <Stack.Screen
            name="ProductList"
            component={ProductList}
            options={{ headerShown: false }}
            />
            <Stack.Screen
            name="AddProductScreen"
            component={AddProductScreen}
            options={{ headerShown: false }}
            />
            <Stack.Screen
            name="ProductsScreen"
            component={ProductsScreen}
            options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </AuthProvider>
  );
};

export default App;