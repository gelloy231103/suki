import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Platform,
  Pressable,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const defaultImage = require('../assets/tomatoes.png');

const CartScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedItems, setSelectedItems] = useState({});

  const getImageSource = (image) => {
    try {
      if (!image) return defaultImage;
      if (typeof image === 'number') return image;
      if (typeof image === 'string' && image.startsWith('http')) return { uri: image };
      if (image.uri) return image;
      
      // Map product names to their respective images
      const productImages = {
        'Sweet Tomatoes': require('../assets/tomatoes.png'),
        'Biggest Eggplant': require('../assets/eggplant.png'),
        'Broccolicious': require('../assets/broccoli.png'),
        'Lettuce Baguio': require('../assets/lettuce.png'),
        'Fresh Carrots': require('../assets/carrots.png'),
        'White Onions': require('../assets/onions.png'),
        'Garlic': require('../assets/garlic.png'),
        'Potato': require('../assets/potato.png'),
        'Pumpkin': require('../assets/pumpkin.png'),
        'Lady Fingers': require('../assets/lady-fingers.png'),
        'Turnip': require('../assets/turnip.png'),
      };

      return productImages[image] || defaultImage;
    } catch (error) {
      console.log('Image loading error:', error);
      return defaultImage;
    }
  };

  useEffect(() => {
    if (route.params?.cartItems) {
      const newItems = route.params.cartItems;
      setCartItems(prevItems => {
        const updatedItems = [...prevItems];
        newItems.forEach(newItem => {
          const existingItemIndex = updatedItems.findIndex(
            item => item.productId === newItem.productId
          );
          if (existingItemIndex !== -1) {
            updatedItems[existingItemIndex].quantity += newItem.quantity;
          } else {
            // Ensure price is always a number
            const price = typeof newItem.price === 'string' ? parseFloat(newItem.price) : Number(newItem.price) || 0;
            updatedItems.push({
              ...newItem,
              price: price
            });
          }
        });
        return updatedItems;
      });
    }
  }, [route.params?.cartItems]);

  useEffect(() => {
    const total = cartItems.reduce((sum, item) => {
      if (selectedItems[item.productId]) {
        const price = typeof item.price === 'string' ? parseFloat(item.price) : Number(item.price) || 0;
        return sum + (price * item.quantity);
      }
      return sum;
    }, 0);
    setTotalAmount(total);
  }, [cartItems, selectedItems]);

  const formatPrice = (price) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price) || 0;
    return `₱${numPrice.toFixed(2)}`;
  };

  const handleQuantityChange = (productId, change) => {
    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.productId === productId) {
          const newQuantity = item.quantity + change;
          if (newQuantity < 1) {
            Alert.alert(
              'Remove Item',
              'Do you want to remove this item from cart?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Remove',
                  onPress: () => {
                    setCartItems(prev =>
                      prev.filter(i => i.productId !== productId)
                    );
                    setSelectedItems(prev => {
                      const updated = { ...prev };
                      delete updated[productId];
                      return updated;
                    });
                  },
                },
              ]
            );
            return item;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const toggleItemSelection = (productId) => {
    setSelectedItems(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const handleCheckout = () => {
    if (Object.keys(selectedItems).length === 0) {
      Alert.alert('Select Items', 'Please select items to checkout');
      return;
    }
    const selectedCartItems = cartItems.filter(item => selectedItems[item.productId]);
    
    // First navigate to checkout
    navigation.navigate('CheckOut', { 
      cartItems: selectedCartItems,
      onCheckoutComplete: () => {
        // After checkout is complete, reset to main tab
        navigation.reset({
          index: 0,
          routes: [
            { 
              name: 'MainTab',
              state: {
                routes: [
                  { name: 'Home' }
                ]
              }
            }
          ],
        });
      }
    });
  };

  const groupedItems = cartItems.reduce((groups, item) => {
    const farmId = item.farmId || 'unknown';
    if (!groups[farmId]) {
      groups[farmId] = {
        farmName: item.farmName || 'Unknown Farm',
        items: []
      };
    }
    groups[farmId].items.push(item);
    return groups;
  }, {});

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SHOPPING CART</Text>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.cartList}>
        {Object.entries(groupedItems).map(([farmId, { farmName, items }]) => (
          <View key={farmId} style={styles.farmGroup}>
            <View style={styles.farmHeader}>
              <Pressable style={styles.checkbox}>
                <Icon name="check" size={18} color="#FFF" />
              </Pressable>
              <Icon name="store" size={20} color="#9DCD5A" style={styles.farmIcon} />
              <Text style={styles.farmName}>{farmName}</Text>
              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>

            {items.map((item) => (
              <View key={item.productId} style={styles.cartItem}>
                <Pressable 
                  style={[
                    styles.checkbox,
                    selectedItems[item.productId] && styles.checkboxSelected
                  ]}
                  onPress={() => toggleItemSelection(item.productId)}
                >
                  {selectedItems[item.productId] && (
                    <Icon name="check" size={18} color="#FFF" />
                  )}
                </Pressable>
                <Image
                  source={getImageSource(item.image)}
                  style={styles.productImage}
                  resizeMode="cover"
                  defaultSource={defaultImage}
                />
                <View style={styles.itemDetails}>
                  <Text style={styles.productName}>{item.productName}</Text>
                  <Text style={styles.variantText}>
                    {item.quantity} {item.unit || 'piece'}
                  </Text>
                  <Text style={styles.priceText}>
                    {formatPrice(item.price)} × {item.quantity} = {formatPrice(item.price * item.quantity)}
                  </Text>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => handleQuantityChange(item.productId, -1)}
                    >
                      <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantity}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => handleQuantityChange(item.productId, 1)}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottomSection}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>{formatPrice(totalAmount)}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.checkoutButton,
            Object.keys(selectedItems).length === 0 && styles.disabledButton,
          ]}
          onPress={handleCheckout}
          disabled={Object.keys(selectedItems).length === 0}
        >
          <Text style={styles.checkoutButtonText}>
            Check Out ({Object.keys(selectedItems).length})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#9DCD5A',
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFF',
  },
  backButton: {
    padding: 8,
  },
  editButton: {
    padding: 8,
  },
  editText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  cartList: {
    flex: 1,
  },
  farmGroup: {
    backgroundColor: '#FFF',
    marginBottom: 8,
  },
  farmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  farmIcon: {
    marginRight: 8,
  },
  farmName: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#333',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#9DCD5A',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#9DCD5A',
  },
  cartItem: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  variantText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginBottom: 8,
  },
  priceText: {
    fontSize: 16,
    color: '#9DCD5A',
    fontFamily: 'Poppins-SemiBold',
    marginVertical: 4,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 24,
    height: 24,
    backgroundColor: '#9DCD5A',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  quantity: {
    marginHorizontal: 12,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  bottomSection: {
    backgroundColor: '#FFF',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },
  totalAmount: {
    fontSize: 18,
    color: '#9DCD5A',
    fontFamily: 'Poppins-Bold',
  },
  checkoutButton: {
    backgroundColor: '#9DCD5A',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  disabledButton: {
    backgroundColor: '#CCC',
  },
});

export default CartScreen;