import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  FlatList,
  Dimensions,
  TextInput,
  Animated,
  PanResponder,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const CartScreen = () => {
  const navigation = useNavigation();
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const swipeAnimations = useRef({});

  // Sample data for shops and products
  const [shops, setShops] = useState([
    {
      id: '1',
      name: 'Tadhana FarmVille',
      selected: false,
      products: [
        {
          id: '1',
          name: 'Sweet Tomatoes',
          prodId: '123456',
          variant: '1 kg',
          price: 80,
          quantity: 2,
          selected: false,
          image: require('../assets/tomatoes.png'),
        },
        {
          id: '2',
          name: 'Broccolicious',
          prodId: '123456',
          variant: '1 sack',
          price: 120,
          quantity: 1,
          selected: false,
          image: require('../assets/broccoli.png'),
        },
      ],
    },
    {
      id: '2',
      name: 'Another Farm',
      selected: false,
      products: [
        {
          id: '3',
          name: 'Carrots',
          prodId: '789012',
          variant: '1 kg',
          price: 60,
          quantity: 3,
          selected: false,
          image: require('../assets/carrots.png'),
        },
        {
          id: '4',
          name: 'Potatoes',
          prodId: '789012',
          variant: '1 sack',
          price: 90,
          quantity: 2,
          selected: false,
          image: require('../assets/carrots.png'),
        },
      ],
    },
  ]);

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

  const toggleEditMode = () => {
    const newEditMode = !isEditMode;
    setIsEditMode(newEditMode);
    
    // Slide all cards when edit mode is toggled
    Object.keys(swipeAnimations.current).forEach(key => {
      Animated.spring(swipeAnimations.current[key], {
        toValue: newEditMode ? -100 : 0,
        useNativeDriver: false,
      }).start();
    });

    // Clear selections when exiting edit mode
    if (!newEditMode) {
      setSelectedItems([]);
      setShops(
        shops.map(shop => ({
          ...shop,
          selected: false,
          products: shop.products.map(product => ({
            ...product,
            selected: false,
          })),
        }))
      );
    }
  };

  const toggleShopEditMode = (shopId) => {
    setShops(shops.map(shop => {
      if (shop.id === shopId) {
        // Toggle edit mode for this shop's products
        shop.products.forEach(product => {
          const pan = swipeAnimations.current[`${shop.id}-${product.id}`];
          if (pan) {
            Animated.spring(pan, {
              toValue: shop.isEditing ? 0 : -100,
              useNativeDriver: false,
            }).start();
          }
        });
        
        return {
          ...shop,
          isEditing: !shop.isEditing
        };
      }
      return shop;
    }));
  };

  const toggleSelectAll = () => {
    const allSelected = selectedItems.length === getTotalProducts();
    if (allSelected) {
      setSelectedItems([]);
      setShops(
        shops.map(shop => ({
          ...shop,
          selected: false,
          products: shop.products.map(product => ({
            ...product,
            selected: false,
          })),
        }))
      );
    } else {
      const allProductIds = shops.flatMap(shop =>
        shop.products.map(product => `${shop.id}-${product.id}`)
      );
      setSelectedItems(allProductIds);
      setShops(
        shops.map(shop => ({
          ...shop,
          selected: true,
          products: shop.products.map(product => ({
            ...product,
            selected: true,
          })),
        }))
      );
    }
  };

  const toggleShopSelection = (shopId) => {
    setShops(shops.map(shop => {
      if (shop.id === shopId) {
        const newSelected = !shop.selected;
        const updatedProducts = shop.products.map(product => ({
          ...product,
          selected: newSelected,
        }));
        
        const productKeys = updatedProducts
          .filter(product => product.selected)
          .map(product => `${shop.id}-${product.id}`);
        
        if (newSelected) {
          setSelectedItems([...selectedItems, ...productKeys]);
        } else {
          setSelectedItems(selectedItems.filter(
            item => !productKeys.includes(item)
          ));
        }
        
        return {
          ...shop,
          selected: newSelected,
          products: updatedProducts,
        };
      }
      return shop;
    }));
  };

  const toggleProductSelection = (shopId, productId) => {
    setShops(shops.map(shop => {
      if (shop.id === shopId) {
        const updatedProducts = shop.products.map(product => {
          if (product.id === productId) {
            const newSelected = !product.selected;
            
            const productKey = `${shop.id}-${product.id}`;
            if (newSelected) {
              setSelectedItems([...selectedItems, productKey]);
            } else {
              setSelectedItems(selectedItems.filter(item => item !== productKey));
            }
            
            return {
              ...product,
              selected: newSelected,
            };
          }
          return product;
        });
        
        const allProductsSelected = updatedProducts.every(p => p.selected);
        const someProductsSelected = updatedProducts.some(p => p.selected);
        
        return {
          ...shop,
          selected: allProductsSelected,
          products: updatedProducts,
        };
      }
      return shop;
    }));
  };

  const updateQuantity = (shopId, productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setShops(shops.map(shop => {
      if (shop.id === shopId) {
        return {
          ...shop,
          products: shop.products.map(product => 
            product.id === productId ? { ...product, quantity: newQuantity } : product
          ),
        };
      }
      return shop;
    }));
  };

  const deleteProduct = (shopId, productId) => {
    setShops(shops.map(shop => {
      if (shop.id === shopId) {
        return {
          ...shop,
          products: shop.products.filter(product => product.id !== productId),
        };
      }
      return shop;
    }));
    
    // Remove from selected items if it was selected
    setSelectedItems(selectedItems.filter(item => item !== `${shopId}-${productId}`));
  };

  const deleteSelectedItems = () => {
  setShops(
    shops
      .map(shop => ({
        ...shop,
        products: shop.products.filter(product =>
          !selectedItems.includes(`${shop.id}-${product.id}`)
        ),
      }))
      .filter(shop => shop.products.length > 0) // <- this closes properly now
  );
  setSelectedItems([]);
};


  const getTotalProducts = () => {
    return shops.reduce((total, shop) => total + shop.products.length, 0);
  };

  const calculateTotal = () => {
    return selectedItems.reduce((total, itemKey) => {
      const [shopId, productId] = itemKey.split('-');
      const shop = shops.find(s => s.id === shopId);
      if (shop) {
        const product = shop.products.find(p => p.id === productId);
        if (product) {
          return total + (product.price * product.quantity);
        }
      }
      return total;
    }, 0);
  };

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
                <Image source={product.image} style={styles.productImage} />
              </View>
              
              <View style={styles.productDetails}>
                <View style={styles.productInfoRow}>
                  <View>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productId}>Prod ID: {product.prodId}</Text>
                    <Text style={styles.productVariant}>Variant: {product.variant}</Text>
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
        <FlatList
          data={shops}
          renderItem={renderShopCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={() => (
            <Text style={styles.noMoreItems}>No more items to show</Text>
          )}
        />

        {/* Footer */}
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
              onPress={isEditMode ? deleteSelectedItems : () => {}}
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
    paddingTop:36,
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
  productVariant: {
    fontSize: 12,
    color: '#777',
    marginBottom: 4,
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
    top: 20,
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
});

export default CartScreen;