import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const CheckOutScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const cartItems = route.params?.cartItems || [];
  const onCheckoutComplete = route.params?.onCheckoutComplete;

  const handleCompleteCheckout = () => {
    // Handle checkout completion logic here
    
    // Call the completion callback if provided
    if (onCheckoutComplete) {
      onCheckoutComplete();
    } else {
      // Fallback navigation if no callback provided
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
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout</Text>
      {cartItems.map((item, index) => (
        <View key={index} style={styles.itemContainer}>
          <Text style={styles.itemName}>{item.productName}</Text>
          <Text style={styles.itemPrice}>₱{parseFloat(item.price).toFixed(2)} x {item.quantity}</Text>
        </View>
      ))}
      <TouchableOpacity 
        style={styles.checkoutButton}
        onPress={handleCompleteCheckout}
      >
        <Text style={styles.checkoutButtonText}>Complete Checkout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    marginBottom: 20,
    color: '#333',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemName: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },
  itemPrice: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#9DCD5A',
  },
  checkoutButton: {
    backgroundColor: '#9DCD5A',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
});

export default CheckOutScreen;