import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  TextInput
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProductsScreen = () => {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const currentFarmId = "farm456";

  // Fetch all products from Firestore (removed farmId filter)
  useEffect(() => {
    const fetchProducts = () => {
      setLoading(true);
      
      // Query for all products (not drafts)
      const productsQuery = query(
        collection(db, 'products'),
        where('status', '!=', 'draft')
      );
      
      // Query for drafts
      const draftsQuery = query(
        collection(db, 'products'),
        where('status', '==', 'draft')
      );

      const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          formattedPrice: `₱${doc.data().price.toFixed(2)}`,
          discountPrice: doc.data().percentage 
            ? `₱${(doc.data().price * (1 - doc.data().percentage/100)).toFixed(2)}`
            : null
        }));
        setProducts(productsData);
        setLoading(false);
        setRefreshing(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }).start();
      });

      const unsubscribeDrafts = onSnapshot(draftsQuery, (snapshot) => {
        const draftsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          formattedPrice: `₱${doc.data().price.toFixed(2)}`
        }));
        setDrafts(draftsData);
      });

      return () => {
        unsubscribeProducts();
        unsubscribeDrafts();
      };
    };

    fetchProducts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    // The useEffect will automatically refetch when refreshing changes
  };

  // Filter products based on search query
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDrafts = drafts.filter(draft => 
    draft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    draft.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    draft.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderProductItem = ({ item }) => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity 
        style={styles.productContainer}
        onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
        activeOpacity={0.9}
      >
        <View style={styles.productHeader}>
          <View style={styles.productInfo}>
            {item.images?.length > 0 ? (
              <Image 
                source={{ uri: item.images[0] }} 
                style={styles.productImage} 
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.productImage, styles.emptyImage]}>
                <Ionicons name="image" size={24} color="#9DCD5A" />
              </View>
            )}
            <View style={styles.productTextContainer}>
              <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.productCategory}>{item.category}</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.priceText}>{item.formattedPrice}</Text>
                {item.discount?.percentage > 0 && (
                  <Text style={styles.discountPriceText}>
                    {item.discountPrice} / {item.unit.toLowerCase()}
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge,
            item.status === 'available' && styles.statusAvailable,
            item.status === 'sold-out' && styles.statusSoldOut,
            item.status === 'seasonal' && styles.statusSeasonal,
          ]}>
            <Text style={styles.statusText}>
              {item.status === 'available' ? 'In Stock' : 
               item.status === 'sold-out' ? 'Sold Out' : 'Seasonal'}
            </Text>
          </View>
          <TouchableOpacity>
            <MaterialIcons name="more-vert" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.priceContainer}>
        {item.percentage > 0 ? (
          <>
            <Text style={styles.originalPrice}>{item.formattedPrice}</Text>
            <Text style={styles.discountedPrice}>{item.discountPrice}</Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{item.percentage}% OFF</Text>
            </View>
          </>
        ) : (
          <Text style={styles.productPrice}>{item.formattedPrice}</Text>
        )}
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Ionicons name="pricetag" size={16} color="#9DCD5A" />
          <Text style={styles.detailValue}>{item.unit || 'kg'}</Text>
        </View>
        
        {item.discount?.percentage > 0 && (
          <View style={styles.discountTag}>
            <Text style={styles.discountTagText}>{item.discount.percentage}% OFF</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9DCD5A" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Modern Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('FarmDashboard')}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Products</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close" size={20} color="#999" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'products' && styles.activeTab]}
          onPress={() => setActiveTab('products')}
        >
          <Text style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}>
            Products ({products.length})
          </Text>
          {activeTab === 'products' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'drafts' && styles.activeTab]}
          onPress={() => setActiveTab('drafts')}
        >
          <Text style={[styles.tabText, activeTab === 'drafts' && styles.activeTabText]}>
            Drafts ({drafts.length})
          </Text>
          {activeTab === 'drafts' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
      </View>

      {/* Product List */}
      <FlatList
        data={activeTab === 'products' ? filteredProducts : filteredDrafts}
        renderItem={renderProductItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#9DCD5A']}
            tintColor="#9DCD5A"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="leaf-outline" size={48} color="#9DCD5A" />
            <Text style={styles.emptyText}>
              {activeTab === 'products' 
                ? 'No products found' 
                : 'No drafts saved'}
            </Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'products' 
                ? searchQuery ? 'Try a different search' : 'Add your first product to get started'
                : 'Save products as drafts to continue later'}
            </Text>
          </View>
        }
      />
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('AddProductScreen')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  header: {
    padding: 24,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  // Search Bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 16,
    margin: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333',
  },
  // Tab Navigation
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {
    // Styles applied when tab is active
  },
  tabText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#888',
  },
  activeTabText: {
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: -1,
    height: 2,
    width: '50%',
    backgroundColor: '#9DCD5A',
  },
  // Product List
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  productContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: '#F5F5F5',
  },
  emptyImage: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  productTextContainer: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: '#9DCD5A',
    fontFamily: 'Poppins-Medium',
  },
  featuredTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  priceText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#2C3E50',
  },
  discountPriceText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#2e7d32',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  statusAvailable: {
    backgroundColor: 'rgba(157, 205, 90, 0.2)',
  },
  statusSoldOut: {
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
  },
  statusSeasonal: {
    backgroundColor: 'rgba(52, 152, 219, 0.2)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  moreButton: {
    padding: 4,
  },
  stockContainer: {
    marginTop: 12,
  },
  stockInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountedPrice: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#9DCD5A',
    marginRight: 8,
  },
  discountBadge: {
    backgroundColor: '#fff8e1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#ff8f00',
  },
  discountTag: {
    position: 'absolute',
    top: 16,
    right: -30,
    backgroundColor: '#FF6B6B',
    paddingVertical: 2,
    paddingHorizontal: 30,
    transform: [{ rotate: '45deg' }],
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#666',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
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
    color: '#95A5A6',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#9DCD5A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default ProductsScreen;