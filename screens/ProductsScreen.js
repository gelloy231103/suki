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
  TextInput,
  Alert
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
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch products from Firestore filtered by farmId (current user)
  useEffect(() => {
    const fetchProducts = () => {
      setLoading(true);
      const userId = auth.currentUser?.uid;
      if (!userId) return;
      
      const productsQuery = query(
        collection(db, 'products'),
        where('farmId', '==', userId),
        where('status', '!=', 'draft')
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

      return () => unsubscribeProducts();
    };

    fetchProducts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
  };

  // Filter products based on search query
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle product deletion
  const handleDeleteProduct = (productId) => {
    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete this product?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'products', productId));
              // No need to manually refresh as Firestore listener will update automatically
            } catch (error) {
              console.error("Error deleting product: ", error);
              Alert.alert("Error", "Failed to delete product");
            }
          }
        }
      ]
    );
  };

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
          <TouchableOpacity onPress={() => handleDeleteProduct(item.id)}>
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
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Modern Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Products ({products.length})</Text>
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

      {/* Product List */}
      <FlatList
        data={filteredProducts}
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
              {searchQuery 
                ? 'No products found matching your search' 
                : 'No products added yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery 
                ? 'Try a different search term'
                : 'Add your first product to get started'}
            </Text>
          </View>
        }
      />
      
      {/* Add Product Button */}
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
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  // Modern Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    flex: 1,
    marginRight: 40, // To balance the left back button
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
  // Product List
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  // Product Card
  productContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    color: '#9DCD5A',
    fontWeight: '500',
  },
  featuredTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  featuredText: {
    fontSize: 12,
    fontWeight: '500',
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
    fontWeight: '500',
  },
  // Price Section
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '600',
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
    fontWeight: '600',
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
    fontWeight: '500',
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
    fontWeight: '500',
    color: '#666',
    marginLeft: 4,
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
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