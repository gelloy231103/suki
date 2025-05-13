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
  SafeAreaView,
  Platform
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { doc, collection, query, where, getDocs, getDoc, writeBatch } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { AuthContext } from '../context/AuthContext';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

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
  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        // Fetch payment methods
        const methodsQuery = query(
          collection(db, 'users', userId, 'paymentMethods'),
          where('isActive', '==', true)
        );
        const methodsSnapshot = await getDocs(methodsQuery);
        const methods = [];
        methodsSnapshot.forEach(doc => {
          methods.push({ id: doc.id, ...doc.data() });
        });
        setPaymentMethods(methods);

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

      // Create a batch for atomic operations
      const batch = writeBatch(db);

      // 1. Create the order document
      const orderRef = doc(db, 'users', userId, 'orders', orderId);
      batch.set(orderRef, {
        ...order,
        status: 'processing',
        paymentMethod: selectedMethod.type === 'wallet' ? 'Suki Cash' : selectedMethod.name,
        paymentStatus: 'paid',
        createdAt: new Date(),
        totalAmount: total,
        orderId: orderId
      });

      // 2. If paying with wallet, update the balance
      if (selectedMethod.type === 'wallet') {
        if (walletBalance < total) {
          throw new Error("Insufficient wallet balance");
        }
        
        const walletRef = doc(db, 'users', userId, 'wallet', 'balance');
        batch.update(walletRef, {
          currentBalance: walletBalance - total,
          updatedAt: new Date()
        });

        // Add wallet transaction history
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

      // 3. Update product stock if needed
      if (order.product.stock) {
        const productRef = doc(db, 'products', order.product.id);
        batch.update(productRef, {
          stock: order.product.stock - order.quantity
        });
      }

      // Commit all operations
      await batch.commit();

      // Navigate to order confirmation
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

  // Card component matching your DashboardScreen style
  const SwipeableCard = ({ card, onPress }) => {
    const cardIcons = {
      visa: require('../assets/images/cardsImage/visa.png'),
      mastercard: require('../assets/images/cardsImage/mastercard.png'),
      amex: require('../assets/images/cardsImage/amex.png'),
      discover: require('../assets/images/cardsImage/discover.png'),
      unknown: require('../assets/images/masterCard.png'),
    };

    return (
      <TouchableOpacity
        style={[
          styles.savedCard,
          selectedMethod?.id === card.id && styles.selectedCard
        ]}
        onPress={onPress}
      >
        <View style={{flexDirection: 'column'}}>
          <View style={styles.savedIconName}>
            {card.isDefault && (
              <MaterialCommunityIcons name="check-circle" size={16} color="#8CC63F" />
            )}
            <Text style={styles.cardNumber}>XXXX XXXX XXXX {card.cardNumber?.slice(-4) || '••••'}</Text>
          </View>
          <Text style={styles.cardHolder}>{card.cardHolder || 'YOUR NAME'}</Text>
        </View>
        <View style={{flexDirection:'column', flex: 1, gap: 5}}>
          <View style={styles.cardRight}>
            {card.isDefault ? (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Default</Text>
              </View>
            ) : null}
            <Image
              source={cardIcons[card.cardType] || cardIcons.unknown}
              style={{ width: 40, height: 25, marginLeft: 5}}
              resizeMode='contain'
            />
          </View>
          <Text style={styles.cardExpiry}>
            VALID THRU {card.expiryMonth || '••'}/{card.expiryYear?.slice(-2) || '••'}
          </Text>
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
            <MaterialCommunityIcons name="check-circle" size={24} color="#9DCD5A" />
          )}
        </TouchableOpacity>

        {/* Saved Cards */}
        <Text style={styles.sectionHeader}>SAVED CARDS</Text>
        {paymentMethods.filter(m => m.cardType).map(method => (
          <SwipeableCard
            key={method.id}
            card={method}
            onPress={() => setSelectedMethod({
              id: method.id,
              type: 'card',
              name: `${method.cardType} •••• ${method.cardNumber.slice(-4)}`,
              isDefault: method.isDefault
            })}
          />
        ))}

        {/* Add New Card Button */}
        <TouchableOpacity
          style={styles.addCardButton}
          onPress={() => navigation.navigate('AddCardScreen')}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#9DCD5A" />
          <Text style={styles.addCardText}>Add New Card</Text>
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
              <MaterialCommunityIcons name="check-circle" size={24} color="#9DCD5A" />
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
  methodDetail: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#888',
    marginTop: 2,
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
  // Card styles matching your DashboardScreen
  savedCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    elevation: 1,
    marginBottom: 8,
  },
  selectedCard: {
    borderColor: '#9DCD5A',
    backgroundColor: '#F9FCF4',
    borderWidth: 1,
  },
  savedIconName: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardNumber: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  cardHolder: {
    marginTop: 8,
    fontSize: 14,
    color: 'black',
    fontFamily: 'Poppins-Medium',
  },
  cardExpiry: {
    fontSize: 12,
    color: 'gray',
    justifyContent: 'flex-end',
    textAlign: 'right',
    fontFamily: 'Poppins-Regular',
    marginTop: 3,
  },
  cardRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  defaultBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  defaultBadgeText: {
    color: '#8CC63F',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#9DCD5A',
    marginBottom: 16,
    justifyContent: 'center',
  },
  addCardText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#9DCD5A',
    marginLeft: 8,
  },
});

export default Payment;