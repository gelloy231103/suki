// In navigation/MainTab.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import all your tab screens
import DashboardScreen from '../screens/dashboardScreen';
import ListProductsScreen from '../screens/ListProductsScreen';
import CartScreen from '../screens/CheckOutScreen'; // Renamed from CheckOutScreen
// import MessagesScreen from '../screens/MessagesScreen'; // Create this
import ProfileDashboard from '../screens/ProfileDashboard';

const Tab = createBottomTabNavigator();

const MainTab = () => {
  return (
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
        name="Home"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="home" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Browse"
        component={ListProductsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="search" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="shopping-cart" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="message" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileDashboard}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="person" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTab;