import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const categories = ['Leaf greens', 'Broccoli', 'Cauliflower', 'Spinach', 'more'];
const products = [
  {
    id: '1',
    name: 'Sweet Tomatoes',
    price: 'P40/kg',
    rating: 4,
    reviews: 354,
    farm: 'Tadhana FarmVille',
    image: require('../assets/tomatoes.png'),
    liked: false
  },
  {
    id: '2',
    name: 'Biggest Eggplant',
    price: 'P80/kg',
    rating: 4,
    reviews: 354,
    farm: 'Marikina Farm and Restaurant',
    image: require('../assets/eggplant.png'),
    liked: false
  },
  {
    id: '3',
    name: 'Broccolicious',
    price: 'P40/kg',
    rating: 4,
    reviews: 354,
    farm: 'Habano Farm and Grill',
    image: require('../assets/broccoli.png'),
    liked: false
  },
  {
    id: '4',
    name: 'Lettuce Baguio',
    price: 'P35/kg',
    rating: 4,
    reviews: 354,
    farm: 'Habano Farm and Grill',
    image: require('../assets/tomatoes.png'),
    liked: false
  },
  {
    id: '5',
    name: 'Sweet Tomatoes',
    price: 'P38/kg',
    rating: 4,
    reviews: 354,
    farm: 'Tadhana Farm Ville',
    image: require('../assets/tomatoes.png'),
    liked: false
  },
    {
    id: '6',
    name: 'Sweet Tomatoes',
    price: 'P38/kg',
    rating: 4,
    reviews: 354,
    farm: 'Tadhana Farm Ville',
    image: require('../assets/tomatoes.png'),
    liked: false
  }
];

const ListProductsScreen = () => {
  const navigation = useNavigation();
  const [productList, setProductList] = useState(products);
  const [activeCategory, setActiveCategory] = useState('Leaf greens');
  const [priceFilter, setPriceFilter] = useState('lowest to high');
  const [activeTab, setActiveTab] = useState('Browse');

  const toggleLike = (id) => {
    setProductList(prevProducts => 
      prevProducts.map(product => 
        product.id === id ? {...product, liked: !product.liked} : product
      )
    );
  };

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
      </View>
    );
  };

  const renderItem = ({ item }) => (
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
      {/* Header with Logo and Search */}
      <View style={styles.header}>
        <Image source={require('../assets/suki-big-logo.png')} style={styles.logo} />
        <View style={styles.searchContainer}>
          <Icon
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Search for local products..."
            style={styles.searchInput}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              activeCategory === category && styles.activeCategoryButton,
            ]}
            onPress={() => setActiveCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                activeCategory === category && styles.activeCategoryText,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Filters and Sorting */}
      <View style={styles.filtersRow}>
        <TouchableOpacity style={styles.filterItem}>
          <Icon name="tune" size={20} color="#666" />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.filterItem}
          onPress={() => setPriceFilter(prev => prev === 'lowest to high' ? 'highest to low' : 'lowest to high')}
        >
          <Text style={styles.filterText}>Price: {priceFilter}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.filterItem}>
          <Icon name="grid-on" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Product List */}
      <FlatList
        data={productList}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    paddingBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#F9F9F9',
  },
  logo: {
    width: 100,
    height: 60,
    resizeMode: 'contain',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 40,
    marginLeft: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#403F3F',
  },
  categoriesContainer: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#EEE',
    marginRight: 12,
    height: 50,
    justifyContent: 'center', 
    alignItems: 'center',   
    marginTop: -10,
    marginBottom: 5,
  },
  activeCategoryButton: {
    backgroundColor: '#9DCD5A',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  activeCategoryText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: -8,
    marginTop: 5,
  },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  listContent: {
    padding: 16,
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

export default ListProductsScreen;