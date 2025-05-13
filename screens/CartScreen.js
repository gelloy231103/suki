import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  TextInput,
  Animated,
  PanResponder,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Dimensions
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { doc, getDoc, setDoc, collection, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

const CartScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const swipeAnimations = useRef({});

  // Load cart items from Firestore
  useEffect(() => {
    const loadCartItems = async () => {
      try {
        setLoading(true);
        const userId = auth.currentUser?.uid;
        
        if (!userId) {
          setLoading(false);
          return;
        }

        // Check for items passed via navigation (from product screen)
        if (route.params?.cartItems) {
          await addItemToCart(route.params.cartItems[0]);
          return;
        }

        // Load from Firestore
        const userCartRef = doc(db, 'userCarts', userId);
        const cartSnap = await getDoc(userCartRef);

        if (cartSnap.exists()) {
          const cartData = cartSnap.data();
          organizeCartItems(cartData.items || []);
        } else {
          // Initialize empty cart if doesn't exist
          await setDoc(userCartRef, { items: [] });
          setShops([]);
        }
      } catch (error) {
        console.error('Error loading cart items:', error);
        Alert.alert('Error', 'Failed to load cart items');
      } finally {
        setLoading(false);
      }
    };

    loadCartItems();
  }, [route.params?.cartItems]);

  // Save cart to Firestore whenever it changes
  useEffect(() => {
    const saveCart = async () => {
      if (loading) return; // Don't save during initial load
      
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const userCartRef = doc(db, 'userCarts', userId);
        
        // Convert shops structure back to flat items array
        const items = shops.flatMap(shop => 
          shop.products.map(product => ({
            farmId: shop.id,
            farmName: shop.name,
            productId: product.id,
            productName: product.name,
            price: product.price,
            quantity: product.quantity,
            image: product.image,
            prodId: product.prodId
          }))
        );

        await updateDoc(userCartRef, { items });
      } catch (error) {
        console.error('Error saving cart:', error);
      }
    };

    saveCart();
  }, [shops]);

  // Organize cart items by shop
  const organizeCartItems = (items) => {
    const shopsMap = {};
    
    items.forEach(item => {
      if (!shopsMap[item.farmId]) {
        shopsMap[item.farmId] = {
          id: item.farmId,
          name: item.farmName,
          selected: false,
          isEditing: false,
          products: []
        };
      }
      
      shopsMap[item.farmId].products.push({
        id: item.productId,
        name: item.productName,
        prodId: item.prodId,
        price: item.price,
        quantity: item.quantity,
        selected: false,
        image: item.image
      });
    });
    
    setShops(Object.values(shopsMap));
  };

  // Add new item to cart
  const addItemToCart = async (newItem) => {
    setShops(prevShops => {
      const existingShopIndex = prevShops.findIndex(shop => shop.id === newItem.farmId);
      
      if (existingShopIndex >= 0) {
        const existingProductIndex = prevShops[existingShopIndex].products.findIndex(
          prod => prod.id === newItem.productId
        );
        
        if (existingProductIndex >= 0) {
          // Update quantity if product exists
          const updatedShops = [...prevShops];
          updatedShops[existingShopIndex].products[existingProductIndex].quantity += newItem.quantity;
          return updatedShops;
        } else {
          // Add new product to existing shop
          const updatedShops = [...prevShops];
          updatedShops[existingShopIndex].products.push({
            id: newItem.productId,
            name: newItem.productName,
            prodId: newItem.prodId,
            price: newItem.price,
            quantity: newItem.quantity,
            selected: false,
            image: newItem.image
          });
          return updatedShops;
        }
      } else {
        // Add new shop with product
        return [
          ...prevShops,
          {
            id: newItem.farmId,
            name: newItem.farmName,
            selected: false,
            isEditing: false,
            products: [{
              id: newItem.productId,
              name: newItem.productName,
              prodId: newItem.prodId,
              price: newItem.price,
              quantity: newItem.quantity,
              selected: false,
              image: newItem.image
            }]
          }
        ];
      }
    });
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    
    // Reset swipe animations when exiting edit mode
    if (isEditMode) {
      Object.keys(swipeAnimations.current).forEach(key => {
        Animated.spring(swipeAnimations.current[key], {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      });
    }
  };

  // Toggle select all items
  const toggleSelectAll = () => {
    const allProductsCount = getTotalProducts();
    
    if (selectedItems.length === allProductsCount) {
      // Deselect all
      setSelectedItems([]);
      setShops(prevShops => 
        prevShops.map(shop => ({
          ...shop,
          selected: false,
          products: shop.products.map(product => ({
            ...product,
            selected: false
          }))
        }))
      );
    } else {
      // Select all
      const allSelectedItems = [];
      const updatedShops = shops.map(shop => {
        const updatedProducts = shop.products.map(product => {
          allSelectedItems.push({
            shopId: shop.id,
            productId: product.id
          });
          return {
            ...product,
            selected: true
          };
        });
        return {
          ...shop,
          selected: true,
          products: updatedProducts
        };
      });
      
      setSelectedItems(allSelectedItems);
      setShops(updatedShops);
    }
  };

  // Get total number of products
  const getTotalProducts = () => {
    return shops.reduce((total, shop) => total + shop.products.length, 0);
  };

  // Calculate total price of selected items
  const calculateTotal = () => {
    return shops.reduce((total, shop) => {
      return total + shop.products.reduce((shopTotal, product) => {
        if (selectedItems.some(item => 
          item.shopId === shop.id && item.productId === product.id
        )) {
          return shopTotal + (product.price * product.quantity);
        }
        return shopTotal;
      }, 0);
    }, 0);
  };

  // Toggle shop selection
  const toggleShopSelection = (shopId) => {
    setShops(prevShops => 
      prevShops.map(shop => {
        if (shop.id === shopId) {
          const isSelecting = !shop.selected;
          const updatedProducts = shop.products.map(product => ({
            ...product,
            selected: isSelecting
          }));
          
          // Update selectedItems array
          if (isSelecting) {
            setSelectedItems(prev => [
              ...prev,
              ...updatedProducts.map(product => ({
                shopId,
                productId: product.id
              }))
            ]);
          } else {
            setSelectedItems(prev => 
              prev.filter(item => item.shopId !== shopId)
            );
          }
          
          return {
            ...shop,
            selected: isSelecting,
            products: updatedProducts
          };
        }
        return shop;
      })
    );
  };

  // Toggle product selection
  const toggleProductSelection = (shopId, productId) => {
    setShops(prevShops => 
      prevShops.map(shop => {
        if (shop.id === shopId) {
          const updatedProducts = shop.products.map(product => {
            if (product.id === productId) {
              const isSelected = !product.selected;
              
              // Update selectedItems array
              if (isSelected) {
                setSelectedItems(prev => [
                  ...prev,
                  { shopId, productId }
                ]);
              } else {
                setSelectedItems(prev => 
                  prev.filter(item => 
                    !(item.shopId === shopId && item.productId === productId)
                ));
              }
              
              return { ...product, selected: isSelected };
            }
            return product;
          });
          
          // Update shop selection status
          const allProductsSelected = updatedProducts.every(p => p.selected);
          return { 
            ...shop, 
            products: updatedProducts,
            selected: allProductsSelected
          };
        }
        return shop;
      })
    );
  };

  // Toggle shop edit mode
  const toggleShopEditMode = (shopId) => {
    setShops(prevShops => 
      prevShops.map(shop => 
        shop.id === shopId 
          ? { ...shop, isEditing: !shop.isEditing } 
          : shop
      )
    );
  };

  // Update product quantity
  const updateQuantity = (shopId, productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setShops(prevShops => 
      prevShops.map(shop => {
        if (shop.id === shopId) {
          const updatedProducts = shop.products.map(product => 
            product.id === productId 
              ? { ...product, quantity: newQuantity } 
              : product
          );
          return { ...shop, products: updatedProducts };
        }
        return shop;
      })
    );
  };

  // Delete a product
  const deleteProduct = (shopId, productId) => {
    setShops(prevShops => {
      const updatedShops = prevShops.map(shop => {
        if (shop.id === shopId) {
          const updatedProducts = shop.products.filter(
            product => product.id !== productId
          );
          
          // Remove shop if no products left
          if (updatedProducts.length === 0) {
            return null;
          }
          
          return { ...shop, products: updatedProducts };
        }
        return shop;
      }).filter(Boolean); // Remove null shops
      
      return updatedShops;
    });
    
    // Remove from selected items if it was selected
    setSelectedItems(prev => 
      prev.filter(item => 
        !(item.shopId === shopId && item.productId === productId)
      )
    );
  };

  // Delete selected items
  const deleteSelectedItems = () => {
    setShops(prevShops => {
      const updatedShops = prevShops.map(shop => {
        const updatedProducts = shop.products.filter(product => 
          !selectedItems.some(item => 
            item.shopId === shop.id && item.productId === product.id
          )
        );
        
        // Remove shop if no products left
        if (updatedProducts.length === 0) {
          return null;
        }
        
        return { ...shop, products: updatedProducts };
      }).filter(Boolean); // Remove null shops
      
      return updatedShops;
    });
    
    // Clear selected items
    setSelectedItems([]);
  };

  // Create pan responder for swipe to delete
  const createPanResponder = (shopId, productId) => {
    const pan = swipeAnimations.current[`${shopId}-${productId}`] || new Animated.Value(0);
    swipeAnimations.current[`${shopId}-${productId}`] = pan;

    return PanResponder.create({
      onStartShouldSetPanResponder: () => isEditMode,
      onMoveShouldSetPanResponder: () => isEditMode,
      onPanResponderMove: Animated.event(
        [null, { dx: pan }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (e, gestureState) => {
        if (gestureState.dx < -50) {
          Animated.spring(pan, {
            toValue: -100,
            useNativeDriver: false,
          }).start();
        } else {
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
    });
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const userCartRef = doc(db, 'userCarts', userId);
      const cartSnap = await getDoc(userCartRef);

      if (cartSnap.exists()) {
        const cartData = cartSnap.data();
        organizeCartItems(cartData.items || []);
      }
    } catch (error) {
      console.error('Error refreshing cart:', error);
      Alert.alert('Error', 'Failed to refresh cart');
    } finally {
      setRefreshing(false);
    }
  };

  // Render shop card
  const renderShopCard = ({ item: shop }) => (
    <View style={styles.shopCard}>
      {/* Shop Header */}
      <View style={styles.shopHeader}>
        <TouchableOpacity 
          onPress={() => toggleShopSelection(shop.id)}
          style={styles.checkbox}
        >
          <Icon 
            name={shop.selected ? "check-box" : "check-box-outline-blank"} 
            size={24} 
            color="#fff" 
          />
        </TouchableOpacity>
        <Icon name="home" size={20} color="#fff" style={styles.barnIcon} />
        <Text style={styles.shopName}>{shop.name}</Text>
        <TouchableOpacity 
          onPress={() => toggleShopEditMode(shop.id)}
          style={styles.editButton}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
      
      {/* Product Cards */}
      {shop.products.map(product => {
        const panResponder = createPanResponder(shop.id, product.id);
        const pan = swipeAnimations.current[`${shop.id}-${product.id}`] || new Animated.Value(0);

        return (
          <View key={`${shop.id}-${product.id}`} style={styles.productContainer}>
            <Animated.View
              style={[
                styles.productCard,
                {
                  transform: [{ translateX: pan }],
                },
              ]}
              {...panResponder.panHandlers}
            >
              <TouchableOpacity 
                onPress={() => toggleProductSelection(shop.id, product.id)}
                style={styles.productCheckbox}
              >
                <Icon 
                  name={product.selected ? "check-box" : "check-box-outline-blank"} 
                  size={24} 
                  color={product.selected ? "#9DCD5A" : "#BDBDBD"} 
                />
              </TouchableOpacity>
              
              <View style={styles.productImageContainer}>
                {typeof product.image === 'string' ? (
                  <Image source={{ uri: product.image }} style={styles.productImage} />
                ) : (
                  <Image source={product.image} style={styles.productImage} />
                )}
              </View>
              
              <View style={styles.productDetails}>
                <View style={styles.productInfoRow}>
                  <View>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productId}>Prod ID: {product.prodId}</Text>
                    <Text style={styles.productPrice}>Price: ₱ {product.price}</Text>
                  </View>
                  
                  <View style={styles.quantityContainer}>
                    <View style={styles.quantityControls}>
                      <TouchableOpacity 
                        onPress={() => updateQuantity(shop.id, product.id, product.quantity - 1)}
                        style={styles.quantityButton}
                      >
                        <Text style={styles.quantityButtonText}>-</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={styles.quantityInput}
                        value={product.quantity.toString()}
                        keyboardType="numeric"
                        onChangeText={(text) => {
                          const num = parseInt(text) || 0;
                          updateQuantity(shop.id, product.id, num);
                        }}
                      />
                      <TouchableOpacity 
                        onPress={() => updateQuantity(shop.id, product.id, product.quantity + 1)}
                        style={styles.quantityButton}
                      >
                        <Text style={styles.quantityButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </Animated.View>
            
            {(isEditMode || shop.isEditing) && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  Alert.alert(
                    'Delete Product',
                    'Are you sure you want to remove this product from your cart?',
                    [
                      {
                        text: 'Cancel',
                        style: 'cancel',
                      },
                      {
                        text: 'Delete',
                        onPress: () => deleteProduct(shop.id, product.id),
                        style: 'destructive',
                      },
                    ]
                  );
                }}
              >
                <Icon name="delete" size={24} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        );
      })}
      
      {/* Shop Footer */}
      <View style={styles.shopFooter}>
        <Text style={styles.shopFooterText}>Subtotal: ₱{
          shop.products.reduce((sum, product) => sum + (product.price * product.quantity), 0)
        }</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9DCD5A" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>SHOPPING CART</Text>
          <TouchableOpacity onPress={toggleEditMode}>
            <Text style={styles.editButtonText}>
              {isEditMode ? 'Done' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Body */}
        {shops.length === 0 ? (
          <View style={styles.emptyCartContainer}>
            <Icon name="remove-shopping-cart" size={48} color="#9DCD5A" />
            <Text style={styles.emptyCartText}>Your cart is empty</Text>
            <TouchableOpacity 
              style={styles.continueShoppingButton}
              onPress={() => navigation.navigate('Dashboard')}
            >
              <Text style={styles.continueShoppingText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={shops}
            renderItem={renderShopCard}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#9DCD5A']}
                tintColor="#9DCD5A"
              />
            }
            ListFooterComponent={() => (
              <Text style={styles.noMoreItems}>No more items to show</Text>
            )}
          />
        )}

        {/* Footer - Only show if there are items */}
        {shops.length > 0 && (
          <View style={styles.footer}>
            <View style={styles.footerRow}>
              <TouchableOpacity 
                onPress={toggleSelectAll}
                style={styles.footerCheckbox}
              >
                <Icon 
                  name={selectedItems.length === getTotalProducts() ? 
                    "check-box" : "check-box-outline-blank"} 
                  size={24} 
                  color={selectedItems.length === getTotalProducts() ? 
                    "#9DCD5A" : "#BDBDBD"} 
                />
                <Text style={styles.footerCheckboxText}>All</Text>
              </TouchableOpacity>
              
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>₱{calculateTotal()}</Text>
              </View>
              
              <TouchableOpacity 
                onPress={isEditMode ? deleteSelectedItems : () => navigation.navigate('CheckOut', { selectedItems })}
                style={[
                  styles.checkoutButton,
                  isEditMode && styles.deleteButtonStyle
                ]}
              >
                <Text style={[
                  styles.checkoutButtonText,
                  isEditMode && styles.deleteButtonText
                ]}>
                  {isEditMode ? 'Delete' : 'Check Out'} ({selectedItems.length})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 36,
    padding: 16,
    backgroundColor: '#9DCD5A',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 80,
    paddingTop: 10,
  },
  shopCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  shopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#9DCD5A',
  },
  checkbox: {
    marginRight: 8,
  },
  barnIcon: {
    marginRight: 8,
  },
  shopName: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  editButton: {
    paddingHorizontal: 10,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  productContainer: {
    flexDirection: 'row',
    overflow: 'hidden',
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
    width: Dimensions.get('window').width - 20,
  },
  deleteButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productCheckbox: {
    marginRight: 10,
  },
  productImageContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginRight: 15,
  },
  productImage: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  productDetails: {
    flex: 1,
  },
  productInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  productId: {
    fontSize: 12,
    color: '#777',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#9DCD5A',
    fontWeight: 'bold',
  },
  quantityContainer: {
    alignItems: 'flex-end',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#9DCD5A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  quantityButton: {
    backgroundColor: '#9DCD5A',
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  quantityInput: {
    width: 35,
    height: 35,
    textAlign: 'center',
    backgroundColor: '#fff',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#9DCD5A',
  },
  shopFooter: {
    backgroundColor: '#9DCD5A',
    padding: 10,
  },
  shopFooterText: {
    color: '#fff',
    textAlign: 'right',
    fontWeight: 'bold',
  },
  noMoreItems: {
    textAlign: 'center',
    color: '#BDBDBD',
    marginVertical: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerCheckboxText: {
    marginLeft: 5,
    fontSize: 16,
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    marginRight: 5,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9DCD5A',
  },
  checkoutButton: {
    backgroundColor: '#9DCD5A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  checkoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  deleteButtonStyle: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  deleteButtonText: {
    color: '#FF4444',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCartText: {
    fontSize: 18,
    color: '#333',
    marginTop: 16,
    fontWeight: '600',
  },
  continueShoppingButton: {
    marginTop: 20,
    backgroundColor: '#9DCD5A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  continueShoppingText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CartScreen;