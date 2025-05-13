import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  RefreshControl,
  ActivityIndicator,
  Animated,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { RectButton } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

const ProductsScreen = ({ navigation }) => {
  const { userData } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const swipeableRefs = useRef({});

  useEffect(() => {
    const fetchProducts = () => {
      setLoading(true);
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const productsQuery = query(
        collection(db, 'products'),
        where('farmId', '==', userId)
      );
      
      const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          formattedPrice: `₱${doc.data().price.toFixed(2)}`,
          unitText: `/${doc.data().unit.toLowerCase()}`,
          discountPrice: doc.data().discount?.percentage 
            ? `₱${(doc.data().price * (1 - doc.data().discount.percentage/100)).toFixed(2)}`
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

      return () => unsubscribeProducts();
    };

    fetchProducts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
  };

  const handleAddProduct = () => {
    navigation.navigate('AddProductScreen', { mode: 'add' });
  };

  const handleEditProduct = (product) => {
    navigation.navigate('AddProductScreen', { 
      product,
      mode: 'edit'
    });
  };

  const confirmDelete = (productId) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => closeSwipeable(productId)
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDeleteProduct(productId)
        }
      ]
    );
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (error) {
      console.error('Error deleting product:', error);
      Alert.alert('Error', 'Failed to delete product. Please try again.');
    }
  };

  const closeSwipeable = (productId) => {
    if (swipeableRefs.current[productId]) {
      swipeableRefs.current[productId].close();
    }
  };

  const renderRightActions = (progress, dragX, productId) => {
    const trans = dragX.interpolate({
      inputRange: [0, 50, 100, 101],
      outputRange: [0, 0, 0, 1],
    });
    
    return (
      <RectButton 
        style={styles.deleteButton} 
        onPress={() => confirmDelete(productId)}
      >
        <Animated.View
          style={[
            styles.deleteButtonContent,
            {
              transform: [{ translateX: trans }],
            },
          ]}
        >
          <MaterialCommunityIcons name="trash-can-outline" size={24} color="white" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </Animated.View>
      </RectButton>
    );
  };

  const renderProductItem = ({ item }) => (
    <Swipeable
      ref={(ref) => (swipeableRefs.current[item.id] = ref)}
      friction={2}
      rightThreshold={40}
      renderRightActions={(progress, dragX) => 
        renderRightActions(progress, dragX, item.id)
      }
      onSwipeableWillOpen={() => {
        // Close other swipeables when one opens
        Object.keys(swipeableRefs.current).forEach(key => {
          if (key !== item.id && swipeableRefs.current[key]) {
            swipeableRefs.current[key].close();
          }
        });
      }}
    >
      <Animated.View style={[styles.productCard, { opacity: fadeAnim }]}>
        <View style={styles.productImageContainer}>
          {item.images?.[0] ? (
            <Image 
              source={{ uri: item.images[0] }} 
              style={styles.productImage} 
              resizeMode="cover"
            />
          ) : (
            <View style={styles.productImagePlaceholder}>
              <MaterialCommunityIcons name="image" size={32} color="#9DCD5A" />
            </View>
          )}
        </View>
        
        <View style={styles.productDetails}>
          <View style={styles.productHeader}>
            <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
            <View style={styles.priceContainer}>
              {item.discountPrice ? (
                <>
                  <Text style={styles.discountedPrice}>{item.discountPrice}</Text>
                  <Text style={styles.originalPrice}>{item.formattedPrice}</Text>
                </>
              ) : (
                <Text style={styles.productPrice}>{item.formattedPrice}</Text>
              )}
              <Text style={styles.unitText}>{item.unitText}</Text>
            </View>
          </View>
          
          <View style={styles.metaContainer}>
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
            
            <Text style={styles.stockText}>{item.stock} {item.unit.toLowerCase()} available</Text>
          </View>
          
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              onPress={() => handleEditProduct(item)}
              style={styles.editButton}
            >
              <MaterialCommunityIcons name="pencil" size={18} color="#9DCD5A" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            
            {item.discountPrice && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{item.discount?.percentage}% OFF</Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    </Swipeable>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9DCD5A" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Products</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#9DCD5A']}
            tintColor="#9DCD5A"
          />
        }
      >
        {products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="sprout-outline" size={60} color="#9DCD5A" />
            <Text style={styles.emptyTitle}>No Products Yet</Text>
            <Text style={styles.emptySubtitle}>Add your first product to get started</Text>
            <TouchableOpacity 
              style={styles.addFirstProductButton}
              onPress={handleAddProduct}
            >
              <Text style={styles.addFirstProductButtonText}>Add Product</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </ScrollView>

      {/* Add Product Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleAddProduct}
      >
        <MaterialCommunityIcons name="plus" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    fontFamily: 'Poppins-SemiBold',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  addFirstProductButton: {
    backgroundColor: '#9DCD5A',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginTop: 20,
    shadowColor: '#9DCD5A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  addFirstProductButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ECF0F1',
  },
  productImageContainer: {
    marginRight: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  productImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECF0F1',
  },
  productDetails: {
    flex: 1,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    flex: 1,
    fontFamily: 'Poppins-SemiBold',
    marginRight: 12,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    fontFamily: 'Poppins-Bold',
  },
  discountedPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9DCD5A',
    fontFamily: 'Poppins-Bold',
  },
  originalPrice: {
    fontSize: 12,
    color: '#95A5A6',
    textDecorationLine: 'line-through',
    fontFamily: 'Poppins-Regular',
  },
  unitText: {
    fontSize: 12,
    color: '#95A5A6',
    fontFamily: 'Poppins-Regular',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
  },
  statusAvailable: {
    backgroundColor: 'rgba(157, 205, 90, 0.1)',
  },
  statusSoldOut: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
  },
  statusSeasonal: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  stockText: {
    fontSize: 12,
    color: '#7F8C8D',
    fontFamily: 'Poppins-Regular',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECF0F1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#2C3E50',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    marginLeft: 4,
  },
  discountBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#9DCD5A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  // Swipe to delete styles
  deleteButton: {
    width: 80,
    height: '92%',
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 12,
  },
  deleteButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    fontFamily: 'Poppins-SemiBold',
  },
});

export default ProductsScreen;