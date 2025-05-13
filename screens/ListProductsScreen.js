import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { AuthContext } from '../context/AuthContext';

const ListProductsScreen = () => {
  const navigation = useNavigation();
  const { userData } = useContext(AuthContext);
  const [productList, setProductList] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [priceFilter, setPriceFilter] = useState('lowest to high');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsRef = collection(db, 'products');
        const q = query(productsRef, where('status', '==', 'available'));
        
        const unsubscribe = onSnapshot(q, async (snapshot) => {
          const productsData = [];
          
          for (const doc of snapshot.docs) {
            const product = doc.data();
            // Check if product is favorited by current user
            let isFavorite = false;
            if (userData?.uid) {
              const favoriteRef = doc(db, 'users', userData.uid, 'favorites', doc.id);
              const favoriteSnap = await getDoc(favoriteRef);
              isFavorite = favoriteSnap.exists();
            }
            
            productsData.push({
              id: doc.id,
              ...product,
              liked: isFavorite,
              imageUrl: product.images?.[0] || '',
              formattedPrice: `₱${product.price.toFixed(2)}${product.unit ? `/${product.unit}` : ''}`,
              rating: product.rating?.average || 0,
              reviews: product.rating?.count || 0
            });
          }
          
          setProductList(productsData);
          setLoading(false);
        });
        
        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [userData]);

  // Fetch categories from products
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const productsRef = collection(db, 'products');
        const snapshot = await getDocs(productsRef);
        
        const categoriesSet = new Set(['All']);
        snapshot.forEach(doc => {
          if (doc.data().category) {
            categoriesSet.add(doc.data().category);
          }
        });
        
        setCategories(Array.from(categoriesSet));
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Filter and sort products based on selections
  useEffect(() => {
    let result = [...productList];
    
    // Filter by category
    if (activeCategory !== 'All') {
      result = result.filter(product => 
        product.category === activeCategory
      );
    }
    
    // Filter by search query
    if (searchQuery) {
      const queryLower = searchQuery.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(queryLower) ||
        (product.farm && product.farm.toLowerCase().includes(queryLower))
      );
    }
    
    // Sort by price
    result.sort((a, b) => {
      return priceFilter === 'lowest to high' ? a.price - b.price : b.price - a.price;
    });
    
    setFilteredProducts(result);
  }, [productList, activeCategory, priceFilter, searchQuery]);

  // Toggle favorite status
  const toggleLike = async (product) => {
    if (!userData?.uid) {
      navigation.navigate('Login');
      return;
    }
    
    try {
      const favoriteRef = doc(db, 'users', userData.uid, 'favorites', product.id);
      
      if (product.liked) {
        // Remove from favorites
        await deleteDoc(favoriteRef);
      } else {
        // Add to favorites
        await setDoc(favoriteRef, {
          productId: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          addedAt: new Date().toISOString(),
          unit: product.unit
        });
      }
      
      // Update local state
      setProductList(prevProducts => 
        prevProducts.map(p => 
          p.id === product.id ? {...p, liked: !p.liked} : p
        )
      );
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Icon key={i} name="star" size={16} color="#FFD700" />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <Icon key={i} name="star-half" size={16} color="#FFD700" />
        );
      } else {
        stars.push(
          <Icon key={i} name="star-border" size={16} color="#E0E0E0" />
        );
      }
    }
    
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => navigation.navigate('FocusedProduct', { product: item })}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.productImage} resizeMode="cover" />
      ) : (
        <View style={[styles.productImage, { backgroundColor: '#EEE', justifyContent: 'center', alignItems: 'center' }]}>
          <Icon name="image" size={30} color="#9DCD5A" />
        </View>
      )}
      
      <View style={styles.productInfo}>
        <Text 
          style={styles.productName}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.name}
        </Text>
        <Text style={styles.productPrice}>{item.formattedPrice}</Text>
        
        <View style={styles.ratingContainer}>
          {renderRatingStars(item.rating)}
          <Text style={styles.reviewText}>{item.reviews} reviews</Text>
        </View>
        
        <View style={styles.farmContainer}>
          <Icon name="location-on" size={16} color="#9DCD5A" />
          <Text 
            style={styles.farmText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.farm || 'Local Farm'}
          </Text>
        </View>
      </View>
      
      <View style={styles.likeButtonContainer}>
        <TouchableOpacity onPress={() => toggleLike(item)}>
          <Icon 
            name={item.liked ? 'favorite' : 'favorite-border'} 
            size={24} 
            color={item.liked ? '#FF5252' : '#CCCCCC'} 
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9DCD5A" />
      </View>
    );
  }

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
            value={searchQuery}
            onChangeText={setSearchQuery}
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
              numberOfLines={1}
              ellipsizeMode="tail"
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
          data={filteredProducts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { flexGrow: 1, justifyContent: 'flex-start' }]} // Align items at the top
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          }
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
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
    paddingHorizontal: 15,
    height: 50,
  },
  categoryButton: {
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#EEE',
    marginRight: 12,
    textAlign: 'center',
    height: 30,
    justifyContent: 'center',
  },
  activeCategoryButton: {
    backgroundColor: '#9DCD5A',
    color: 'white',
  },
  categoryText: {
    fontSize: 12,
    color: 'black',
    maxWidth: 100,
  },
  activeCategoryText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    width: 100,
    height: 100,
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
    maxWidth: '90%',
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
    maxWidth: '80%',
  },
  likeButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
});

export default ListProductsScreen;