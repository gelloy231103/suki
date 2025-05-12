import React, { memo, useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Alert,
  Animated
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { collection, query, where, getDocs, orderBy, doc, deleteDoc, writeBatch  } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { useIsFocused } from '@react-navigation/native';


const { width } = Dimensions.get('window');

// Static product images
const productImages = [
  require('../assets/images/products/0.png'),
  require('../assets/images/products/1.png'),
  require('../assets/images/products/2.png'),
];

const SwipeableCard = memo(({ card, onDelete, onSetDefault }) => {
  const cardIcons = {
    visa: require('../assets/images/cardsImage/visa.png'),
    mastercard: require('../assets/images/cardsImage/mastercard.png'),
    amex: require('../assets/images/cardsImage/amex.png'),
    discover: require('../assets/images/cardsImage/discover.png'),
    unknown: require('../assets/images/masterCard.png'),
  };
  
  const renderRightActions = function(progress, dragX) {
    const trans = dragX.interpolate({
      inputRange: [0, 50, 100, 101],
      outputRange: [0, 0, 0, 1],
    });

    return (
      React.createElement(View, {style: styles.rightActionsContainer},
        !card.isDefault && React.createElement(TouchableOpacity, {
          style: styles.setDefaultButton,
          onPress: function() { onSetDefault(card.id); }
        },
          React.createElement(Animated.View, {
            style: [styles.actionButtonContent, { transform: [{ translateX: trans }] }]
          },
            React.createElement(MaterialCommunityIcons, {
              name: "check-circle-outline",
              size: 24,
              color: "white"
            }),
            React.createElement(Text, {style: styles.actionButtonText}, "Default")
          )
        ),
        
        React.createElement(TouchableOpacity, {
          style: styles.deleteButton,
          onPress: function() {
            Alert.alert(
              'Delete Card',
              'Are you sure you want to delete this card?',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Delete',
                  onPress: function() { onDelete(card.id); },
                  style: 'destructive',
                },
              ],
              {
                cancelable: true,
                userInterfaceStyle: 'light',
              }
            );
          }
        },
          React.createElement(Animated.View, {
            style: [styles.actionButtonContent, { transform: [{ translateX: trans }] }]
          },
            React.createElement(MaterialCommunityIcons, {
              name: "trash-can-outline",
              size: 24,
              color: "white"
            }),
            React.createElement(Text, {style: styles.actionButtonText}, "Delete")
          )
        )
      )
    );
  };

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      friction={2}
      rightThreshold={40}
      containerStyle={styles.swipeableContainer}
    >
      <View style={styles.savedCard}>
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
            ) : (<></>)}
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
      </View>
    </Swipeable>
  );
});

