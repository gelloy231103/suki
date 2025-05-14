import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, TextInput, FlatList, Animated, Easing, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { collection, query, where, onSnapshot, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { AuthContext } from '../context/AuthContext';

// Helper function to convert full unit names to abbreviations
const getUnitAbbreviation = (unit) => {
  if (!unit) return '';
  
  const unitMap = {
    'kilogram': 'kg',
    'kilograms': 'kg',
    'gram': 'g',
    'grams': 'g',
    'liter': 'L',
    'liters': 'L',
    'milliliter': 'mL',
    'milliliters': 'mL',
    'gallon': 'gal',
    'gallons': 'gal',
    'piece': 'pc',
    'pieces': 'pcs',
    'bunch': 'bunch',
    'bunches': 'bunches',
    'sack': 'sack',
    'sacks': 'sacks'
  };

  return unitMap[unit.toLowerCase()] || unit;
};

const DashboardScreen = ({ navigation }) => {
  const { userData } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const scaleValue = new Animated.Value(1);

  // Fetch all available categories
  const fetchCategories = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const categoriesSet = new Set();
      
      querySnapshot.forEach((doc) => {
        if (doc.data().category) {
          categoriesSet.add(doc.data().category);
        }
      });
      
      setCategories(Array.from(categoriesSet));
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Helper function to get product details
  const getProductDetails = async (productId) => {
    try {
      const docRef = doc(db, 'products', productId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error("Error fetching product details:", error);
      return null;
    }
  };

  // Calculate original bundle price
  const calculateOriginalBundlePrice = async (bundle) => {
    if (!bundle.bundleDetails?.items) return 0;
    
    let totalPrice = 0;
    for (const item of bundle.bundleDetails.items) {
      const product = await getProductDetails(item.productId);
      if (product) {
        totalPrice += product.price * item.quantity;
      }
    }
    return totalPrice;
  };

  // Fetch products from Firebase
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      
      let productsQuery = query(
        collection(db, 'products'),
        where('status', '==', 'available'),
        where('isBundled', '==', false)
      );

      if (selectedCategory) {
        productsQuery = query(
          productsQuery,
          where('category', '==', selectedCategory)
        );
      }

      if (searchQuery) {
        productsQuery = query(
          productsQuery,
          where('name', '>=', searchQuery),
          where('name', '<=', searchQuery + '\uf8ff')
        );
      }

      const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
        const productsData = snapshot.docs.map(doc => {
          const data = doc.data();
          const unitAbbreviation = getUnitAbbreviation(data.unit);
          
          return {
            id: doc.id,
            ...data,
            price: data.price,
            unit: unitAbbreviation,
            formattedPrice: `₱${data.price.toFixed(2)}${unitAbbreviation ? `/${unitAbbreviation}` : ''}`,
            originalPrice: data.percentage > 0 
              ? `₱${data.price.toFixed(2)}${unitAbbreviation ? `/${unitAbbreviation}` : ''}`
              : null,
            discount: data.percentage > 0 
              ? `${data.percentage}% OFF` 
              : null,
            rating: data?.rating?.average || 0,
            reviewCount: data?.rating?.count || 0
          };
        });

        setProducts(productsData);
        setLoading(false);
        setRefreshing(false);
      });

      return () => unsubscribeProducts();
    };

    // Fetch bundles separately with all details
    const fetchBundles = async () => {
      const bundlesQuery = query(
        collection(db, 'products'),
        where('isBundled', '==', true),
        where('status', '==', 'available')
      );
    
      const unsubscribeBundles = onSnapshot(bundlesQuery, async (snapshot) => {
        const bundlesData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const bundle = doc.data();
            const originalPrice = await calculateOriginalBundlePrice(bundle);
            const discountPercentage =
              originalPrice > 0
                ? Math.round((1 - bundle.price / originalPrice) * 100)
                : 0;
    
            // Get names of all products in the bundle with abbreviated units
            const productNames = await Promise.all(
              bundle.bundleDetails?.items?.map(async (item) => {
                const product = await getProductDetails(item.productId);
                if (product) {
                  const unitAbbreviation = getUnitAbbreviation(product.unit);
                  return `${product.name} (${item.quantity}${unitAbbreviation})`;
                }
                return '';
              }) || []
            );
    
            return {
              id: doc.id,
              ...bundle,
              formattedPrice: `₱${bundle.price.toFixed(2)}`,
              originalPrice: originalPrice > 0 ? `₱${originalPrice.toFixed(2)}` : null,
              discount: discountPercentage > 0 ? `${discountPercentage}% OFF` : null,
              rating: bundle.rating?.average || 0,
              reviewCount: bundle.rating?.count || 0,
              inclusions: productNames.filter(name => name),
              tag: bundle.tags?.includes('featured') ? 'BEST VALUE' :
                   bundle.tags?.includes('popular') ? 'POPULAR' :
                   bundle.tags?.includes('limited') ? 'LIMITED' : null
            };
          }) // ← this was missing a closing parenthesis
        );
    
        setBundles(bundlesData);
      });
    
      return () => unsubscribeBundles();
    };
    

    fetchCategories();
    fetchProducts();
    fetchBundles();
  }, [selectedCategory, searchQuery]);
  
  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true
      })
    ]).start();
  };

  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Icon key={i} name="star" size={14} color="#FFD700" />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <Icon key={i} name="star-half" size={14} color="#FFD700" />
        );
      } else {
        stars.push(
          <Icon key={i} name="star-border" size={14} color="#E0E0E0" />
        );
      }
    }
    
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  const toggleLike = (id) => {
    animateButton();
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === id ? {...product, liked: !product.liked} : product
      )
    );
  };

  const toggleBundleLike = (id) => {
    animateButton();
    setBundles(prevBundles => 
      prevBundles.map(bundle => 
        bundle.id === id ? {...bundle, liked: !bundle.liked} : bundle
      )
    );
  };

  const renderProduct = ({ item }) => (
    <Animated.View 
      style={[styles.productCard, { transform: [{ scale: scaleValue }] }]}
    >
      <TouchableOpacity
        onPress={() => navigation.navigate('FocusedProduct', { productId: item.id })}
        activeOpacity={0.9}
      >
        <View style={styles.productImageContainer}>
          {item.images?.[0] ? (
            <Image 
              source={{ uri: item.images[0] }} 
              style={styles.productImage} 
              resizeMode="cover" 
            />
          ) : (
            <View style={[styles.productImage, styles.emptyImage]}>
              <Icon name="image" size={24} color="#9DCD5A" />
            </View>
          )}
          
          <TouchableOpacity 
            onPress={() => toggleLike(item.id)}
            style={styles.productHeartIcon}
          >
            <Icon 
              name={item.liked ? 'favorite' : 'favorite-border'} 
              size={20} 
              color={item.liked ? '#FF5252' : 'white'} 
            />
          </TouchableOpacity>
          
          {item.discount && (
            <View style={styles.productDiscountBadge}>
              <Text style={styles.productDiscountText}>{item.discount}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.productContent}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          
          <View style={styles.productPriceContainer}>
            <Text style={styles.productPrice}>
              {item.discount 
                ? `₱${(item.price * (1 - parseInt(item.discount) / 100)).toFixed(2)}${item.unit ? `/${item.unit}` : ''}` 
                : item.formattedPrice}
            </Text>
            {item.originalPrice && (
              <Text style={styles.productOriginalPrice}>{item.originalPrice}</Text>
            )}
          </View>

          <View style={styles.productRatingContainer}>
            {renderRatingStars(item.rating || 0)}
            <Text style={styles.productReviewText}>{item.reviewCount || 0} reviews</Text>
          </View>
          
          <View style={styles.productFarmContainer}>
            <Icon name="location-on" size={14} color="#9DCD5A" />
            <Text style={styles.productFarmText} numberOfLines={1}>
              {item.farm || 'Local Farm'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderFlashDeal = ({ item }) => (
    <View style={[styles.flashDealCard]}>
      <View style={styles.flashDealImageContainer}>
        {item.images?.[0] ? (
          <Image 
            source={{ uri: item.images[0] }} 
            style={styles.flashDealImage} 
            resizeMode="cover" 
          />
        ) : (
          <View style={[styles.flashDealImage, styles.emptyImage]}>
            <Icon name="image" size={24} color="#9DCD5A" />
          </View>
        )}
        
        {item.tag && (
          <View style={[
            styles.tagBadge,
            item.tag === 'BEST VALUE' && styles.bestValueBadge,
            item.tag === 'POPULAR' && styles.popularBadge,
            item.tag === 'LIMITED' && styles.limitedBadge
          ]}>
            <Text style={styles.tagText}>{item.tag}</Text>
          </View>
        )}
        
        <TouchableOpacity 
          onPress={() => toggleBundleLike(item.id)} 
          style={styles.heartIcon}
        >
          <Icon 
            name={item.liked ? 'favorite' : 'favorite-border'} 
            size={24} 
            color={item.liked ? '#FF5252' : 'white'} 
          />
        </TouchableOpacity>
        
        {item.discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{item.discount}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.flashDealContent}>
        <View style={styles.farmRow}>
          <Icon name="home" size={15} color="#9DCD5A" />
          <Text style={styles.farmText}>{item.farm || 'Local Farm'}</Text>
          {renderRatingStars(item.rating)}
          <Text style={styles.reviewText}>({item.reviewCount})</Text>
        </View>
        
        <Text style={styles.flashDealTitle}>{item.name}</Text>
        
        {item.inclusions && item.inclusions.length > 0 && (
          <View style={styles.inclusionsContainer}>
            <Text style={styles.inclusionTitle}>Includes:</Text>
            {item.inclusions.slice(0, 3).map((inc, index) => (
              <Text key={index} style={styles.inclusionText}>• {inc}</Text>
            ))}
            {item.inclusions.length > 3 && (
              <Text style={styles.moreItemsText}>+{item.inclusions.length - 3} more items</Text>
            )}
          </View>
        )}
        
        <View style={styles.priceContainer}>
          <Text style={styles.nowOnly}>NOW </Text>
          <Text style={styles.flashDealPrice}>{item.formattedPrice}</Text>
          {item.originalPrice && (
            <Text style={styles.originalPrice}>{item.originalPrice}</Text>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.addToCartButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('FocusedProduct', { productId: item.id })}
        >
          <Text style={styles.addToCartText}>ADD TO CART</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCategories();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#9DCD5A']}
            tintColor="#9DCD5A"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingText}>Good morning,</Text>
            <Text style={styles.userName}>{userData.firstName || 'Suki Member'}!</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Icon name="notifications" size={24} color="#333" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <View style={[styles.searchContainer, searchFocused && styles.searchContainerFocused]}>
          <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            placeholder="Search for fresh produce..."
            style={styles.searchInput}
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => navigation.navigate('Filters')}
          >
            <Icon name="tune" size={20} color="#9DCD5A" />
          </TouchableOpacity>
        </View>
        
        {/* Categories - Only show when not searching */}
        {!searchQuery && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {marginLeft: 20, marginBottom: 10}]}>Shop Categories</Text>
            <ScrollView 
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              {categories.map((category, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[
                    styles.categoryButton,
                    selectedCategory === category && styles.selectedCategoryButton
                  ]}
                  onPress={() => setSelectedCategory(selectedCategory === category ? null : category)}
                >
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === category && styles.selectedCategoryText
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        
        {/* Banner - Only show when not searching */}
        {!searchQuery && (
          <View style={styles.bannerContainer}>
            <Image
              source={require('../assets/filler-img.png')}
              style={styles.bannerImage}
              resizeMode="cover"
            />
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>Seasonal Specials</Text>
              <Text style={styles.bannerSubtitle}>Up to 70% OFF on selected items</Text>
              <TouchableOpacity 
                style={styles.bannerButton}
                onPress={() => navigation.navigate('SeasonalProducts')}
              >
                <Text style={styles.bannerButtonText}>SHOP NOW</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* Flash Deals - Only show when not searching */}
        {!searchQuery && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Icon name="flash-on" size={20} color="#FFA726" />
                <Text style={styles.sectionTitle}>Flash Deals</Text>
              </View>
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => navigation.navigate('FlashDeals')}
              >
                <Text style={styles.viewAllText}>View All</Text>
                <Icon name="chevron-right" size={16} color="#9DCD5A" />
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={bundles}
              renderItem={renderFlashDeal}
              keyExtractor={item => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.flashDealsContainer}
            />
          </View>
        )}
        
        {/* Products */}
        <View style={[styles.section, {marginBottom: 0}]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Icon name="local-offer" size={20} color="#9DCD5A" />
              <Text style={styles.sectionTitle}>Fresh Picks</Text>
            </View>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('AllProducts')}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <Icon name="chevron-right" size={16} color="#9DCD5A" />
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <ActivityIndicator size="large" color="#9DCD5A" style={styles.loadingIndicator} />
          ) : products.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="search-off" size={48} color="#9DCD5A" />
              <Text style={styles.emptyText}>No products found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
            </View>
          ) : (
            <FlatList
              data={products}
              renderItem={renderProduct}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.productsContainer}
              numColumns={2}
              columnWrapperStyle={styles.productsRow}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  greetingContainer: {
    flexDirection: 'column',
  },
  greetingText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  userName: {
    fontSize: 20,
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
    marginTop: 2,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5252',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 28,
    paddingHorizontal: 20,
    height: 56,
    marginHorizontal: 24,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  searchContainerFocused: {
    borderColor: '#9DCD5A',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },
  filterButton: {
    marginLeft: 12,
    padding: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    color: '#333',
    fontFamily: 'Poppins-Bold',
    marginLeft: 8,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#9DCD5A',
    fontFamily: 'Poppins-SemiBold',
    marginRight: 4,
  },
  categoriesContainer: {
    paddingLeft: 24,
    paddingRight: 12,
    paddingBottom: 8,
  },
  categoryButton: {
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#FFF',
    paddingVertical: 8,
    paddingHorizontal: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  selectedCategoryButton: {
    backgroundColor: '#9DCD5A',
    borderColor: '#9DCD5A',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9DCD5A',
    fontFamily: 'Poppins-SemiBold',
  },
  selectedCategoryText: {
    color: '#FFF',
  },
  bannerContainer: {
    height: 160,
    borderRadius: 12,
    marginHorizontal: 24,
    marginBottom: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F0F7E6',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
  bannerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 22,
    color: '#2E7D32',
    fontFamily: 'Poppins-Bold',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 16,
    color: '#2E7D32',
    fontFamily: 'Poppins-Regular',
    marginBottom: 16,
  },
  bannerButton: {
    backgroundColor: '#9DCD5A',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    fontSize: 14,
    color: '#FFF',
    fontFamily: 'Poppins-SemiBold',
  },
  flashDealsContainer: {
    paddingLeft: 24,
    paddingRight: 12,
  },
  flashDealCard: {
    width: 280,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginRight: 16,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  flashDealImageContainer: {
    position: 'relative',
    height: 160,
  },
  flashDealImage: {
    width: '100%',
    height: '100%',
  },
  tagBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 2,
    backgroundColor: '#FFF',
  },
  bestValueBadge: {
    backgroundColor: '#4CAF50',
  },
  popularBadge: {
    backgroundColor: '#FFA726',
  },
  limitedBadge: {
    backgroundColor: '#F44336',
  },
  tagText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  discountBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 2,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  discountText: {
    color: '#4CAF50',
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  heartIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 20,
    padding: 6,
    zIndex: 2,
  },
  flashDealContent: {
    padding: 16,
  },
  farmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  farmText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginLeft: 6,
    marginRight: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
  },
  reviewText: {
    fontSize: 12,
    color: '#BBB5B5',
    fontFamily: 'Poppins-Regular',
  },
  flashDealTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 12,
    height: 40,
  },
  inclusionsContainer: {
    marginBottom: 12,
    minHeight: 60,
  },
  inclusionTitle: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginBottom: 4,
  },
  inclusionText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    lineHeight: 16,
  },
  moreItemsText: {
    fontSize: 12,
    color: '#9DCD5A',
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  nowOnly: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  flashDealPrice: {
    color: '#333',
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    lineHeight: 24,
  },
  originalPrice: {
    color: '#999',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    textDecorationLine: 'line-through',
    marginLeft: 8,
    lineHeight: 18,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addToCartButton: {
    backgroundColor: '#9DCD5A',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  addToCartText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  productsContainer: {
    paddingHorizontal: 20,
  },
  productsRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 16,
  },
  productImageContainer: {
    height: 140,
    position: 'relative',
    backgroundColor: '#F5F5F5',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  emptyImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  productHeartIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
    padding: 4,
    zIndex: 2,
  },
  productDiscountBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: '#FF5252',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    zIndex: 2,
  },
  productDiscountText: {
    color: '#FFF',
    fontSize: 10,
    fontFamily: 'Poppins-SemiBold',
  },
  productContent: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 8,
    height: 36,
    lineHeight: 18,
  },
  productPriceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#9DCD5A',
    lineHeight: 18,
  },
  productOriginalPrice: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 6,
    lineHeight: 14,
  },
  productRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  productReviewText: {
    fontSize: 10,
    color: '#BBB5B5',
    fontFamily: 'Poppins-Regular',
    marginLeft: 4,
  },
  productFarmContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  productFarmText: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginLeft: 4,
    flex: 1,
  },
  loadingIndicator: {
    marginVertical: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    fontFamily: 'Poppins-Regular',
    marginTop: 8,
    textAlign: 'center',
  },
  savingsContainer: {
    marginBottom: 12,
  },
  savingsText: {
    color: '#4CAF50',
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
});

export default DashboardScreen;