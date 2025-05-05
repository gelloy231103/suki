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
  }
];

const ListProductsScreen = () => {
  const navigation = useNavigation();
  const [productList, setProductList] = useState(products);
  const [activeCategory, setActiveCategory] = useState('Leaf greens');
  const [priceFilter, setPriceFilter] = useState('lowest to high');

  const toggleLike = (id) => {
    setProductList(prevProducts => 
      prevProducts.map(product => 
        product.id === id ? {...product, liked: !product.liked} : product
      )
    );
  };

  const togglePriceFilter = () => {
    setPriceFilter(prev => prev === 'lowest to high' ? 'highest to low' : 'lowest to high');
  };

  const renderRatingStars = (rating) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Icon 
            key={i}
            name={i <= rating ? 'star' : 'star-border'}
            size={16}
            color={i <= rating ? '#FFD700' : '#CCCCCC'}
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
          <Icon name="home" size={16} color="#9DCD5A" />
          <Text style={styles.farmText}>{item.farm}</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.likeButton}
        onPress={() => toggleLike(item.id)}
      >
        <Icon 
          name={item.liked ? 'favorite' : 'favorite-border'} 
          size={24} 
          color={item.liked ? '#FF5252' : '#CCCCCC'} 
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#403F3F" />
        </TouchableOpacity>

        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIcon}>
            <Icon name="message" size={24} color="#403F3F" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Icon name="shopping-bag" size={24} color="#403F3F" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Vegetables</Text>
        <View style={styles.searchContainer}>
          <Icon
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Search for vegetables..."
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

      {/* Filter Row */}
      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="filter-list" size={20} color="#9DCD5A" />
          <Text style={styles.filterText}>Filters</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.priceFilterButton}
          onPress={togglePriceFilter}
        >
          <Text style={styles.priceFilterText}>Price: {priceFilter}</Text>
          <Icon
            name={
              priceFilter === "lowest to high"
                ? "arrow-drop-down"
                : "arrow-drop-up"
            }
            size={20}
            color="#9DCD5A"
          />
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#F9F9F9',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#403F3F',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  headerIcon: {
    marginLeft: 16,
  },
headerRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 16,
  marginBottom: 16,
},
headerTitle: {
  fontSize: 30,
  fontWeight: 'bold',
  color: '#009216',
  marginRight: 10, // Add some spacing between title and search
},
searchContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#FFF',
  borderRadius: 8,
  paddingHorizontal: 16,
  height: 48,
  flex: 1, // Take up remaining space
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
  fontSize: 16,
  color: '#403F3F',
},
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    height: 50,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#EEE',
    marginRight: 8,
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
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#9DCD5A',
    fontWeight: 'bold',
  },
  priceFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceFilterText: {
    fontSize: 14,
    color: '#666',
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
    borderRadius: 8,
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
  likeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
});

export default ListProductsScreen;