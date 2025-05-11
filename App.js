import React, { useState, useEffect } from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Font from 'expo-font';
import AppLoading from 'expo-app-loading';

// Screen imports
import LoaderScreen from './screens/LoaderScreen';
import ListProductsScreen from './screens/ListProductsScreen';
import FocusedProductScreen from './screens/FocusedProductScreen';
import CheckOutScreen from './screens/CheckOutScreen';
import Login from './screens/Login';
import LandingScreen from './screens/LandingScreen';
import RegisterScreen from './screens/Register';
import UploadId from './screens/UploadId';
import VerifyEmail from './screens/VerifyEmail';
import WelcomeToFam from './screens/WelcomeToFam';
import Verified from './screens/Verified';
import Onboarding from './screens/OnBoarding';
import ProfileDashboard from './screens/ProfileDashboard';
import EditUserProfile from './screens/EditUserProfile';
import DashboardScreen from './screens/dashboardScreen';
import MainTab from './navigation/MainTab';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Custom theme configuration
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#9DCD5A',
    accent: '#8BC34A',
  },
};

// Bottom Tab Navigator (Main App Tabs)
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#9DCD5A',
      tabBarInactiveTintColor: '#666',
      tabBarStyle: {
        height: 70,
        paddingBottom: 5,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        elevation: 10,
        shadowOpacity: 0.1,
      },
    }}
  >
    <Tab.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{
        tabBarIcon: ({ color }) => <Icon name="home" size={24} color={color} />,
        tabBarLabel: 'Home',
      }}
    />
    <Tab.Screen
      name="ListProducts"
      component={ListProductsScreen}
      options={{
        tabBarIcon: ({ color }) => <Icon name="search" size={24} color={color} />,
        tabBarLabel: 'Browse',
      }}
    />
    <Tab.Screen
      name="Cart"
      component={CheckOutScreen} // Replace with CartScreen if different
      options={{
        tabBarIcon: ({ color }) => <Icon name="shopping-cart" size={24} color={color} />,
        tabBarLabel: 'Cart',
      }}
    />
    <Tab.Screen
      name="Messages"
      component={ProfileDashboard} // Placeholder (replace with MessagesScreen)
      options={{
        tabBarIcon: ({ color }) => <Icon name="message" size={24} color={color} />,
        tabBarLabel: 'Messages',
      }}
    />
    <Tab.Screen
      name="ProfileDashboard"
      component={ProfileDashboard}
      options={{
        tabBarIcon: ({ color }) => <Icon name="person" size={24} color={color} />,
        tabBarLabel: 'Me',
      }}
    />
  </Tab.Navigator>
);

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
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="LandingScreen"
          screenOptions={{
            gestureEnabled: true,
            ...TransitionPresets.SlideFromRightIOS, // Smooth transition for non-tab screens
          }}
        >
          {/* Auth/Onboarding Screens */}
          <Stack.Screen
            name="LandingScreen"
            component={LandingScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={Login}
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
            component={Onboarding}
            options={{ headerShown: false }}
          />

          {/* Main App (Tabs) */}
          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{ headerShown: false }}
          />

          {/* Other Screens (Modal-like) */}
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
            name="EditUserProfile"
            component={EditUserProfile}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;