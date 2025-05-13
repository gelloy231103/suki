import React, { useState, useEffect } from 'react';
import MapView, { Marker } from 'react-native-maps';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  Dimensions,
  Animated,
  Easing,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableWithoutFeedback
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';


const FocusedProductScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [voucher, setVoucher] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [product, setProduct] = useState(null);
  const [farm, setFarm] = useState(null);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [user, setUser] = useState(null);
  const scaleValue = new Animated.Value(1);

  // Get product and farm data from Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const productId = route.params?.productId;
        if (!productId) {
          console.error('No product ID provided');
          return;
        }

        // Fetch product
        const productRef = doc(db, 'products', productId);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          const productData = productSnap.data();
          setProduct({
            id: productSnap.id,
            ...productData,
            formattedPrice: `₱${productData.price.toFixed(2)}${productData.unit ? `/${productData.unit.toLowerCase()}` : ''}`,
            discountPrice: productData.discount?.percentage 
              ? `₱${(productData.price * (1 - productData.discount.percentage/100)).toFixed(2)}`
              : null
          });

          // Fetch farm if available
          if (productData.farmId) {
            const farmRef = doc(db, 'farms', productData.farmId);
            const farmSnap = await getDoc(farmRef);
            if (farmSnap.exists()) {
              setFarm(farmSnap.data());
            }
          }
        } else {
          console.error('Product not found');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserData = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          setUser(userSnap.data());
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();

    fetchData();
  }, [route.params?.productId]);

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true
      })
    ]).start();
  };

  const handleDecrease = () => {
    if (quantity > (product?.minimumOrder || 1)) {
      setQuantity(quantity - 1);
      animateButton();
    }
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
    animateButton();
  };

  const addToCart = () => {
    if (!product) return;
    
    navigation.navigate('CartScreen', { 
      cartItem: {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        unit: product.unit,
        image: product.images?.[0] || null,
        farmId: product.farmId
      }
    });
  };

  const handleBuyNow = () => {
  if (!product) return;
    
    // Only set default delivery option if none is selected
    if (!deliveryOption && product.deliveryOptions) {
      if (product.deliveryOptions.pickup) {
        setDeliveryOption('pickup');
      } else if (product.deliveryOptions.delivery) {
        setDeliveryOption('delivery');
      } else if (product.deliveryOptions.shipping) {
        setDeliveryOption('shipping');
      }
    }
    
    setShowOrderSummary(true);
  };

  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Icon key={i} name="star" size={20} color="#FFD700" />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <Icon key={i} name="star-half" size={20} color="#FFD700" />
        );
      } else {
        stars.push(
          <Icon key={i} name="star-border" size={20} color="#E0E0E0" />
        );
      }
    }
    
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  const renderDeliveryOptions = () => {
    if (!product?.deliveryOptions) return null;

    return (
      <View style={styles.deliveryOptionsContainer}>
        <Text style={styles.sectionTitle}>Delivery Options</Text>
        <View style={styles.optionsRow}>
          {product.deliveryOptions.pickup && (
            <TouchableOpacity
              style={[
                styles.optionButton,
                deliveryOption === 'pickup' && styles.selectedOption
              ]}
              onPress={() => setDeliveryOption('pickup')}
            >
              <Icon 
                name="store" 
                size={20} 
                color={deliveryOption === 'pickup' ? '#FFF' : '#9DCD5A'} 
              />
              <Text style={[
                styles.optionText,
                deliveryOption === 'pickup' && styles.selectedOptionText
              ]}>
                Pickup
              </Text>
            </TouchableOpacity>
          )}
          
          {product.deliveryOptions.delivery && (
            <TouchableOpacity
              style={[
                styles.optionButton,
                deliveryOption === 'delivery' && styles.selectedOption
              ]}
              onPress={() => setDeliveryOption('delivery')}
            >
              <Icon 
                name="local-shipping" 
                size={20} 
                color={deliveryOption === 'delivery' ? '#FFF' : '#9DCD5A'} 
              />
              <Text style={[
                styles.optionText,
                deliveryOption === 'delivery' && styles.selectedOptionText
              ]}>
                Delivery
              </Text>
            </TouchableOpacity>
          )}
          
          {product.deliveryOptions.shipping && (
            <TouchableOpacity
              style={[
                styles.optionButton,
                deliveryOption === 'shipping' && styles.selectedOption
              ]}
              onPress={() => setDeliveryOption('shipping')}
            >
              <Icon 
                name="flight" 
                size={20} 
                color={deliveryOption === 'shipping' ? '#FFF' : '#9DCD5A'} 
              />
              <Text style={[
                styles.optionText,
                deliveryOption === 'shipping' && styles.selectedOptionText
              ]}>
                Shipping
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        {deliveryOption && (
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Icon name="calendar-today" size={18} color="#9DCD5A" />
            <Text style={styles.datePickerText}>
              {deliveryDate.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderOrderSummary = () => {
    if (!product) return null;

    const subtotal = product.price * quantity;
    const discount = product.discount?.percentage ? subtotal * (product.discount.percentage / 100) : 0;
    const total = subtotal - discount;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showOrderSummary}
        onRequestClose={() => setShowOrderSummary(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowOrderSummary(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Order Summary</Text>
            <TouchableOpacity onPress={() => setShowOrderSummary(false)}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {/* Product Info */}
            <View style={styles.summaryItem}>
              <Image
                source={{ uri: product.images?.[0] || '' }}
                style={styles.summaryImage}
                resizeMode="cover"
              />
              <View style={styles.summaryDetails}>
                <Text style={styles.summaryName}>{product.name}</Text>
                <Text style={styles.summaryPrice}>₱{product.price.toFixed(2)}/{product.unit}</Text>
                <Text style={styles.summaryQuantity}>Qty: {quantity}</Text>
              </View>
            </View>
            
            {/* Delivery Option */}
            <View style={styles.summarySection}>
              <Text style={styles.summaryLabel}>Delivery Method</Text>
              <View style={styles.deliveryMethod}>
                <Icon 
                  name={
                    deliveryOption === 'pickup' ? 'store' :
                    deliveryOption === 'delivery' ? 'local-shipping' : 'flight'
                  } 
                  size={20} 
                  color="#9DCD5A" 
                />
                <Text style={styles.deliveryText}>
                  {deliveryOption === 'pickup' ? 'Pickup' :
                   deliveryOption === 'delivery' ? 'Local Delivery' : 'Shipping'}
                </Text>
              </View>
              <Text style={styles.deliveryDate}>
                Scheduled for {deliveryDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </View>
            
            {/* Price Breakdown */}
            <View style={styles.summarySection}>
              <Text style={styles.summaryLabel}>Price Breakdown</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Subtotal:</Text>
                <Text style={styles.priceValue}>₱{subtotal.toFixed(2)}</Text>
              </View>
              {discount > 0 && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Discount ({product.discount.percentage}%):</Text>
                  <Text style={[styles.priceValue, styles.discountValue]}>-₱{discount.toFixed(2)}</Text>
                </View>
              )}
              <View style={[styles.priceRow, styles.totalRow]}>
                <Text style={[styles.priceLabel, styles.totalLabel]}>Total:</Text>
                <Text style={[styles.priceValue, styles.totalValue]}>₱{total.toFixed(2)}</Text>
              </View>
            </View>
            
            <View style={styles.summarySection}>
              <Text style={styles.summaryLabel}>Buyer Information</Text>
              <View style={styles.infoRow}>
                <Icon name="person" size={18} color="#9DCD5A" />
                <Text style={styles.infoText}>
                  {user?.firstName} {user?.lastName}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="phone" size={18} color="#9DCD5A" />
                <Text style={styles.infoText}>
                  {user?.phone || 'No phone number provided'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="email" size={18} color="#9DCD5A" />
                <Text style={styles.infoText}>
                  {auth.currentUser?.email || 'No email provided'}
                </Text>
              </View>
              {deliveryOption !== 'pickup' && (
                <View style={styles.infoRow}>
                  <Icon name="home" size={18} color="#9DCD5A" />
                  <Text style={styles.infoText}>
                    {user?.addresses ? `${user.addresses.street}, ${user.addresses.city}, ${user.addresses.province}` : 'No address provided'}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={() => {
              setShowOrderSummary(false);
              navigation.navigate('Payment', { 
                order: {
                  product: {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    unit: product.unit,
                    discount: product.discount,
                    images: product.images,
                    stock: product.stock,
                    farmId: product.farmId
                  },
                  quantity,
                  deliveryOption,
                  deliveryDate,
                  subtotal: product.price * quantity,
                  total: (product.price * quantity) - (product.discount?.percentage ? 
                    (product.price * quantity * (product.discount.percentage / 100)) : 0)
                }
              });
            }}
            >
              <Text style={styles.confirmButtonText}>CONFIRM ORDER</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9DCD5A" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={48} color="#FF5252" />
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Details</Text>
          <View style={{ width: 24 }} /> {/* Spacer */}
        </View>

        {/* Product Images Carousel */}
        <View style={styles.imageCarousel}>
          {product.images?.length > 0 ? (
            <Image
              source={{ uri: product.images[activeImageIndex] }}
              style={styles.productImage}
              resizeMode="contain"
            />
          ) : (
            <View style={[styles.productImage, styles.emptyImage]}>
              <Icon name="image" size={48} color="#9DCD5A" />
            </View>
          )}
          
          {/* Image Dots */}
          {product.images?.length > 1 && (
            <View style={styles.dotsContainer}>
              {product.images.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setActiveImageIndex(index)}
                >
                  <View style={[
                    styles.dot,
                    index === activeImageIndex && styles.dotActive
                  ]} />
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {product.discount?.percentage && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{product.discount.percentage}% OFF</Text>
            </View>
          )}
        </View>

        {/* Product Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.titleRow}>
            <Text 
              style={styles.productName}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {product.name}
            </Text>
            <Text style={styles.productPrice}>
              {product.discountPrice ? (
                <>
                  <Text style={styles.discountedPrice}>{product.discountPrice}</Text>
                  <Text style={styles.originalPrice}> {product.formattedPrice}</Text>
                </>
              ) : (
                product.formattedPrice
              )}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.ratingContainer}>
              {renderRatingStars(product.rating?.average || 0)}
              <Text style={styles.reviewText}>
                ({product.rating?.count || 0} reviews)
              </Text>
            </View>
            <Text style={styles.stockText}>
              {product.stock} {product.unit.toLowerCase()} available
            </Text>
          </View>

          {/* Product Info Sections */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.productDescription}>
              {product.description || 'No description available'}
            </Text>
          </View>

          {product.tags?.length > 0 && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagsContainer}>
                {product.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Quantity Selector */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantityRow}>
              <View style={styles.quantityContainer}>
                <TouchableOpacity 
                  onPress={handleDecrease}
                  style={[
                    styles.quantityButton,
                    quantity <= (product.minimumOrder || 1) && styles.disabledButton
                  ]}
                  disabled={quantity <= (product.minimumOrder || 1)}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.quantityInput}
                  value={quantity.toString()}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    const num = parseInt(text) || 0;
                    if (num >= (product.minimumOrder || 1)) {
                      setQuantity(num);
                    }
                  }}
                />
                <TouchableOpacity 
                  onPress={handleIncrease}
                  style={styles.quantityButton}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.unitText}>{product.unit.toLowerCase()}</Text>
            </View>
          </View>

          {/* Delivery Options */}
          {renderDeliveryOptions()}

          {/* Farm Location */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Farm Information</Text>
            <View style={styles.farmInfo}>
              <Icon name="home" size={20} color="#9DCD5A" />
              <Text style={styles.farmName}>{farm?.name || product.farmId || 'Local Farm'}</Text>
            </View>
            
            {farm?.location && (
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: farm.location.latitude || 14.670605106704915,
                  longitude: farm.location.longitude || 121.33927325892779,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
              >
                <Marker
                  coordinate={{ 
                    latitude: farm.location.latitude || 14.670605106704915, 
                    longitude: farm.location.longitude || 121.33927325892779 
                  }}
                  title={farm?.name || 'Local Farm'}
                  description={product.name}
                />
              </MapView>
            )}
            
            <TouchableOpacity style={styles.chatButton}>
              <Icon name="chat" size={20} color="#9DCD5A" style={styles.chatIcon} />
              <Text style={styles.chatButtonText}>Chat with Farm</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Spacer for bottom buttons */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* Fixed Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity 
          style={styles.addToCartButton}
          onPress={addToCart}
        >
          <Icon name="shopping-cart" size={20} color="#FFF" />
          <Text style={styles.addToCartText}>ADD TO CART</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.buyNowButton}
          onPress={handleBuyNow}
        >
          <Text style={styles.buyNowText}>BUY NOW</Text>
        </TouchableOpacity>
      </View>

      {/* Order Summary Modal */}
      {renderOrderSummary()}

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={deliveryDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setDeliveryDate(selectedDate);
            }
          }}
        />
      )}
    </KeyboardAvoidingView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContent: {
    paddingBottom: 100, // Space for bottom buttons
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#333',
    marginTop: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#9DCD5A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  imageCarousel: {
    height: width * 0.8,
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  emptyImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 16,
    flexDirection: 'row',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#9DCD5A',
    width: 16,
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FF5252',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  detailsContainer: {
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productName: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  productPrice: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#9DCD5A',
    textAlign: 'right',
  },
  discountedPrice: {
    color: '#FF5252',
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    color: '#888',
    fontSize: 14,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  reviewText: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'Poppins-Regular',
  },
  stockText: {
    fontSize: 12,
    color: '#4CAF50',
    fontFamily: 'Poppins-SemiBold',
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  productDescription: {
    fontSize: 14,
    color: '#555',
    fontFamily: 'Poppins-Regular',
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#4CAF50',
    fontFamily: 'Poppins-SemiBold',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#9DCD5A',
    borderRadius: 8,
    overflow: 'hidden',
  },
  quantityButton: {
    backgroundColor: '#9DCD5A',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  disabledButton: {
    backgroundColor: '#CCC',
  },
  quantityInput: {
    width: 50,
    height: 40,
    textAlign: 'center',
    backgroundColor: '#fff',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#9DCD5A',
    fontFamily: 'Poppins-Regular',
  },
  unitText: {
    fontSize: 14,
    color: '#888',
    fontFamily: 'Poppins-Regular',
  },
  deliveryOptionsContainer: {
    marginBottom: 24,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#9DCD5A',
    marginHorizontal: 4,
  },
  selectedOption: {
    backgroundColor: '#9DCD5A',
  },
  optionText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#9DCD5A',
    marginLeft: 8,
  },
  selectedOptionText: {
    color: '#FFF',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#9DCD5A',
    backgroundColor: '#FFF',
  },
  datePickerText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#9DCD5A',
    marginLeft: 8,
  },
  farmInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  farmName: {
    fontSize: 14,
    color: '#9DCD5A',
    fontFamily: 'Poppins-SemiBold',
    marginLeft: 8,
  },
  map: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 16,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#9DCD5A',
    borderRadius: 8,
    paddingVertical: 12,
  },
  chatIcon: {
    marginRight: 8,
  },
  chatButtonText: {
    color: '#9DCD5A',
    fontFamily: 'Poppins-SemiBold',
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#333',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 14,
    marginRight: 8,
  },
  addToCartText: {
    color: '#FFF',
    fontFamily: 'Poppins-SemiBold',
    marginLeft: 8,
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: '#9DCD5A',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 14,
  },
  buyNowText: {
    color: '#FFF',
    fontFamily: 'Poppins-SemiBold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#333',
  },
  modalContent: {
    padding: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  summaryImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  summaryDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  summaryName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  summaryPrice: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#9DCD5A',
    marginBottom: 4,
  },
  summaryQuantity: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#888',
  },
  summarySection: {
    marginBottom: 24,
  },
  summaryLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  deliveryMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliveryText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    marginLeft: 8,
  },
  deliveryDate: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#888',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#555',
  },
  priceValue: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
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
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#555',
    marginLeft: 8,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  confirmButton: {
    backgroundColor: '#9DCD5A',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFF',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
});

export default FocusedProductScreen;