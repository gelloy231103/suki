import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { db, auth } from '../config/firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  doc, 
  collection, 
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';


// Custom validation functions
const validateCardNumber = (number) => {
  // Simple Luhn algorithm implementation
  let sum = 0;
  const num = number.replace(/\s/g, '');
  
  if (!/^\d+$/.test(num)) return false;
  
  for (let i = 0; i < num.length; i++) {
    let digit = parseInt(num[i]);
    if ((num.length - i) % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  
  return sum % 10 === 0;
};


const detectCardType = (number) => {
  const num = number.replace(/\s/g, '');
  if (/^4/.test(num)) return 'visa';
  if (/^5[1-5]/.test(num)) return 'mastercard';
  if (/^3[47]/.test(num)) return 'amex';
  if (/^6(?:011|5)/.test(num)) return 'discover';
  return 'unknown';
};

const validateExpiry = (expiry) => {
  if (!expiry) return false;
  const [month, year] = expiry.split('/');
  if (!month || !year || month.length !== 2 || year.length !== 2) return false;
  
  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;
  
  if (month < 1 || month > 12) return false;
  if (year < currentYear) return false;
  if (year == currentYear && month < currentMonth) return false;
  
  return true;
};

const validateCVV = (cvv, cardType) => {
  const length = cardType === 'amex' ? 4 : 3;
  return cvv.length === length && /^\d+$/.test(cvv);
};

const AddCardScreen = ({ navigation, route }) => {
  // Form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardType, setCardType] = useState('unknown');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isDefault, setIsDefault] = useState(false);

  // Refs for input focus management
  const cardNumberRef = useRef();
  const cardHolderRef = useRef();
  const expiryRef = useRef();
  const cvvRef = useRef();

  // Animations
  const cardFlipAnim = useRef(new Animated.Value(0)).current;
  const [isFlipped, setIsFlipped] = useState(false);

  // Card type detection
  useEffect(() => {
    setCardType(detectCardType(cardNumber));
  }, [cardNumber]);

  // Format card number with spaces every 4 digits
  const handleCardNumberChange = (text) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, '');
    
    // Add space after every 4 digits
    let formatted = '';
    for (let i = 0; i < cleaned.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += ' ';
      formatted += cleaned[i];
    }
    
    // Limit to 19 characters (16 digits + 3 spaces)
    formatted = formatted.substring(0, 19);
    setCardNumber(formatted);

    // Auto-focus next field when complete
    if (cleaned.length === 16) {
      cardHolderRef.current.focus();
    }
  };

  // Handle expiry date input
  const handleExpiryChange = (text) => {
    // Remove all non-digit characters
    let cleaned = text.replace(/\D/g, '');
    
    // Add slash after 2 digits
    if (cleaned.length > 2) {
      cleaned = `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    
    // Limit to 5 characters (MM/YY)
    setExpiry(cleaned.substring(0, 6));
    
    // Auto-focus CVV field when complete
    if (cleaned.length === 4) {
      cvvRef.current.focus();
    }
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};

    if (!validateCardNumber(cardNumber)) {
      newErrors.cardNumber = 'Invalid card number';
    }

    if (!cardHolder.trim()) {
      newErrors.cardHolder = 'Card holder name is required';
    }

    if (!validateExpiry(expiry)) {
      newErrors.expiry = 'Invalid expiry date (MM/YY)';
    }

    if (!validateCVV(cvv, cardType)) {
      newErrors.cvv = cardType === 'amex' ? 'Invalid 4-digit CVV' : 'Invalid 3-digit CVV';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddCard = async () => {
    if (!validateForm()) return;
  
    setIsLoading(true);
  
    try {
      const [expiryMonth, expiryYear] = expiry.split('/');
      const userId = auth.currentUser.uid;
  
      // If setting as default, first unset any existing default cards
      if (isDefault) {
        const paymentMethodsRef = collection(db, 'users', userId, 'paymentMethods');
        const querySnapshot = await getDocs(query(paymentMethodsRef, where('isDefault', '==', true)));
        
        querySnapshot.forEach(async (doc) => {
          await updateDoc(doc.ref, { isDefault: false });
        });
      }
  
      const newPaymentMethod = {
        cardHolder,
        cardId: `card_${Date.now()}`,
        cardNumber,
        cardType,
        expiryMonth,
        expiryYear,
        isDefault, // Include the selected default status
        createdAt: serverTimestamp(),
        lastUsed: serverTimestamp()
      };
  
      const paymentMethodsRef = collection(db, 'users', userId, 'paymentMethods');
      await addDoc(paymentMethodsRef, newPaymentMethod);
  
      navigation.navigate({
        name: 'ProfileDashboard',
        params: { refreshCards: true },
        merge: true
      });
      
    } catch (error) {
      console.error("Error adding card:", error);
      Alert.alert("Error", "Failed to add card. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

const { onCardAdded } = route.params;

  // Card brand icons
  const cardIcons = {
    visa: require('../assets/images/cardsImage/visa.png'),
    mastercard: require('../assets/images/cardsImage/mastercard.png'),
    discover: require('../assets/images/cardsImage/discover.png'),
    amex: require('../assets/images/cardsImage/amex.png'),
  };

  // Flip animation
  const flipCard = () => {
    setIsFlipped(!isFlipped);
    Animated.spring(cardFlipAnim, {
      toValue: isFlipped ? 0 : 180,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
  };

  const frontInterpolate = cardFlipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = cardFlipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const toggleAnim = useRef(new Animated.Value(0)).current;

  const toggleStyle = {
    transform: [{
      scale: toggleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.2]
      })
    }]
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <SafeAreaView>
          {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="chevron-left" size={30} color="#A4DC4C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Payment Method</Text>
          <View style={{ width: 30 }} />
        </View>

        {/* 3D Card Preview */}
        <View style={styles.cardPreviewContainer}>
          <View style={styles.cardWrapper}>
            <Animated.View
              style={[
                styles.card,
                styles.cardFront,
                {
                  transform: [{ rotateY: frontInterpolate }],
                  backfaceVisibility: 'hidden',
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <Image
                  source={cardIcons[cardType]}
                  style={styles.cardTypeLogo}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.cardNumberPreview}>
                {cardNumber || '•••• •••• •••• ••••'}
              </Text>
              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.cardLabel}>CARD HOLDER</Text>
                  <Text style={styles.cardHolderPreview}>
                    {cardHolder || 'YOUR NAME'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.cardLabel}>VALID THRU</Text>
                  <Text style={styles.cardExpiryPreview}>{expiry || '••/••'}</Text>
                </View>
              </View>
            </Animated.View>

            <Animated.View
              style={[
                styles.card,
                styles.cardBack,
                {
                  transform: [{ rotateY: backInterpolate }],
                  backfaceVisibility: 'hidden',
                },
              ]}
            >
              <View style={styles.cardMagneticStripe} />
              <View style={styles.cvvContainer}>
                <Text style={styles.cvvLabel}>CVV</Text>
                <Text style={styles.cvvPreview}>
                  {cvv ? cvv.padEnd(cardType === 'amex' ? 4 : 3, '•') : '•••'}
                </Text>
              </View>
              <Image
                source={cardIcons[cardType]}
                style={styles.cardTypeLogoBack}
                resizeMode="contain"
              />
            </Animated.View>
          </View>

          <TouchableOpacity style={styles.flipButton} onPress={flipCard}>
            <MaterialCommunityIcons
              name={isFlipped ? 'credit-card' : 'credit-card-scan'}
              size={24}
              color="#A4DC4C"
            />
            <Text style={styles.flipButtonText}>
              {isFlipped ? 'Show Front' : 'Show Back'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Card Number */}
          <Text style={styles.inputLabel}>Card Number</Text>
          <TextInput
            ref={cardNumberRef}
            style={[styles.input, errors.cardNumber && styles.inputError]}
            placeholder="4242 4242 4242 4242"
            value={cardNumber}
            onChangeText={handleCardNumberChange}
            keyboardType="numeric"
            maxLength={19}
            returnKeyType="next"
            onSubmitEditing={() => cardHolderRef.current.focus()}
          />
          {errors.cardNumber && (
            <Text style={styles.errorText}>{errors.cardNumber}</Text>
          )}

          {/* Card Holder */}
          <Text style={styles.inputLabel}>Card Holder Name</Text>
          <TextInput
            ref={cardHolderRef}
            style={[styles.input, errors.cardHolder && styles.inputError]}
            placeholder="Enter card holder name"
            value={cardHolder}
            onChangeText={setCardHolder}
            returnKeyType="next"
            onSubmitEditing={() => expiryRef.current.focus()}
          />
          {errors.cardHolder && (
            <Text style={styles.errorText}>{errors.cardHolder}</Text>
          )}

          {/* Expiry and CVV */}
          <View style={styles.row}>
            <View style={styles.halfInputContainer}>
              <Text style={styles.inputLabel}>Expiry Date (MM/YY)</Text>
              <TextInput
                ref={expiryRef}
                style={[
                  styles.input,
                  styles.halfInput,
                  errors.expiry && styles.inputError,
                ]}
                placeholder="MM/YY"
                value={expiry}
                onChangeText={handleExpiryChange}
                keyboardType="numeric"
                maxLength={6}
                returnKeyType="next"
              />
              {errors.expiry && (
                <Text style={styles.errorText}>{errors.expiry}</Text>
              )}
            </View>

            <View style={styles.halfInputContainer}>
              <Text style={styles.inputLabel}>
                CVV {cardType === 'amex' ? '(4 digits)' : '(3 digits)'}
              </Text>
              <TextInput
                ref={cvvRef}
                style={[styles.input, styles.halfInput, errors.cvv && styles.inputError]}
                placeholder={cardType === 'amex' ? '••••' : '•••'}
                value={cvv}
                onChangeText={(text) => {
                  const cleaned = text.replace(/\D/g, '');
                  const maxLength = cardType === 'amex' ? 4 : 3;
                  setCvv(cleaned.substring(0, maxLength));
                }}
                keyboardType="numeric"
                maxLength={cardType === 'amex' ? 4 : 3}
                secureTextEntry={true}
                onFocus={flipCard}
                onBlur={() => setIsFlipped(false)}
              />
              {errors.cvv && <Text style={styles.errorText}>{errors.cvv}</Text>}
            </View>
          </View>

          <View style={styles.defaultContainer}>
            <View>
              <Text style={styles.defaultLabel}>Set as default payment method</Text>
              <Text style={styles.helpText}>This card will be used for future purchases</Text>
            </View>
            <TouchableOpacity 
                style={styles.toggleButton}
                onPress={() => {
                  Animated.spring(toggleAnim, {
                    toValue: 1,
                    friction: 3,
                    useNativeDriver: true
                  }).start(() => {
                    toggleAnim.setValue(0);
                    setIsDefault(!isDefault);
                  });
                }}
              >
                <Animated.View style={[
                  styles.toggleCircle,
                  isDefault ? styles.toggleActive : styles.toggleInactive,
                  toggleStyle
                ]}>
                  {isDefault && (
                    <MaterialCommunityIcons name="check" size={16} color="#fff" />
                  )}
                </Animated.View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.addButton, isLoading && styles.addButtonDisabled]}
          onPress={handleAddCard}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons
                name="credit-card-plus"
                size={24}
                color="#fff"
              />
              <Text style={styles.addButtonText}>Add Payment Method</Text>
            </>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

// [Keep all your existing styles...]

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  cardPreviewContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  cardWrapper: {
    width: '100%',
    height: 200,
    perspective: 1000,
  },
  card: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    padding: 20,
    position: 'absolute',
    backfaceVisibility: 'hidden',
    justifyContent: 'space-between',
  },
  cardFront: {
    backgroundColor: 'green',
  },
  cardBack: {
    backgroundColor: 'green',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cardTypeLogo: {
    width: 60,
    height: 40,
  },
  cardTypeLogoBack: {
    width: 60,
    height: 40,
    alignSelf: 'flex-end',
  },
  cardNumberPreview: {
    fontSize: 22,
    color: '#fff',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginVertical: 15,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  cardHolderPreview: {
    color: '#fff',
    fontSize: 16,
    textTransform: 'uppercase',
    marginTop: 5,
  },
  cardExpiryPreview: {
    color: '#fff',
    fontSize: 16,
    marginTop: 5,
  },
  cardMagneticStripe: {
    height: 40,
    backgroundColor: '#000',
    marginTop: 20,
    marginHorizontal: -20,
  },
  cvvContainer: {
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 4,
    alignSelf: 'flex-end',
    marginRight: 20,
    marginBottom: 20,
    width: 80,
  },
  cvvLabel: {
    color: '#333',
    fontSize: 10,
  },
  cvvPreview: {
    color: '#333',
    fontSize: 16,
    letterSpacing: 3,
    textAlign: 'right',
  },
  flipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  flipButtonText: {
    color: '#A4DC4C',
    marginLeft: 5,
    fontWeight: '500',
  },
  formContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#666',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 50,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 5,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#FF3B30',
    borderWidth: 1,
  },
  halfInput: {
    height: 50,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInputContainer: {
    width: '48%',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: '#A4DC4C',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  addButtonDisabled: {
    opacity: 0.7,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  defaultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingVertical: 10,
  },
  
  defaultLabel: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Poppins-Medium',
  },
  
  toggleButton: {
    padding: 8,
  },
  
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  toggleActive: {
    backgroundColor: '#A4DC4C',
  },
  toggleInactive: {
    backgroundColor: '#E0E0E0',
    borderWidth: 1,
    borderColor: '#B0B0B0',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
});

export default AddCardScreen;