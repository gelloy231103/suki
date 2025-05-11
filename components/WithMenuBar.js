// components/WithMenuBar.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import MenuBar from './MenuBar';

const WithMenuBar = ({ children }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {children}
      </View>
      <MenuBar activeTab="Browse" /> {/* Set activeTab as needed */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 70, // Space for MenuBar
  },
  content: {
    flex: 1,
  },
});

export default WithMenuBar;