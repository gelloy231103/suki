import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { AuthContext } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';


const OrdersScreen = () => {
  const navigation = useNavigation();
  const { userData } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [farms, setFarms] = useState({});
  const [products, setProducts] = useState({});

  const fetchData = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      setLoading(true);
      
      // 1. Fetch user's orders
      const ordersQuery = query(
        collection(db, 'users', userId, 'orders'),
        where('status', '!=', 'cancelled')
      );
      const ordersSnapshot = await getDocs(ordersQuery);
      
      const ordersData = [];
      const farmIds = new Set();
      const productIds = new Set();

      // Process orders and collect related IDs
      for (const doc of ordersSnapshot.docs) {
        const order = doc.data();
        ordersData.push({ 
          id: doc.id, 
          ...order,
          price: Number(order.price) || 0,
          quantity: Number(order.quantity) || 0,
          discount: Number(order.discount) || 0
        });

        if (order.farmId) farmIds.add(order.farmId);
        if (order.productId) productIds.add(order.productId);
      }

      // 2. Fetch related farms in parallel
      const farmsPromise = fetchCollectionData('farms', Array.from(farmIds));
      
      // 3. Fetch related products in parallel
      const productsPromise = fetchCollectionData('products', Array.from(productIds));

      const [farmsData, productsData] = await Promise.all([
        farmsPromise,
        productsPromise
      ]);

      // 4. Update state with all data
      setOrders(ordersData);
      setFilteredOrders(ordersData);
      setFarms(farmsData);
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to fetch multiple documents from a collection
  const fetchCollectionData = async (collectionName, ids) => {
    if (!ids.length) return {};
    
    try {
      const q = query(
        collection(db, collectionName),
        where('__name__', 'in', ids)
      );
      const snapshot = await getDocs(q);
      
      const data = {};
      snapshot.forEach(doc => {
        data[doc.id] = doc.data();
      });
      return data;
    } catch (error) {
      console.error(`Error fetching ${collectionName}:`, error);
      return {};
    }
  };

  useEffect(() => {
    fetchData();
  }, [userData?.userId]);

  // Filter orders based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(order => {
        const searchLower = searchQuery.toLowerCase();
        return (
          order.orderId?.toLowerCase().includes(searchLower) || 
          order.productName?.toLowerCase().includes(searchLower) ||
          (products[order.productId]?.name?.toLowerCase().includes(searchLower))
        );
      });
      setFilteredOrders(filtered);
    }
  }, [searchQuery, orders, products]);

  const renderOrderItem = ({ item }) => {
    const product = products[item.productId] || {};
    const farm = farms[item.farmId] || {};
    const discountAmount = item.discount ? (item.price * item.quantity * item.discount / 100) : 0;
    const totalPrice = (item.price * item.quantity) - discountAmount;

    return (
      <TouchableOpacity 
        style={styles.orderCard}
        onPress={() => navigation.navigate('CustomerTracking', { 
          orderId: item.id,
          farmId: item.farmId,
          productId: item.productId
        })}
      >
        <View style={styles.orderImageContainer}>
          {product.images?.[0] ? (
            <Image 
              source={{ uri: product.images[0] }} 
              style={styles.orderImage} 
              resizeMode="cover"
            />
          ) : (
            <View style={styles.orderImagePlaceholder}>
              <MaterialCommunityIcons name="image-off" size={24} color="#9DCD5A" />
            </View>
          )}
        </View>
        
        <View style={styles.orderDetails}>
          <Text style={styles.orderName} numberOfLines={1}>
            {product.name || item.productName || 'Unknown Product'}
          </Text>
          <Text style={styles.orderFarm}>
            {farm.name || 'Local Farm'}
          </Text>
          
          <View style={styles.orderMeta}>
            <Text style={styles.orderPrice}>
              ₱{item.price.toFixed(2)}
            </Text>
            <Text style={styles.orderQuantity}>
              x{item.quantity}
            </Text>
          </View>
          
          {item.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                {item.discount}% OFF
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.orderTotal}>
          <Text style={styles.orderTotalText}>
            ₱{totalPrice.toFixed(2)}
          </Text>
          <Text style={[
            styles.orderStatus,
            item.status === 'completed' && styles.statusCompleted,
            item.status === 'cancelled' && styles.statusCancelled
          ]}>
            {item.status || 'processing'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9DCD5A" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="#888" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search orders..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      {filteredOrders.length > 0 ? (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="cart-off" size={48} color="#9DCD5A" />
          <Text style={styles.emptyText}>No orders found</Text>
          <Text style={styles.emptySubtext}>
            {searchQuery ? 'Try a different search' : 'Your orders will appear here'}
          </Text>
        </View>
      )}
    </SafeAreaView>
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
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    height: 50,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontFamily: 'Poppins-Regular',
    marginLeft: 10,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
  },
  orderImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderImage: {
    width: '100%',
    height: '100%',
  },
  orderImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderDetails: {
    flex: 1,
    marginLeft: 15,
  },
  orderName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 2,
  },
  orderFarm: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#888',
    marginBottom: 8,
  },
  orderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderPrice: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#9DCD5A',
    marginRight: 10,
  },
  orderQuantity: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#888',
  },
  discountBadge: {
    backgroundColor: '#FFEBEE',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 5,
  },
  discountText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#FF5252',
  },
  orderTotal: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  orderTotalText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  orderStatus: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#9DCD5A',
    marginTop: 5,
    textTransform: 'capitalize',
  },
  statusCompleted: {
    color: '#4CAF50',
  },
  statusCancelled: {
    color: '#F44336',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#888',
    marginTop: 8,
  },
});

export default OrdersScreen;