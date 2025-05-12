import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import all your tab screens
import DashboardScreen from '../screens/dashboardScreen';
import ListProductsScreen from '../screens/ListProductsScreen';
import CheckOutScreen from '../screens/CheckOutScreen';
import ProfileDashboard from '../screens/ProfileDashboard';
import CartScreen from '../screens/CartScreen';

const Tab = createBottomTabNavigator();

const MainTab = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#9DCD5A',
      tabBarInactiveTintColor: '#666',
      tabBarStyle: {
        height: 70,
        paddingBottom: 5,
        paddingTop: 5,
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
      name="Browse"
      component={ListProductsScreen}
      options={{
        tabBarIcon: ({ color }) => <Icon name="search" size={24} color={color} />,
        tabBarLabel: 'Browse',
      }}
    />
    <Tab.Screen
      name="Cart"
      component={CartScreen}
      options={{
        tabBarIcon: ({ color }) => <Icon name="shopping-cart" size={24} color={color} />,
        tabBarLabel: 'Cart',
      }}
    />
        <Tab.Screen
      name="Messages"
      component={ProfileDashboard}
      options={{
        tabBarIcon: ({ color }) => <Icon name="message" size={24} color={color} />,
        tabBarLabel: 'Messages',
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileDashboard}
      options={{
        tabBarIcon: ({ color }) => <Icon name="person" size={24} color={color} />,
        tabBarLabel: 'Profile',
      }}
    />
  </Tab.Navigator>
);

export default MainTab;