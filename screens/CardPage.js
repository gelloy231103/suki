import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Animated,
  PanResponder,
  Dimensions
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { RectButton } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';


const { width } = Dimensions.get('window');

const CardPage = ({ navigation }) => {
  const { userData } = useContext(AuthContext);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRow, setActiveRow] = useState(null);

  // Fetch user's payment methods from Firestore
  const fetchPaymentMethods = async () => { 
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;
      
      setLoading(true);
      const q = query(
        collection(db, 'users', userId, 'paymentMethods')
      );
      
      const querySnapshot = await getDocs(q);
      const methods = [];
      querySnapshot.forEach((doc) => {
        methods.push({ 
          id: doc.id, 
          ...doc.data(),
          lastFour: doc.data().lastFour || doc.data().cardNumber?.slice(-4) || '••••',
          type: doc.data().type || 'card',
          cardHolder: doc.data().cardHolder || `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
        });
      });

      // Sort with default card first
      const sortedMethods = methods.sort((a, b) => 
        (a.isDefault === b.isDefault) ? 0 : a.isDefault ? -1 : 1
      );
      
      setCards(sortedMethods);
    } catch (error) {
      console.error("Error fetching payment methods: ", error);
      Alert.alert("Error", "Failed to load payment methods");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, [userData?.userId]);

  // Set card as default
  const setAsDefault = async (cardId) => {
    try {
      setLoading(true);
      
      // First, set all cards to not default
      const batchUpdates = cards.map(async (card) => {
        const cardRef = doc(db, 'users', userData.userId, 'paymentMethods', card.id);
        await updateDoc(cardRef, {
          isDefault: card.id === cardId
        });
      });
      
      await Promise.all(batchUpdates);
      
      // Then update local state
      const updatedCards = cards.map(card => ({
        ...card,
        isDefault: card.id === cardId
      }));
      
      // Sort with default card first
      const sortedCards = updatedCards.sort((a, b) => 
        (a.isDefault === b.isDefault) ? 0 : a.isDefault ? -1 : 1
      );
      
      setCards(sortedCards);
      setActiveRow(null); // Close any open swipeable
    } catch (error) {
      console.error("Error setting default card: ", error);
      Alert.alert("Error", "Failed to set default payment method");
    } finally {
      setLoading(false);
    }
  };

  // Delete payment method
  const deleteCard = (cardId) => {
    Alert.alert(
      "Remove Card",
      "Are you sure you want to remove this payment method?",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => setActiveRow(null)
        },
        { 
          text: "Remove", 
          onPress: async () => {
            try {
              setLoading(true);
              
              // Soft delete by setting isActive to false
              const cardRef = doc(db, 'users', userData.userId, 'paymentMethods', cardId);
              await updateDoc(cardRef, {
                isActive: false
              });
              
              // Remove from local state
              const updatedCards = cards.filter(card => card.id !== cardId);
              setCards(updatedCards);
              setActiveRow(null);
            } catch (error) {
              console.error("Error deleting card: ", error);
              Alert.alert("Error", "Failed to remove payment method");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
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

  // Render right actions for swipeable
  const renderRightActions = (card, progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [0, 50, 100, 101],
      outputRange: [0, 0, 0, 1],
    });
    
    return (
      <View style={styles.rightActionsContainer}>
        {/* Set Default Button */}
        <RectButton
          style={[styles.rightAction, styles.defaultAction]}
          onPress={() => setAsDefault(card.id)}
          enabled={!card.isDefault}
        >
          <Animated.View style={[
            styles.actionContent,
            { transform: [{ translateX: trans }] }
          ]}>
            <Ionicons 
              name={card.isDefault ? "checkmark-circle" : "radio-button-off"} 
              size={20} 
              color={card.isDefault ? '#FFFFFF' : '#FFFFFF'} 
            />
            <Text style={styles.actionText}>
              {card.isDefault ? 'Default' : 'Set Default'}
            </Text>
          </Animated.View>
        </RectButton>
        
        {/* Delete Button */}
        <RectButton
          style={[styles.rightAction, styles.deleteAction]}
          onPress={() => deleteCard(card.id)}
          enabled={!card.isDefault}
        >
          <Animated.View style={[
            styles.actionContent,
            { transform: [{ translateX: trans }] }
          ]}>
            <Ionicons 
              name="trash" 
              size={18} 
              color="#FFFFFF" 
            />
            <Text style={styles.actionText}>Delete</Text>
          </Animated.View>
        </RectButton>
      </View>
    );
  };

  // Close other swipeables when one is opened
  const updateRef = (ref, id) => {
    if (ref && id !== activeRow) {
      ref.close();
    }
  };

  // Render card item in list
  const renderCardItem = (card) => {
    const cardBackground = card.isDefault ? '#9DCD5A' : '#FFFFFF';
    const textColor = card.isDefault ? '#FFFFFF' : '#333333';

    return (
      <Swipeable
        ref={(ref) => updateRef(ref, card.id)}
        renderRightActions={(progress, dragX) => renderRightActions(card, progress, dragX)}
        rightThreshold={40}
        onSwipeableWillOpen={() => setActiveRow(card.id)}
        friction={2}
      >
        <View style={[styles.cardContainer, { backgroundColor: cardBackground }]}>
          <View style={styles.cardContent}>
            <Image 
              source={getCardImage(card.type)} 
              style={[styles.cardLogo, { tintColor: card.isDefault ? '#FFFFFF' : null }]} 
              resizeMode="contain"
            />
            
            <View style={styles.cardDetails}>
              <Text style={[styles.cardType, { color: textColor }]}>
                {card.type?.toUpperCase() || 'CARD'}
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
            
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={textColor} 
              style={styles.chevronIcon}
            />
          </View>
        </View>
      </Swipeable>
    );
  };

  if (userData?.isLoading || loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9DCD5A" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Ionicons name="arrow-back" size={24} color="#9DCD5A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment Methods</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Cards List */}
        {cards.length > 0 ? (
          <View style={styles.cardsList}>
            {cards.map((card) => (
              <View key={card.id} style={styles.cardItemContainer}>
                {renderCardItem(card)}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.noCardsContainer}>
            <MaterialIcons name="credit-card-off" size={48} color="#9DCD5A" />
            <Text style={styles.noCardsText}>No payment methods added</Text>
            <Text style={styles.noCardsSubtext}>Add a payment method to get started</Text>
          </View>
        )}

        {/* Add Payment Method Button */}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddCardScreen', { refreshCards: fetchPaymentMethods })}
          activeOpacity={0.8}
        >
          <View style={styles.addButtonContent}>
            <View style={styles.addButtonIcon}>
              <Ionicons name="add" size={24} color="#9DCD5A" />
            </View>
            <Text style={styles.addButtonText}>Add Payment Method</Text>
          </View>
        </TouchableOpacity>

        {/* Payment Methods Info */}
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <MaterialIcons name="security" size={20} color="#9DCD5A" />
            <Text style={styles.infoText}>Your payment info is secured with bank-level encryption</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="credit-card" size={20} color="#9DCD5A" />
            <Text style={styles.infoText}>We support Visa, Mastercard, GCash, and PayPal</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  container: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    fontFamily: 'Inter-SemiBold',
  },
  cardsList: {
    marginTop: 10,
    paddingHorizontal: 20,
  },
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
  chevronIcon: {
    marginLeft: 10,
  },
  rightActionsContainer: {
    width: 180,
    flexDirection: 'row',
  },
  rightAction: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
  },
  defaultAction: {
    backgroundColor: '#9DCD5A',
  },
  deleteAction: {
    backgroundColor: '#FF5252',
  },
  actionContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
    fontFamily: 'Inter-SemiBold',
  },
  noCardsContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 40,
  },
  noCardsText: {
    marginTop: 15,
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  noCardsSubtext: {
    marginTop: 5,
    fontSize: 14,
    color: '#888',
    fontFamily: 'Inter-Regular',
  },
  addButton: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 30,
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
  infoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  infoText: {
    marginLeft: 10,
    color: '#555',
    fontSize: 14,
    flex: 1,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
});

export default CardPage;