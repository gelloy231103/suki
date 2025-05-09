import React, { useState, useEffect } from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoaderScreen from './screens/LoaderScreen';
import SlideScreen from './screens/SlideScreen';
import ListProductsScreen from './screens/ListProductsScreen';
import FocusedProductScreen from './screens/FocusedProductScreen';
import CheckOutScreen from './screens/CheckOutScreen';

const Stack = createStackNavigator();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoaderScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Slides">
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;