import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Animated, 
  Dimensions, 
  Image,
  ScrollView,
  Easing
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Swiper from 'react-native-swiper';

const { width } = Dimensions.get('window');
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

const Wallet = () => {
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

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header Section */}
        <View style={styles.headContainer}>
          <View style={styles.headerTopRow}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
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
                  ₱{showBalance ? '300.25' : '••••.••'}
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
              onPress={animateTopUp}
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
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  scrollContainer: {
    paddingBottom: 30,
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
});

export default Wallet;