export default function DashboardScreen({navigation, route}) {
  const { userData } = useContext(AuthContext);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [visibleCount, setVisibleCount] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const isFocused = useIsFocused();

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
        methods.push({ id: doc.id, ...doc.data() });
      });

      setPaymentMethods(methods);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused || route.params?.refreshCards) {
      fetchPaymentMethods();
    }
  }, [isFocused, route.params?.refreshCards]);

  const updateDefaultCard = async (cardId) => {
    try {
      const userId = auth.currentUser.uid;
      if (!userId) return;
  
      // First set all cards to default: false
      const batch = writeBatch(db);
      paymentMethods.forEach(function(card) {
        const cardRef = doc(db, 'users', userId, 'paymentMethods', card.id);
        batch.update(cardRef, { isDefault: false });
      });
      
      // Then set the selected card to default: true
      const selectedCardRef = doc(db, 'users', userId, 'paymentMethods', cardId);
      batch.update(selectedCardRef, { isDefault: true });
      
      await batch.commit();
      fetchPaymentMethods(); // Refresh the cards
    } catch (error) {
      console.error("Error updating default card:", error);
      Alert.alert("Error", "Failed to update default card. Please try again.");
    }
  };
  
  const showDefaultConfirmation = function(cardId) {
    Alert.alert(
      'Set as Default',
      'Do you want to set this card as your default payment method?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: function() { updateDefaultCard(cardId); },
          style: 'default',
        },
      ],
      {
        cancelable: true,
        userInterfaceStyle: 'light',
      }
    );
  };

  const handleDeleteCard = async (cardId) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      await deleteDoc(doc(db, 'users', userId, 'paymentMethods', cardId));
      setPaymentMethods(prev => prev.filter(card => card.id !== cardId));
    } catch (error) {
      console.error("Error deleting card:", error);
      Alert.alert("Error", "Failed to delete card. Please try again.");
    }
  };

  const handleShowMore = () => {
    setVisibleCount(prev => prev + 2);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Green header section */}
          <View style={styles.greenHeader}>
            <View style={styles.headerTopRow}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
              <View style={styles.headerIcons}>
                <Ionicons name="chatbox-ellipses" size={24} color="#fff" />
                <Ionicons name="notifications" size={24} color="#fff" />
              </View>
            </View>
          </View>
          
          {/* Profile Card */}
          <View style={styles.profileCardUpdated}>
            <View style={styles.profileRow}>
              <Image source={require('../assets/images/sampleUser.png')} style={styles.avatarLarge} />
                <View style={styles.profileInfo}>
                <Text style={styles.nameLarge}>{userData.firstName + " " + userData.lastName}</Text>
                <Text style={styles.emailLarge}>{userData.email}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('EditUserProfile')}>
                  <Text style={styles.editTextLarge}>Edit Profile</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.balanceSection}>
              <View style={styles.balanceBox}>
                <View style={{flexDirection:'row',  width:'50%'}}>
                  <MaterialCommunityIcons name="wallet" size={24} color="#fff" style={styles.balanceIconGreen} />
                  <View style={styles.balanceTextBlock}>
                    <Text style={styles.balanceLabelGreen}>Balance</Text>
                    <Text style={styles.balanceValueLarge}>P4100</Text>
                  </View>
                </View>
                <View style={{flexDirection:'row', width:'50%'}}>
                  <MaterialCommunityIcons name="currency-php" size={24} color="#8CC63F" style={styles.balanceIconWhite} />
                  <View style={styles.balanceTextBlock}>
                    <Text style={styles.balanceLabelGreen}>Cashback</Text>
                    <Text style={styles.balanceValueLarge}>P4100</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsRow}>
            <Action 
              icon="wallet" 
              label="My Wallet" 
              onPress={() => navigation.navigate('WalletScreen')} 
            />
            <Action 
            icon="barn" 
            label="My Barn" 
            onPress={() => navigation.navigate('FarmDashboard')} 
            />
            <Action icon="receipt" label="Orders" />
            <Action icon="history" label="History" />
            <Action icon="star-outline" label="Rate It" />
          </View>

          {/* Saved Card Section */}
          <SectionHeader title="Saved Card" />
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#A4DC4C" />
            </View>
          ) : (
            <>
              {paymentMethods.slice(0, visibleCount).map((card) => (
                <SwipeableCard 
                  key={card.id} 
                  card={card} 
                  onDelete={handleDeleteCard}
                  onSetDefault={showDefaultConfirmation}  
                />
              ))}

              <View style={styles.cardActionsContainer}>
                {paymentMethods.length > visibleCount ? (
                  <View style={styles.actionsRow2}>
                    <TouchableOpacity onPress={handleShowMore}>
                      <Text style={styles.showMoreText}>Show More</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('AddCardScreen', { 
                      onCardAdded: () => {
                        navigation.setParams({ refreshCards: true });
                      }
                    })}>
                      <Text style={styles.addCardText}>Add New Card +</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.singleActionContainer}>
                    <TouchableOpacity onPress={() => navigation.navigate('AddCardScreen', { 
                      onCardAdded: () => {
                        navigation.setParams({ refreshCards: true });
                      }
                    })}>
                      <Text style={styles.addCardText}>Add New Card +</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </>
          )}

          <SectionHeader title="Order Status" />
          {[
            {
              name: 'Sweet Tomato',
              desc: '1kg of Sweet Tomato from Garden',
              status: 'Now Harvesting...',
              icon: 'tanker-truck',
            },
            {
              name: 'Magestic Potato',
              desc: '1 Box of Magestic Potato from Garden',
              status: 'Ready for pick up at Bernadette Farm',
              icon: 'package-variant',
            },
            {
              name: 'Sweet Tomato',
              desc: '3kg of Sweet Tomato from Garden',
              status: 'Now Harvesting...',
              icon: 'tanker-truck',
            }
          ].map((item, idx) => (
            <Pressable 
              key={idx} 
              style={({ pressed }) => [
                styles.orderRow, 
                pressed && { opacity: 0.7 }
              ]}
              onPress={() => console.log('Pressed:', item.name)}
            >
              <Image source={productImages[idx]} style={styles.orderImg} />
              <View style={styles.orderText}>
                <Text style={styles.orderTitle}>{item.desc}</Text>
                <Text style={[
                  styles.orderSubtitle,
                  item.icon === 'package-variant' && { color: '#8CC63F' }
                ]}>
                  {item.status}
                </Text>
              </View>
              <MaterialCommunityIcons name={item.icon} size={24} color="#8CC63F" />
            </Pressable>
          ))}

          {/* Other Activities */}
          <SectionHeader title="Other Activities" />
          <View style={styles.otherActs}>
            {[{ label: 'My Favorites', icon: 'heart-outline' }, { label: 'Buy Again', icon: 'basket' }, { label: 'Hot Deals', icon: 'fire' }].map((item, idx) => (
              <TouchableOpacity key={idx} style={styles.otherRow}>
                <MaterialCommunityIcons name={item.icon} size={22} color="#8CC63F" />
                <Text style={styles.otherLabel}>  {item.label}</Text>
                <Ionicons name="chevron-forward" size={20} color="gray" />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const Action = memo(({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.action} onPress={onPress}>
    <MaterialCommunityIcons name={icon} size={24} color="#8CC63F" />
    <Text style={styles.actionText}>{label}</Text>
  </TouchableOpacity>
));

const SectionHeader = memo(({ title }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
));

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
  },
  greenHeader: {
    height: 170,
    backgroundColor: '#9DCD5A',
    borderBottomLeftRadius: 30,
    paddingTop: 16,
    position: 'absolute',
    width: '100%',
    paddingHorizontal: 20,
  },
  headerTopRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  headerIcons: { 
    flexDirection: 'row', 
    width: 60, 
    justifyContent: 'space-between' 
  },
  scrollContent: { 
    paddingBottom: 20 
  },
  profileCardUpdated: {
    backgroundColor: '#fff',
    borderRadius: 24,
    marginHorizontal: 20,
    padding: 16,
    elevation: 3,
    marginTop: 50,
  },
  profileRow: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  avatarLarge: { 
    width: 70, 
    height: 70, 
    borderRadius: 12 
  },
  profileInfo: { 
    flex: 1, 
    marginLeft: 16 
  },
  nameLarge: { 
    fontSize: 14, 
    fontFamily: 'Poppins-Bold',
    marginTop: 5,
  },
  emailLarge: { 
    fontSize: 12, 
    color: 'gray',  
    fontFamily: 'Poppins-Regular',
    padding: 0,
  },
  editTextLarge: { 
    color: '#08A647',     
    fontFamily: 'Poppins-Bold',
    fontSize: 12,
  },
  balanceSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  balanceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 12,
    width: '100%',
    justifyContent: 'space-between',
  },
  balanceIconGreen: {
    backgroundColor: '#9DCD5A',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
  },
  balanceIconWhite: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
  },
  balanceLabelGreen: { 
    fontSize: 12, 
    color: '#08A647', 
    fontFamily: 'Poppins-Bold',
  },
  balanceValueLarge: { 
    fontSize: 16, 
    fontFamily: 'Poppins-SemiBold', 
    color: '#000' 
  },
  actionsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginVertical: 20,
    marginHorizontal: 20, 
  },
  action: { 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    paddingHorizontal: 8, 
    paddingVertical: 10, 
    borderRadius: 5, 
    elevation: 1, 
    width: 65,
  },
  actionText: { 
    fontSize: 9, 
    color: 'black', 
    marginTop: 4,
    fontFamily: 'Poppins-Regular', 
  },
  sectionTitle: { 
    marginHorizontal: 20, 
    fontSize: 16, 
    fontFamily: 'Poppins-Bold',
    marginBottom: 8 
  },
  swipeableContainer: {
    marginHorizontal: 20,
    marginBottom: 8,
  },
  savedCard: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    paddingHorizontal: 20, 
    paddingVertical: 15, 
    borderRadius: 5, 
    alignItems: 'center', 
    elevation: 1 
  },
  savedIconName: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  cardNumber: { 
    fontSize: 14, 
    fontWeight: 'bold' 
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
  deleteButton: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  actionButtonContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'Poppins-Medium',
  },
  addCardText: { 
    marginTop: 15, 
    color: '#353830',
    textAlign: 'right',
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
  },
  orderRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginHorizontal: 16, 
    backgroundColor: '#fff', 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 8, 
    elevation: 1 
  },
  orderImg: { 
    width: 45, 
    height: 45, 
    borderRadius: 50
  },
  orderText: { flex: 1, marginLeft: 12 },
  orderTitle: { 
    fontSize: 14, 
    fontFamily: 'Poppins-SemiBold', 
    marginTop: 2
  },
  orderSubtitle: { 
    fontSize: 12, 
    color: 'gray',
    fontFamily: 'Poppins-Regular', 
  },
  otherRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 15, 
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0', 
  },
  otherLabel: { 
    fontSize: 14, 
    marginTop: 3,
    flex: 1, 
    color: 'black',
    fontFamily: 'Poppins-Medium', 
  },
  otherActs: {
    backgroundColor: '#fff', 
    marginHorizontal: 16,
    borderWidth: .1,
    borderColor: 'grey',
    borderRadius: 10,
    elevation: 1, 
    backgroundColor: 'white',
    borderRadius: 8, 
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardActionsContainer: {
    marginTop: 15,
    marginHorizontal: 20,
  },
  
  actionsRow2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  singleActionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  
  showMoreText: {
    color: '#08A647',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  
  addCardText: { 
    color: '#353830',
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
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
  rightActionsContainer: {
    flexDirection: 'row',
  },
  setDefaultButton: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9DCD5A',
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
  },
  
});