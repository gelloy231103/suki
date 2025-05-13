import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Animated, 
  Dimensions, 
  Image,
  ScrollView,
  Easing,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Swiper from 'react-native-swiper';
import { collection, query, orderBy, getDocs, doc, getDoc, updateDoc, setDoc  } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { AuthContext } from '../context/AuthContext';


const { width, height } = Dimensions.get('window');

const BUTTON_WIDTH = (width - 40) / 2 - 10;
const veggieCardList = [
  {
    id: 'veg-001',
    productName: 'Lettuce Baguio',
    originalPrice: '₱35/kg',
    discountedPrice: '₱20/kg',
    totalReviews: 354,
    starRating: 4,
    vendorName: 'Habano Farm and Gril..',
    imageSource: require('../assets/lettuce.png'),
  },
  {
    id: 'veg-002',
    productName: 'Sweet Tomatoes',
    originalPrice: '₱40/kg',
    discountedPrice: '₱30/kg',
    totalReviews: 361,
    starRating: 4,
    vendorName: 'Tashions Farmville',
    imageSource: require('../assets/tomatoes.png'),
  },
  {
    id: 'veg-003',
    productName: 'Biggest Eggplant',
    originalPrice: '₱80/kg',
    discountedPrice: '₱65/kg',
    totalReviews: 289,
    starRating: 4,
    vendorName: 'Northton Farm',
    imageSource: require('../assets/eggplant.png'),
  },
];

