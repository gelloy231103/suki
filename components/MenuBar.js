import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const MenuBar = ({ activeTab }) => {
  const navigation = useNavigation();

  const tabs = [
    { name: 'Home', icon: 'home', screen: 'Dashboard' },
    { name: 'Browse', icon: 'search', screen: 'ListProducts' },
    { name: 'Cart', icon: 'shopping-cart', screen: 'Cart' },
    { name: 'Messages', icon: 'message', screen: 'Messages' },
    { name: 'Me', icon: 'person', screen: 'ProfileDashboard' },
  ];

  return (
    <View style={styles.bottomMenu}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.name}
          style={[
            styles.menuItem,
            activeTab === tab.name && styles.activeMenuItem,
          ]}
          onPress={() => navigation.navigate(tab.screen)}
        >
          <View style={styles.menuIconContainer}>
            <Icon
              name={tab.icon}
              size={24}
              color={activeTab === tab.name ? '#FFF' : '#666'}
            />
          </View>
          <Text
            style={[
              styles.menuText,
              activeTab === tab.name && styles.activeMenuText,
            ]}
          >
            {tab.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
  
};
const styles = StyleSheet.create({
  bottomMenu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  menuItem: {
    alignItems: 'center',
    padding: 10,
    width:80,
    height:70,
  },
  activeMenuItem: {
    backgroundColor: '#9DCD5A',
    borderRadius: 8,
  },
  menuIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 12,
    marginTop: 4,
    color: '#666',
  },
  activeMenuText: {
    color: 'white',
    fontWeight: 'bold',
  }
});

export default MenuBar;