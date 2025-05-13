import React, { useState, useEffect, useContext } from 'react';
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
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

const ProductsScreen = () => {
  const navigation = useNavigation();
  const { userData } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch products only for the current user
  useEffect(() => {
    if (!userData?.userId) return;

    const fetchProducts = () => {
      setLoading(true);

      // Query for user's products (not drafts)
      const productsQuery = query(
        collection(db, 'products'),
        where('userId', '==', userData.userId),
        where('status', '!=', 'draft')
      );
      
      // Query for user's drafts
      const draftsQuery = query(
        collection(db, 'products'),
        where('userId', '==', userData.userId),
        where('status', '==', 'draft')
      );

      const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          formattedPrice: `₱${doc.data().price?.toFixed(2) || '0.00'}`,
          discountPrice: doc.data().percentage 
            ? `₱${(doc.data().price * (1 - doc.data().percentage/100)).toFixed(2)}`
            : null
        }));
        setProducts(productsData);
        setLoading(false);
        setRefreshing(false);
      });

      const unsubscribeDrafts = onSnapshot(draftsQuery, (snapshot) => {
        const draftsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          formattedPrice: `₱${doc.data().price?.toFixed(2) || '0.00'}`
        }));
        setDrafts(draftsData);
      });

      return () => {
        unsubscribeProducts();
        unsubscribeDrafts();
      };
    };

    fetchProducts();
  }, [userData?.userId]);

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
    <TouchableOpacity
      style={styles.productContainer}
      onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
    >
      <View style={styles.productHeader}>
        <View style={styles.productInfo}>
          {item.images?.length > 0 ? (
            <Image source={{ uri: item.images[0] }} style={styles.productImage} />
          ) : (
            <View style={[styles.productImage, styles.emptyImage]}>
              <Ionicons name="image" size={24} color="#9DCD5A" />
            </View>
          )}
          <View style={styles.productTextContainer}>
            <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.productCategory}>{item.category}</Text>
            {item.isFeatured && (
              <View style={styles.featuredTag}>
                <Text style={styles.featuredText}>Featured</Text>
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
        
        <View style={styles.detailItem}>
          <Ionicons name="cube" size={16} color="#9DCD5A" />
          <Text style={styles.detailValue}>{item.stock} available</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Ionicons name="cart" size={16} color="#9DCD5A" />
          <Text style={styles.detailValue}>Min: {item.minimumOrder || 1}</Text>
        </View>
      </View>
    </TouchableOpacity>
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
      {/* Modern Header */}
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

      {/* Search Bar with modern styling */}
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
          <TouchableOpacity 
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Tab Navigation with improved styling */}
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

      {/* Product List with empty state */}
      <FlatList
        data={activeTab === 'products' ? filteredProducts : filteredDrafts}
        renderItem={renderProductItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#9DCD5A"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="leaf-outline" size={48} color="#9DCD5A" />
            <Text style={styles.emptyText}>
              {activeTab === 'products' 
                ? searchQuery ? 'No matching products' : 'No products yet'
                : 'No drafts saved'}
            </Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'products' 
                ? searchQuery ? 'Try a different search term' : 'Add your first product to get started'
                : 'Save products as drafts to continue later'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity 
                style={styles.addFirstButton}
                onPress={() => navigation.navigate('AddProductScreen')}
              >
                <Text style={styles.addFirstButtonText}>
                  {activeTab === 'products' ? 'Add First Product' : 'Create Draft'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
      
      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('AddProductScreen')}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    padding: 8,
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
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    margin: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#e9ecef',
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },
  clearButton: {
    padding: 4,
  },
  // Tab Navigation
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 1,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {
    backgroundColor: '#f1f8e9',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#888',
  },
  activeTabText: {
    color: '#9DCD5A',
    fontFamily: 'Poppins-SemiBold',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '100%',
    backgroundColor: '#9DCD5A',
  },
  // Product List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  // Product Card
  productContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    elevation: 1,
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
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f8f9fa',
  },
  emptyImage: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
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
    fontSize: 14,
    color: '#9DCD5A',
    fontFamily: 'Poppins-Medium',
  },
  featuredTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  featuredText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#2e7d32',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  statusAvailable: {
    backgroundColor: '#e8f5e9',
  },
  statusSoldOut: {
    backgroundColor: '#ffebee',
  },
  statusSeasonal: {
    backgroundColor: '#e3f2fd',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  // Price Section
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
    fontFamily: 'Poppins-Regular',
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
  // Details Section
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#666',
    marginLeft: 4,
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    maxWidth: '80%',
  },
  addFirstButton: {
    marginTop: 20,
    backgroundColor: '#9DCD5A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
  },
  addFirstButtonText: {
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },
  // Add Button
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
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