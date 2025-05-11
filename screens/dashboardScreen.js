import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';


const DashboardScreen = ({ navigation }) => {
  const categories = ['leafy greens', 'root crops', 'FILLERS & BEAUTY PRODUCTS'];
  const [activeTab, setActiveTab] = useState('Home');

  return (
    <View style={styles.container}>
      {/* Main Scrollable Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            placeholder="Search"
            style={styles.searchInput}
            placeholderTextColor="#888"
          />
        </View>

        {/* Logo */}
        <Image 
          source={require('../assets/suki-big-logo.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />

        {/* Category Buttons */}
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((category, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.categoryButton}
              onPress={() => navigation.navigate('CategoryProducts', { category })}
            >
              <Text style={styles.categoryText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Banner Image */}
        <Image
          source={require('../assets/filler-img.png')}
          style={styles.bannerImage}
          resizeMode="contain"
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    marginBottom: 70, // Matches bottom menu height
  },
  contentContainer: {
    padding: 16,
    paddingTop: 50,
    paddingBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 40,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#333',
  },
  logo: {
    width: '100%',
    height: 140,
    marginBottom: 20,
  },
  categoriesContainer: {
    paddingBottom: 20,
  },
  categoryButton: {
    backgroundColor: '#9DCD5A',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 10,
    height: 40,
    justifyContent: 'center',
    marginTop: 2,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    textTransform: 'uppercase',
  },
  bannerImage: {
    width: '100%',
    height: 180,
    marginTop: -20,
  },
});

export default DashboardScreen;