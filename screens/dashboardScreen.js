import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, TextInput, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const DashboardScreen = ({ navigation }) => {
  const categories = ['leafy greens', 'root crops', 'FILLERS & BEAUTY PRODUCTS'];
  const [activeTab, setActiveTab] = useState('Home');

  // Flash Deals Data
  const flashDeals = [
    {
      id: '1',
      farm: 'Tadhana FarmVille',
      rating: 4.5,
      reviews: 55,
      name: 'Vegetable Sack of Marikina City',
      inclusions: ['Majority of Root Crops', 'Tomatoes', 'Corn'],
      price: 'P 500 Per Sack',
      image: require('../assets/sale1.png')
    },
    {
      id: '2',
      farm: 'Tadhana FarmVille',
      rating: 4.5,
      reviews: 55,
      name: 'Vegetable Sack of Marikina City',
      inclusions: ['Majority of Root Crops', 'Tomatoes', 'Corn'],
      price: 'P 500 Per Sack',
      image: require('../assets/sale1.png')
    },
    {
      id: '3',
      farm: 'Marikina Farm and Restaurant',
      rating: 4.5,
      reviews: 55,
      name: 'Vegetable Sack of Marikina City',
      inclusions: ['Majority of Root Crops', 'Tomatoes', 'Corn'],
      price: 'P 500 Per Sack',
      image: require('../assets/sale1.png')
    },
    {
      id: '4',
      farm: 'Habano Farm and Grill',
      rating: 4.5,
      reviews: 55,
      name: 'Vegetable Sack of Marikina City',
      inclusions: ['Majority of Root Crops', 'Tomatoes', 'Corn'],
      price: 'P 500 Per Sack',
      image: require('../assets/sale1.png')
    }
  ];

  // Regular Products Data
  const products = [
    {
      id: '1',
      name: 'Sweet Tomatoes',
      price: 'P40/kg',
      rating: 4,
      reviews: 354,
      farm: 'Tadhana FarmVille',
      image: require('../assets/garlic.png')
    },
    {
      id: '2',
      name: 'Biggest Eggplant',
      price: 'P80/kg',
      rating: 4,
      reviews: 354,
      farm: 'Marikina Farm and Restaurant',
      image: require('../assets/garlic.png')
    },
    {
      id: '3',
      name: 'Broccolicious',
      price: 'P40/kg',
      rating: 4,
      reviews: 354,
      farm: 'Habano Farm and Grill',
      image: require('../assets/garlic.png')
    },
   {
      id: '4',
      name: 'Broccolicious',
      price: 'P40/kg',
      rating: 4,
      reviews: 354,
      farm: 'Habano Farm and Grill',
      image: require('../assets/garlic.png')
    }
  ];
const [productList, setProductList] = useState(products);

  const renderRatingStars = (rating) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Icon 
            key={i}
            name={i <= rating ? 'star' : 'star-border'}
            size={16}
            color={i <= rating ? '#FF5252' : '#E0E0E0'}
          />
        ))}
        <Text style={styles.reviewText}>({rating})</Text>
      </View>
    );
  };

  const renderFlashDeal = ({ item }) => (
    <View style={styles.flashDealCard}>
      <Image source={item.image} style={styles.flashDealImage} resizeMode="cover" />
      <View style={styles.flashDealContent}>
        <Text style={styles.flashDealTitle}>{item.name}</Text>
        <View style={styles.farmContainer}>
          <Icon name="location-on" size={16} color="#9DCD5A" />
          <Text style={styles.farmText}>{item.farm}</Text>
        </View>
        {renderRatingStars(item.rating)}
        <View style={styles.inclusionsContainer}>
          {item.inclusions.map((inc, index) => (
            <Text key={index} style={styles.inclusionText}>• {inc}</Text>
          ))}
        </View>
        <Text style={styles.flashDealPrice}>{item.price}</Text>
      </View>
    </View>
  );

 // Updated product render item to match ListProductsScreen
  const renderProduct = ({ item }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => navigation.navigate('FocusedProduct', { product: item })}
    >
      <Image source={item.image} style={styles.productImage} resizeMode="cover" />
      
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price}</Text>
        
        <View style={styles.ratingContainer}>
          {renderRatingStars(item.rating)}
          <Text style={styles.reviewText}>{item.reviews} reviews</Text>
        </View>
        
        <View style={styles.farmContainer}>
          <Icon name="location-on" size={16} color="#9DCD5A" />
          <Text style={styles.farmText}>{item.farm}</Text>
        </View>
      </View>
      
      <View style={styles.likeButtonContainer}>
        <TouchableOpacity onPress={() => toggleLike(item.id)}>
          <Icon 
            name={item.liked ? 'favorite' : 'favorite-border'} 
            size={24} 
            color={item.liked ? '#FF5252' : '#CCCCCC'} 
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

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

        {/* Flash Deals Section (unchanged) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Flash Deals</Text>
          <Text style={styles.viewAllText}>View All</Text>
        </View>
        <FlatList
          horizontal
          data={flashDeals}
          renderItem={renderFlashDeal}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.flashDealsContainer}
        />

        {/* Products Section - Now using wide cards */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Products</Text>
        </View>
        <FlatList
          data={productList}
          renderItem={renderProduct}
          keyExtractor={item => item.id}
          scrollEnabled={false}
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
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#403F3F',
  },
  viewAllText: {
    fontSize: 14,
    color: '#9DCD5A',
    fontWeight: '600',
  },
  flashDealsContainer: {
    paddingBottom: 20,
  },
  flashDealCard: {
    width: 220,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginRight: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  flashDealImage: {
    width: '100%',
    height: 120,
  },
  flashDealContent: {
    padding: 12,
  },
  flashDealTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#403F3F',
    marginBottom: 8,
  },
  flashDealPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF5252',
    marginTop: 8,
  },
  farmContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  farmText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  inclusionsContainer: {
    marginVertical: 8,
  },
  inclusionText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  productsRow: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#403F3F',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9DCD5A',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  reviewText: {
    fontSize: 12,
    color: '#666',
  },
  farmContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  farmText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  likeButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
});

export default DashboardScreen;