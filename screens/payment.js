import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { MaterialCommunityIcons, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { doc, collection, query, where, getDocs, getDoc, writeBatch, increment } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { AuthContext } from '../context/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

const Payment = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userData } = useContext(AuthContext);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);

  // Order data passed from FocusedProductScreen
  const { order } = route.params || {};
  const subtotal = order?.subtotal || 0;
  const discount = order?.product.discount?.percentage ? 
    subtotal * (order.product.discount.percentage / 100) : 0;
  const total = subtotal - discount;

  // Fetch payment methods and wallet balance
  const fetchPaymentData = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      // Fetch payment methods
      const methodsQuery = query(
        collection(db, 'users', userId, 'paymentMethods'),
      );
      const methodsSnapshot = await getDocs(methodsQuery);
      const methods = [];
      methodsSnapshot.forEach(doc => {
        methods.push({ 
          id: doc.id, 
          ...doc.data(),
          lastFour: doc.data().lastFour || doc.data().cardNumber?.slice(-4) || '••••',
          type: doc.data().type || 'card',
          cardHolder: doc.data().cardHolder || `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim()
        });
      });

      // Sort with default card first
      const sortedMethods = methods.sort((a, b) => 
        (a.isDefault === b.isDefault) ? 0 : a.isDefault ? -1 : 1
      );
      
      setPaymentMethods(sortedMethods);

      // Fetch wallet balance
      const walletRef = doc(db, 'users', userId, 'wallet', 'balance');
      const walletSnap = await getDoc(walletRef);
      if (walletSnap.exists()) {
        setWalletBalance(walletSnap.data().currentBalance || 0);
      }

    } catch (error) {
      console.error("Error fetching payment data:", error);
      Alert.alert("Error", "Failed to load payment methods. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentData();
  }, []);

  // Handle payment submission
  const handlePayment = async () => {
  if (!selectedMethod) {
    Alert.alert("Error", "Please select a payment method");
    return;
  }

  setIsPaying(true);
  try {
    const userId = auth.currentUser?.uid;
    const orderId = Date.now().toString();

    // Prepare the order data with fallback values
    const orderData = {
      discount: discount || 0,
      farmId: order?.product?.farmId || null,
      orderId: orderId,
      price: order?.product?.price || 0,
      productId: order?.product?.id || null,
      quantity: order?.quantity || 1,
      status: 'processing',
      totalPrice: total || 0,
      userId: userId,
      createdAt: new Date(),
      paymentMethod: selectedMethod.type === 'wallet' ? 'Suki Cash' : selectedMethod.name,
      paymentStatus: 'paid',
      productName: order?.product?.name || 'Unknown Product',
      productImage: order?.product?.imageUrl || null, // Provide fallback for image
      // Add any other required fields with proper fallbacks
    };

    // Clean the data by removing undefined fields
    const cleanData = (obj) => {
      return Object.fromEntries(
        Object.entries(obj)
          .filter(([_, v]) => v !== undefined)
          .map(([k, v]) => [k, v === null ? null : v])
      );
    };

    const sanitizedOrderData = cleanData(orderData);

    // Create a batch for atomic operations
    const batch = writeBatch(db);

    // 1. Create the order document in the main orders collection
    const mainOrderRef = doc(db, 'orders', orderId);
    batch.set(mainOrderRef, sanitizedOrderData);

    // 2. Create the order in the user's subcollection
    const userOrderRef = doc(db, 'users', userId, 'orders', orderId);
    batch.set(userOrderRef, {
      ...sanitizedOrderData,
      // Include any additional user-specific fields
    });

    // 3. Handle wallet payment if selected
    if (selectedMethod.type === 'wallet') {
      if (walletBalance < total) {
        throw new Error("Insufficient wallet balance");
      }
      
      const walletRef = doc(db, 'users', userId, 'wallet', 'balance');
      batch.update(walletRef, {
        currentBalance: walletBalance - total,
        updatedAt: new Date()
      });

      const transactionRef = doc(collection(db, 'users', userId, 'wallet', 'transactions'));
      batch.set(transactionRef, {
        amount: total,
        type: 'debit',
        description: `Payment for order #${orderId}`,
        createdAt: new Date(),
        orderId: orderId,
        newBalance: walletBalance - total
      });
    }

    // 4. Update product stock if needed
    if (order?.product?.stock !== undefined) {
      const productRef = doc(db, 'products', order.product.id);
      batch.update(productRef, {
        stock: order.product.stock - order.quantity
      });
    }

    // Commit all operations
    await batch.commit();

    navigation.replace('OrderConfirmation', { 
      orderId,
      paymentMethod: selectedMethod.type === 'wallet' ? 'Suki Cash' : selectedMethod.name,
      totalAmount: total
    });

  } catch (error) {
    console.error("Payment error:", error);
    Alert.alert(
      "Payment Failed", 
      error.message || "There was an error processing your payment. Please try again."
    );
  } finally {
    setIsPaying(false);
  }
};

  // Get card image based on type
  const getCardImage = (type) => {
    switch(type?.toLowerCase()) {
      case 'visa':
        return require('../assets/images/cardsImage/visa.png');
      case 'mastercard':
        return require('../assets/images/cardsImage/mastercard.png');
      case 'amex':
        return require('../assets/images/cardsImage/amex.png');
      case 'discover':
        return require('../assets/images/cardsImage/discover.png');
      case 'gcash':
        return require('../assets/images/cardsImage/gcash.png');
      case 'paypal':
        return require('../assets/images/cardsImage/paypal.png');
      default:
        return require('../assets/images/cardsImage/unknown.jpg');
    }
  };

  // Render card item
  const renderCardItem = (card) => {
    const cardBackground = selectedMethod?.id === card.id ? '#9DCD5A' : '#FFFFFF';
    const textColor = selectedMethod?.id === card.id ? '#FFFFFF' : '#333333';

    return (
      <TouchableOpacity
        style={[styles.cardContainer, { backgroundColor: cardBackground }]}
        onPress={() => setSelectedMethod({
          id: card.id,
          type: 'card',
          name: `${card.cardType} •••• ${card.lastFour}`,
          isDefault: card.isDefault
        })}
      >
        <View style={styles.cardContent}>
          <Image 
            source={getCardImage(card.cardType)} 
            style={[styles.cardLogo, { tintColor: selectedMethod?.id === card.id ? '#FFFFFF' : null }]} 
            resizeMode="contain"
          />
          
          <View style={styles.cardDetails}>
            <Text style={[styles.cardType, { color: textColor }]}>
              {card.cardType?.toUpperCase() || 'CARD'}
            </Text>
            <Text style={[styles.cardNumber, { color: textColor }]}>
              •••• •••• •••• {card.lastFour}
            </Text>
          </View>
          
          {card.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>DEFAULT</Text>
            </View>
          )}
          
          {selectedMethod?.id === card.id && (
            <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Render payment method options
  const renderPaymentMethods = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9DCD5A" />
        </View>
      );
    }

    return (
      <>
        {/* Suki Cash (Wallet) Option */}
        <TouchableOpacity
          style={[
            styles.paymentMethod,
            selectedMethod?.type === 'wallet' && styles.selectedMethod
          ]}
          onPress={() => setSelectedMethod({
            type: 'wallet',
            name: 'Suki Cash',
            balance: walletBalance
          })}
        >
          <View style={styles.methodLeft}>
            <MaterialCommunityIcons 
              name="wallet" 
              size={24} 
              color="#9DCD5A" 
              style={styles.walletIcon}
            />
            <View>
              <Text style={styles.methodName}>Suki Cash</Text>
              <Text style={styles.methodBalance}>
                Balance: ₱{walletBalance.toFixed(2)}
              </Text>
            </View>
          </View>
          {selectedMethod?.type === 'wallet' && (
            <Ionicons name="checkmark-circle" size={24} color="#9DCD5A" />
          )}
        </TouchableOpacity>

        {/* Saved Cards */}
        <Text style={styles.sectionHeader}>SAVED CARDS</Text>
        {paymentMethods.filter(m => m.cardType).map(method => (
          <View key={method.id} style={styles.cardItemContainer}>
            {renderCardItem(method)}
          </View>
        ))}

        {/* Add New Card Button */}
        <TouchableOpacity
          style={styles.addCardButton}
          onPress={() => navigation.navigate('AddCardScreen', { refreshCards: fetchPaymentData })}
        >
          <View style={styles.addButtonContent}>
            <View style={styles.addButtonIcon}>
              <Ionicons name="add" size={24} color="#9DCD5A" />
            </View>
            <Text style={styles.addButtonText}>Add New Card</Text>
          </View>
        </TouchableOpacity>

        {/* Bank Transfer Options */}
        <Text style={styles.sectionHeader}>BANK TRANSFER</Text>
        {[
          { name: 'BPI', code: 'bpi', icon: 'bank' },
          { name: 'BDO', code: 'bdo', icon: 'bank' },
          { name: 'Metrobank', code: 'metrobank', icon: 'bank' },
          { name: 'GCash', code: 'gcash', icon: 'cellphone' },
          { name: 'PayMaya', code: 'paymaya', icon: 'credit-card' }
        ].map(bank => (
          <TouchableOpacity
            key={bank.code}
            style={[
              styles.paymentMethod,
              selectedMethod?.code === bank.code && styles.selectedMethod
            ]}
            onPress={() => setSelectedMethod({
              type: 'bank',
              code: bank.code,
              name: bank.name
            })}
          >
            <View style={styles.methodLeft}>
              <MaterialCommunityIcons 
                name={bank.icon} 
                size={24} 
                color="#9DCD5A" 
              />
              <Text style={styles.methodName}>{bank.name}</Text>
            </View>
            {selectedMethod?.code === bank.code && (
              <Ionicons name="checkmark-circle" size={24} color="#9DCD5A" />
            )}
          </TouchableOpacity>
        ))}
      </>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Payment Method</Text>
            <View style={{ width: 24 }} /> {/* Spacer */}
          </View>

          {/* Order Summary */}
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Product:</Text>
              <Text style={styles.summaryValue}>{order?.product.name}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Quantity:</Text>
              <Text style={styles.summaryValue}>
                {order?.quantity} {order?.product.unit.toLowerCase()}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Unit Price:</Text>
              <Text style={styles.summaryValue}>₱{order?.product.price.toFixed(2)}</Text>
            </View>
            
            {discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount:</Text>
                <Text style={[styles.summaryValue, styles.discountValue]}>
                  -₱{discount.toFixed(2)} ({order?.product.discount.percentage}%)
                </Text>
              </View>
            )}
            
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={[styles.summaryLabel, styles.totalLabel]}>Total:</Text>
              <Text style={[styles.summaryValue, styles.totalValue]}>₱{total.toFixed(2)}</Text>
            </View>
          </View>

          {/* Payment Methods */}
          <View style={styles.paymentMethodsContainer}>
            <Text style={styles.paymentTitle}>Select Payment Method</Text>
            {renderPaymentMethods()}
          </View>

          {/* Spacer for the button */}
          <View style={styles.spacer} />
        </ScrollView>

        {/* Pay Now Button */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[
              styles.payButton,
              (!selectedMethod || isPaying) && styles.disabledButton
            ]}
            onPress={handlePayment}
            disabled={!selectedMethod || isPaying}
          >
            {isPaying ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.payButtonText}>
                PAY ₱{total.toFixed(2)}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContainer: {
    paddingBottom: 100, // Space for the button
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  summaryContainer: {
    padding: 16,
    borderBottomWidth: 8,
    borderBottomColor: '#F5F5F5',
  },
  summaryTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#555',
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },
  discountValue: {
    color: '#FF5252',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  totalLabel: {
    fontFamily: 'Poppins-SemiBold',
  },
  totalValue: {
    color: '#9DCD5A',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  paymentMethodsContainer: {
    padding: 16,
  },
  paymentTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#888',
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEE',
    marginBottom: 8,
  },
  selectedMethod: {
    borderColor: '#9DCD5A',
    backgroundColor: '#F9FCF4',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletIcon: {
    marginRight: 12,
  },
  methodName: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  methodBalance: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#9DCD5A',
    marginTop: 2,
  },
  loadingContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacer: {
    height: 80,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
  },
  payButton: {
    backgroundColor: '#9DCD5A',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCC',
  },
  payButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  // New card styles matching CardPage
  cardItemContainer: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContainer: {
    width: '100%',
    padding: 20,
    justifyContent: 'center',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardLogo: {
    width: 40,
    height: 25,
    marginRight: 15,
  },
  cardDetails: {
    flex: 1,
  },
  cardType: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
    opacity: 0.8,
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  defaultBadge: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 10,
  },
  defaultBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
  },
  addCardButton: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(157, 205, 90, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  addButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
});

export default Payment;