const Wallet = ({navigation}) => {
  const { userData } = useContext(AuthContext);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTopUpVisible, setIsTopUpVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [selectedCard, setSelectedCard] = useState(null);
  const [mobileNumber, setMobileNumber] = useState('');
  const [balance, setBalance] = useState(0);  


  const fetchPaymentMethods = async () => {
    try {
      setIsLoading(true);
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const q = query(
        collection(db, 'users', userId, 'paymentMethods'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const methods = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        methods.push({ 
          id: doc.id, 
          cardType: data.cardType?.toLowerCase(),
          cardNumber: data.cardNumber,
          cardHolder: data.cardHolder,
          expiryMonth: data.expiryMonth,
          expiryYear: data.expiryYear,
          createdAt: data.createdAt?.toDate().toString()
        });
      });

      setPaymentMethods(methods);
      if (methods.length > 0) {
        setSelectedCard(methods[0]); // Auto-select the first card
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      Alert.alert("Error", "Failed to load payment methods");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
  
        const balanceRef = doc(db, 'users', userId, 'wallet', 'balance');
        const docSnap = await getDoc(balanceRef);
  
        if (docSnap.exists()) {
          const data = docSnap.data();
          setBalance(data.currentBalance || 0); // Set the balance, default to 0 if undefined
        } else {
          setBalance(0); // Set balance to 0 if no document is found
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
        Alert.alert("Error", "Failed to load balance");
      }
    };

    fetchBalance();
    fetchPaymentMethods();
  }, []);

  const handleTopUpPress = () => {
    animateTopUp();
    setIsTopUpVisible(true);
  };

  const handleConfirmPayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
  
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;
  
      // Reference to the 'wallet' document
      const walletRef = doc(db, 'users', userId, 'wallet', 'balance');
      const docSnap = await getDoc(walletRef);
  
      // If the 'balance' document doesn't exist, create it
      if (!docSnap.exists()) {
        // Create the 'wallet' and 'balance' document with an initial balance of 0
        await setDoc(walletRef, {
          currentBalance: 0,  // Initial balance
          lastUpdated: new Date().toISOString(),  // Timestamp
        });
        console.log("Wallet and balance document created with initial value.");
      }
  
      // Now fetch the current balance after creation or fetching
      const balanceRef = doc(db, 'users', userId, 'wallet', 'balance');
      const balanceSnap = await getDoc(balanceRef);
  
      if (balanceSnap.exists()) {
        const currentBalance = balanceSnap.data().currentBalance || 0;
        const newBalance = currentBalance + parseFloat(amount);
  
        // Update Firestore with the new balance and the updated timestamp
        await updateDoc(balanceRef, {
          currentBalance: newBalance,
          lastUpdated: new Date().toISOString(),
        });
  
        setBalance(newBalance);  // Update the local state with the new balance
        setAmount('');  // Clear the amount input field
        setIsTopUpVisible(false);  // Hide the top-up modal
        Alert.alert('Success', `₱${amount} has been successfully added to your wallet.`);
      }
    } catch (error) {
      console.error("Error updating balance:", error);
      Alert.alert("Error", "Failed to update your balance");
    }
  };
  
  

  const handleClose = () => {
    setIsTopUpVisible(false);
    setAmount('');
    setSelectedPaymentMethod('card');
    setSelectedCard(paymentMethods.length > 0 ? paymentMethods[0] : null);
    setMobileNumber('');
  };

  const handleUseAccountNumber = () => {
    setMobileNumber(userData.mobileNumber || '');
  };

  const [showBalance, setShowBalance] = useState(false);
  
  // Button scale animations
  const topUpAnim = useRef(new Animated.Value(0)).current;
  const sendAnim = useRef(new Animated.Value(0)).current;
  
  // Icon scale animations
  const topUpIconAnim = useRef(new Animated.Value(1)).current;
  const sendIconAnim = useRef(new Animated.Value(1)).current;
  
  const swiperRef = useRef(null);

  // Button scale interpolations
  const topUpScale = topUpAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.95],
  });

  const sendScale = sendAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.95],
  });

  const renderRatingStars = (ratingCount) => {
    return [1, 2, 3, 4, 5].map((i) => (
      <Icon
        key={`star-${i}`}
        name={i <= ratingCount ? 'star' : 'star-border'}
        size={16}
        color="#FFD700"
      />
    ));
  };

  const animateTopUp = () => {
    Animated.parallel([
      // Button scale animation
      Animated.sequence([
        Animated.timing(topUpAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(topUpAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
      // Icon scale animation
      Animated.sequence([
        Animated.timing(topUpIconAnim, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(topUpIconAnim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const animateSend = () => {
    Animated.parallel([
      // Button scale animation
      Animated.sequence([
        Animated.timing(sendAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(sendAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
      // Icon scale animation
      Animated.sequence([
        Animated.timing(sendIconAnim, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(sendIconAnim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const navigateToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  const navigateToMarket = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Market' }],
    });
  };

  const navigateToCart = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Cart' }],
    });
  };

  return (
    <View style={styles.fullContainer}>
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {/* Header Section */}
            <View style={styles.headContainer}>
              <View style={styles.headerTopRow}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerIcons}>
                  <Ionicons name="chatbox-ellipses" size={24} color="#fff" style={styles.headerIcon} />
                  <Ionicons name="notifications" size={24} color="#fff" style={styles.headerIcon} />
                </View>
              </View>
              
              <View style={styles.balanceContainer}>
                <View>
                  <Text style={styles.balanceLabel}>Suki Balance</Text>
                  <View style={styles.balance}>
                    <Text style={styles.balanceAmount}>
                      ₱{showBalance ? balance.toFixed(2) : '••••.••'}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowBalance(!showBalance)}
                      style={styles.eyeIcon}
                    >
                      <Ionicons
                        name={showBalance ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color="#fff"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity style={styles.bellNotif}>
                  <Ionicons name="notifications" size={24} color="#9DCD5A"/>
                </TouchableOpacity>
              </View>
            </View>

            {/* Payment Info Section */}
            <View style={styles.paymentInfoContainer}>
              <View style={styles.paymentInfoRow}>
                <MaterialCommunityIcons name="shield-check" size={20} color="#9DCD5A" />
                <Text style={styles.paymentInfoText}>Secure Payment</Text>
              </View>
              <View style={styles.paymentInfoRow}>
                <MaterialCommunityIcons name="credit-card" size={20} color="#9DCD5A" />
                <Text style={styles.paymentInfoText}>Supported by Card</Text>
              </View>
              <View style={styles.paymentInfoRow}>
                <MaterialCommunityIcons name="cash-refund" size={20} color="#9DCD5A" />
                <Text style={styles.paymentInfoText}>Refundable</Text>
              </View>
            </View>

            {/* Action Buttons with Animations */}
            <View style={styles.actionButtonsContainer}>
              <Animated.View style={{ 
                  transform: [
                    { scale: topUpIconAnim },
                    { rotate: topUpIconAnim.interpolate({
                        inputRange: [1, 1.2],
                        outputRange: ['0deg', '10deg']
                      }) 
                    }
                  ] 
                }}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.topUpButton]}
                  onPress={handleTopUpPress}
                  activeOpacity={0.9}
                >
                  <View style={styles.buttonContent}>
                    <Animated.View style={{ transform: [{ scale: topUpIconAnim }] }}>
                      <MaterialCommunityIcons name="credit-card-plus" size={24} color="#fff" />
                    </Animated.View>
                    <Animated.View style={{ transform: [{ scale: topUpIconAnim }] }}>
                      <Text style={styles.buttonText}>Top Up</Text>
                    </Animated.View>
                  </View>
                </TouchableOpacity>
              </Animated.View>

              <Animated.View style={
                { 
                  transform: [
                    { scale: sendIconAnim },
                    { rotate: sendIconAnim.interpolate({
                        inputRange: [1, 1.2],
                        outputRange: ['0deg', '10deg']
                      }) 
                    }
                  ] 
                }
              }>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.sendButton]}
                  onPress={animateSend}
                  activeOpacity={0.9}
                >
                  <View style={styles.buttonContent}>
                    <Animated.View style={{ transform: [{ scale: sendIconAnim }] }}>
                      <FontAwesome5 name="paper-plane" size={20} color="#fff" />
                    </Animated.View>
                    <Animated.View style={{ transform: [{ scale: sendIconAnim }] }}>
                      <Text style={styles.buttonText}>Send</Text>
                    </Animated.View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Discounts Section */}
            <View style={styles.discountsContainer}>
              <Text style={styles.sectionTitle}>
                Use your <Text style={styles.sukiCashHighlight}>SukiCash</Text> for Discounts!
              </Text>
              
              <Swiper
                ref={swiperRef}
                style={styles.swiper}
                showsPagination={true}
                dotColor="#E0E0E0"
                activeDotColor="#9DCD5A"
                autoplay={true}
                autoplayTimeout={3}
                loop={true}
                removeClippedSubviews={false}
                paginationStyle={{
                  position: 'absolute',
                  bottom: -10,
                  left: 0,
                  right: 0,
                }}
                dotStyle={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  marginHorizontal: 4,
                }}
                activeDotStyle={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  marginHorizontal: 4,
                }}
              >
                {veggieCardList.map((item) => (
                  <View key={item.id} style={styles.carouselItem}>
                    <View style={styles.veggieCard}>
                      <Image source={item.imageSource} style={styles.veggieImage} />
                      <View style={styles.veggieInfo}>
                        <Text style={styles.veggieName}>{item.productName}</Text>
                        <View style={styles.priceRow}>
                          <Text style={styles.originalPrice}>{item.originalPrice}</Text>
                          <Icon name="arrow-forward" size={18} color="#9DCD5A" style={styles.priceArrow} />
                          <Text style={styles.discountedPrice}>{item.discountedPrice}</Text>
                        </View>
                        <View style={styles.ratingRow}>
                          {renderRatingStars(item.starRating)}
                          <Text style={styles.reviewCount}>{item.totalReviews} reviews</Text>
                        </View>
                        <View style={styles.vendorRow}>
                          <Icon name="store" size={16} color="#757575" />
                          <Text style={styles.vendorName}>{item.vendorName}</Text>
                        </View>
                      </View>
                      <TouchableOpacity style={styles.favoriteButton}>
                        <Icon name="favorite" size={20} color="#FF5252" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </Swiper>
            </View>

            {/* Wallet Info Section */}
            <View style={styles.walletInfoContainer}>
              <Text style={styles.infoHeading}>Become a better saver and efficient shopper!</Text>
              <Text style={styles.infoSubheading}>
                Suki Wallet makes buying fresh produce easier than ever! Seamlessly top up, send, and request funds within the app while enjoying secure payments, refunds, and card support.
              </Text>

              <View style={styles.faqBox}>
                <View style={styles.faqItem}>
                  <View style={styles.questionRow}>
                    <Icon name="help-outline" size={18} color="#fff" style={styles.icon} />
                    <Text style={styles.questionText}>What is Suki Wallet?</Text>
                  </View>
                  <Text style={styles.answerText}>
                    Suki Wallet is a secure in-app payment system that allows you to top up, send, and request funds, making transactions seamless and hassle-free.
                  </Text>
                </View>

                <View style={styles.faqItem}>
                  <View style={styles.questionRow}>
                    <Icon name="help-outline" size={18} color="#fff" style={styles.icon} />
                    <Text style={styles.questionText}>How do I add money to my Suki Wallet?</Text>
                  </View>
                  <Text style={styles.answerText}>
                    You can top up your wallet using various payment methods, including credit/debit cards and online banking.
                  </Text>
                </View>

                <View style={styles.faqItem}>
                  <View style={styles.questionRow}>
                    <Icon name="help-outline" size={18} color="#fff" style={styles.icon} />
                    <Text style={styles.questionText}>Can I withdraw money from my Suki Wallet?</Text>
                  </View>
                  <Text style={styles.answerText}>
                    Currently, Suki Wallet funds can only be used within the platform for purchases and transactions.
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      
      {/* Custom Bottom Navigation Bar */}
      <View style={styles.bottomNavContainer}>
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={navigateToHome}
          activeOpacity={0.7}
        >
          <Ionicons name="home" size={24} color="#888" />
          <Text style={styles.navButtonText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.marketButton} 
          onPress={navigateToMarket}
          activeOpacity={0.7}
        >
          <View style={styles.marketButtonInner}>
            <Ionicons name="storefront" size={34} color="#fff" />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={navigateToCart}
          activeOpacity={0.7}
        >
          <View style={styles.cartContainer}>
            <Ionicons name="cart" size={24} color="#888" />
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>3</Text>
            </View>
          </View>
          <Text style={styles.navButtonText}>Cart</Text>
        </TouchableOpacity>
      </View>

      {/* Top Up Modal */}
      <Modal
        visible={isTopUpVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Top Up</Text>
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View contentContainerStyle={styles.modalContent}>
              {/* Amount Input */}
              <Text style={styles.inputLabel}>Enter the amount</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>₱</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                  autoFocus={true}
                />
              </View>
              
              {/* Payment Method Selection */}
              <Text style={styles.sectionTitleModal}>Choose Payment Method</Text>
              <View style={styles.paymentMethodOptions}>
                <TouchableOpacity 
                  style={[
                    styles.paymentMethodButton,
                    selectedPaymentMethod === 'gcash' && styles.selectedPaymentMethod
                  ]}
                  onPress={() => setSelectedPaymentMethod('gcash')}
                >
                  <Image 
                    source={require('../assets/images/cardsImage/gcash.png')} 
                    style={styles.paymentMethodImage}
                  />
                  <Text style={styles.paymentMethodText}>GCash</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.paymentMethodButton,
                    selectedPaymentMethod === 'paypal' && styles.selectedPaymentMethod
                  ]}
                  onPress={() => setSelectedPaymentMethod('paypal')}
                >
                  <Image 
                    source={require('../assets/images/cardsImage/paypal.png')} 
                    style={styles.paymentMethodImage}
                  />
                  <Text style={styles.paymentMethodText}>PayPal</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.paymentMethodButton,
                    selectedPaymentMethod === 'card' && styles.selectedPaymentMethod
                  ]}
                  onPress={() => setSelectedPaymentMethod('card')}
                >
                  <MaterialCommunityIcons 
                    name="credit-card" 
                    size={24} 
                    color={selectedPaymentMethod === 'card' ? '#9DCD5A' : '#666'} 
                  />
                  <Text style={styles.paymentMethodText}>Card</Text>
                </TouchableOpacity>
              </View>
              
              {/* Dynamic Payment Form */}
              {selectedPaymentMethod === 'card' ? (
                <>
                  <Text style={styles.sectionTitleModal}>Choose your card for payment</Text>
                  <View style={styles.cardListContainer}>
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#9DCD5A" />
                    ) : paymentMethods.length > 0 ? (
                      <ScrollView 
                        style={styles.cardScrollView}
                      >
                        {paymentMethods.map((card) => (
                          <TouchableOpacity
                            key={card.id}
                            style={[
                              styles.cardItem,
                              selectedCard?.id === card.id && styles.selectedCardItem
                            ]}
                            onPress={() => setSelectedCard(card)}
                          >
                            <Image 
                              source={
                                card.cardType === 'visa' 
                                  ? require('../assets/images/cardsImage/visa.png')
                                  : card.cardType === 'mastercard'
                                  ? require('../assets/images/cardsImage/mastercard.png')
                                  : require('../assets/images/cardsImage/unknown.jpg')
                              } 
                              style={styles.cardImage}
                            />
                            <View style={styles.cardInfo}>
                              <Text style={styles.cardNumber}>XXXX XXXX XXXX {card.cardNumber?.slice(-4) || '••••'}</Text>
                              <Text style={styles.cardName}>{card.cardHolder || 'YOUR NAME'}</Text>
                              <Text style={styles.cardExpiry}>
                                VALID THRU {card.expiryMonth || '••'}/{card.expiryYear?.slice(-2) || '••'}
                              </Text>
                            </View>
                            {selectedCard?.id === card.id && (
                              <MaterialCommunityIcons 
                                name="check-circle" 
                                size={24} 
                                color="#9DCD5A" 
                              />
                            )}
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    ) : (
                      <Text style={styles.noCardsText}>No saved cards found</Text>
                    )}
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.addCardButton}
                    onPress={() => {
                      setIsTopUpVisible(false);
                      navigation.navigate('AddCardScreen', {
                        onCardAdded: fetchPaymentMethods
                      });
                    }}
                  >
                    <MaterialCommunityIcons 
                      name="plus-circle" 
                      size={24} 
                      color="#9DCD5A" 
                    />
                    <Text style={styles.addCardText}>Add New Card +</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.sectionTitleModal}>
                    Enter your {selectedPaymentMethod === 'gcash' ? 'GCash' : 'PayPal'} mobile number
                  </Text>
                  <TextInput
                    style={styles.mobileInput}
                    placeholder="09XX XXX XXXX"
                    keyboardType="phone-pad"
                    value={mobileNumber}
                    onChangeText={setMobileNumber}
                  />
                  <TouchableOpacity 
                    style={styles.useAccountButton}
                    onPress={handleUseAccountNumber}
                  >
                    <Text style={styles.useAccountText}>Use your Account's mobile number</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
            
            {/* Confirm Button */}
            <TouchableOpacity 
              style={[
                styles.confirmButton,
                (!amount || (selectedPaymentMethod === 'card' && !selectedCard) || 
                 (selectedPaymentMethod !== 'card' && !mobileNumber)) && 
                styles.disabledButton
              ]}
              onPress={handleConfirmPayment}
              disabled={!amount || (selectedPaymentMethod === 'card' && !selectedCard) || 
                       (selectedPaymentMethod !== 'card' && !mobileNumber)}
            >
              <Text style={styles.confirmButtonText}>Confirm Payment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  fullContainer:{
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  scrollContainer: {
    paddingBottom: 0,
  },
  headContainer: {
    padding: 25,
    backgroundColor: '#9DCD5A',
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
    paddingBottom: 30,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIcons: {
    flexDirection: 'row',
    width: 80,
    justifyContent: 'space-between',
  },
  headerIcon: {
    padding: 4,
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  balance: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeIcon: {
    marginLeft: 10,
  },
  bellNotif: {
    backgroundColor: '#fff',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  paymentInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 15,
    marginTop: -15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  paymentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentInfoText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#555',
    fontWeight: '500',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 25,
    marginBottom: 20,
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 15,
    width: BUTTON_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  topUpButton: {
    backgroundColor: '#9DCD5A',
  },
  sendButton: {
    backgroundColor: '#517B16',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  discountsContainer: {
    height: 240,
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  sukiCashHighlight: {
    color: '#9DCD5A',
    fontWeight: 'bold',
  },
  swiper: {
    height: 180,
    paddingBottom: 20,
  },
  carouselItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  veggieCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    width: '100%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  veggieImage: {
    height: '100%',
    borderRadius: 8,
    marginRight: 15,
  },
  veggieInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  veggieName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#9E9E9E',
    textDecorationLine: 'line-through',
  },
  priceArrow: {
    marginHorizontal: 8,
  },
  discountedPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9DCD5A',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewCount: {
    fontSize: 12,
    color: '#9E9E9E',
    marginLeft: 8,
  },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vendorName: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 5,
  },
  favoriteButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 5,
    elevation: 2,
  },
  walletInfoContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  infoHeading: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    color: '#222',
  },
  infoSubheading: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  faqBox: {
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 12,
  },
  faqItem: {
    marginBottom: 16,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8BC34A',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 6,
  },
  icon: {
    marginRight: 6,
  },
  questionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  answerText: {
    fontSize: 13,
    color: '#444',
    lineHeight: 18,
  },
  bottomNavContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    height: 70,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navButtonText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  marketButton: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    bottom: 20,
  },
  marketButtonInner: {
    backgroundColor: '#9DCD5A',
    width: 80,
    height: 80,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  cartContainer: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    right: -8,
    top: -5,
    backgroundColor: '#FF5252',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(157, 205, 90, 0.34)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    paddingBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 10,
    marginBottom: 25,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionTitleModal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    marginTop: 20,
  },
  paymentMethodOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  paymentMethodButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    width: '30%',
  },
  selectedPaymentMethod: {
    borderColor: '#9DCD5A',
    backgroundColor: '#F0F8E7',
  },
  paymentMethodImage: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    marginBottom: 5,
  },
  paymentMethodText: {
    fontSize: 12,
    color: '#333',
  },
  cardListContainer: {
    maxHeight: 180,
    marginBottom: 10,
  },
  cardScrollView: {
    height: 150,
  },
  cardScrollContent: {
    paddingBottom: 10,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  selectedCardItem: {
    borderWidth: 1,
    borderColor: '#9DCD5A',
    backgroundColor: '#F0F8E7',
  },
  cardImage: {
    width: 40,
    height: 25,
    marginRight: 15,
  },
  cardInfo: {
    flex: 1,
  },
  cardNumber: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  cardName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  cardExpiry: {
    fontSize: 12,
    color: '#666',
  },
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#9DCD5A',
    borderRadius: 10,
    borderStyle: 'dashed',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  addCardText: {
    marginLeft: 10,
    color: '#9DCD5A',
    fontWeight: '500',
  },
  mobileInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  useAccountButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  useAccountText: {
    color: '#9DCD5A',
    fontSize: 14,
  },
  confirmButton: {
    backgroundColor: '#9DCD5A',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
    marginHorizontal: 20,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noCardsText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
  },
});

export default Wallet;