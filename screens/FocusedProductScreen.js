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
  Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const defaultImage = require('../assets/tomatoes.png');

const FocusedProductScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [voucher, setVoucher] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const scaleValue = new Animated.Value(1);
  const [product, setProduct] = useState(route.params?.product);
  const scrollViewRef = React.useRef();

  // Helper function to safely format unit
  const formatUnit = (unit) => {
    return (unit || 'piece').toLowerCase();
  };

  // Helper function to get image source
  const getImageSource = (image) => {
    try {
      if (!image) return defaultImage;
      if (typeof image === 'number') return image;
      if (typeof image === 'string') return { uri: image };
      if (image.uri) return image;
      return defaultImage;
    } catch (error) {
      return defaultImage;
    }
  };

  // Get product data from Firebase
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productId = route.params?.productId;
        if (product) {
          // If product was passed via params, use that
          setLoading(false);
          return;
        }

        if (!productId) {
          console.error('No product ID provided');
          return;
        }

        const productRef = doc(db, 'products', productId);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          const productData = {
            id: productSnap.id,
            ...productSnap.data(),
            formattedPrice: `₱${productSnap.data().price.toFixed(2)}/${productSnap.data().unit.toLowerCase()}`,
            discountPrice: productSnap.data().discount?.percentage 
              ? `₱${(productSnap.data().price * (1 - productSnap.data().discount.percentage/100)).toFixed(2)}`
              : null
          };
          setProduct(productData);
          
          // Also fetch farm data if needed
          if (productData.farmId) {
            const farmRef = doc(db, 'farms', productData.farmId);
            const farmSnap = await getDoc(farmRef);
            if (farmSnap.exists()) {
              setProduct(prev => ({
                ...prev,
                farmName: farmSnap.data().farmName || farmSnap.data().name,
              }));
            }
          }
        } else {
          console.error('Product not found');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [route.params?.productId, product]);

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
    if (!product) {
      Alert.alert('Error', 'Product information not available');
      return;
    }
    
    const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    
    const cartItem = {
      farmId: product.farmId || 'unknown',
      farmName: product.farmName || product.farm || 'Unknown Farm',
      productId: product.id,
      productName: product.name,
      variant: `${quantity} ${formatUnit(product.unit)}`,
      price: price || 0,
      quantity: quantity,
      image: product.images?.[0] || product.image || require('../assets/tomatoes.png')
    };

    Alert.alert(
      'Added to Cart',
      `${quantity} ${formatUnit(product.unit)} of ${product.name} has been added to your cart`,
      [
        { 
          text: 'OK', 
          onPress: () => {
            navigation.navigate('CartScreen', { 
              cartItems: [cartItem],
              merge: true
            });
          }
        }
      ]
    );
  };

  const handleBuyNow = () => {
    if (!product) {
      Alert.alert('Error', 'Product information not available');
      return;
    }

    const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    
    const cartItem = {
      farmId: product.farmId || 'unknown',
      farmName: product.farmName || product.farm || 'Unknown Farm',
      productId: product.id,
      productName: product.name,
      variant: `${quantity} ${formatUnit(product.unit)}`,
      price: price || 0,
      quantity: quantity,
      image: product.images?.[0] || product.image || require('../assets/tomatoes.png')
    };

    Alert.alert(
      'Proceed to Checkout',
      `Buy ${quantity} ${formatUnit(product.unit)} of ${product.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('CartScreen', { 
              cartItems: [cartItem],
              merge: true
            });
            navigation.reset({
              index: 0,
              routes: [
                { name: 'CartScreen', params: { cartItems: [cartItem], merge: true } },
                { name: 'CheckOut' }
              ],
            });
          }
        }
      ]
    );
  };

  const navigateToCart = () => {
    navigation.navigate('CartScreen');
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
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header with Search */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for products..."
            placeholderTextColor="#888"
          />
          <TouchableOpacity 
            style={styles.cartIcon}
            onPress={navigateToCart}
          >
            <Icon name="shopping-cart" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Product Images Carousel */}
        <View style={styles.imageCarousel}>
          {product.images && product.images.length > 0 ? (
            <Image
              source={getImageSource(product.images[activeImageIndex])}
              style={styles.productImage}
              resizeMode="contain"
              defaultSource={defaultImage}
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
          
          <TouchableOpacity 
            style={styles.heartIcon}
            onPress={animateButton}
          >
            <Icon name="favorite" size={24} color="#FF5252" />
          </TouchableOpacity>
          
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

          <View style={styles.ratingRow}>
            {renderRatingStars(product.rating?.average || 3.4)}
            <Text style={styles.reviewText}>
              ({product.rating?.count || 32} reviews)
            </Text>
            <Text style={styles.stockText}>
              • {product.stock} {formatUnit(product.unit)} available
            </Text>
          </View>

          <Text style={styles.productDescription}>
            {product.description || 'No description available'}
          </Text>

          {product.tags?.length > 0 && (
            <View style={styles.tagsContainer}>
              {product.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantityRow}>
              <View style={styles.quantityContainer}>
                <View style={styles.quantityControls}>
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
              </View>
              <Text style={styles.unitText}>{formatUnit(product.unit)}</Text>
            </View>
          </View>

          {/* Voucher Section */}
          <View style={styles.voucherSection}>
            <Text style={styles.sectionTitle}>Apply Voucher</Text>
            <View style={styles.voucherInputContainer}>
              <TextInput
                style={styles.voucherInput}
                placeholder="Enter voucher code"
                placeholderTextColor="#888"
                value={voucher}
                onChangeText={setVoucher}
                onSubmitEditing={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
              />
              <TouchableOpacity style={styles.applyButton}>
                <Text style={styles.applyButtonText}>APPLY</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Farm Location */}
          <View style={styles.farmSection}>
            <Text style={styles.sectionTitle}>Farm Location</Text>
            <View style={styles.farmInfo}>
              <Icon name="home" size={20} color="#9DCD5A" />
              <Text style={styles.farmName}>{product.farmName || product.farm || 'Tadhana Farm Ville'}</Text>
            </View>
            
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: 14.670605106704915,
                longitude: 121.33927325892779,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker
                coordinate={{ latitude: 14.670605106704915, longitude: 121.33927325892779 }}
                title={product.farmName || product.farm || 'Local Farm'}
                description={product.name}
              />
            </MapView>
            
            <TouchableOpacity style={styles.chatButton}>
              <Icon name="chat" size={20} color="#9DCD5A" style={styles.chatIcon} />
              <Text style={styles.chatButtonText}>Chat with Farm</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Fixed Bottom Buttons */}
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
    </KeyboardAvoidingView>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContent: {
    paddingTop: 20,
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
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    marginTop: Platform.OS === 'ios' ? 30 : 0,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginHorizontal: 12,
    fontFamily: 'Poppins-Regular',
  },
  cartIcon: {
    padding: 4,
  },
  imageCarousel: {
    height: width * 0.8,
    maxHeight: 400,
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
  heartIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    padding: 8,
    zIndex: 1,
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
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
    maxWidth: '70%',
  },
  productPrice: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#9DCD5A',
    textAlign: 'right',
    flexShrink: 1,
  },
  discountedPrice: {
    color: '#FF5252',
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    color: '#888',
    fontSize: 14,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  reviewText: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'Poppins-Regular',
    marginRight: 12,
  },
  stockText: {
    fontSize: 12,
    color: '#4CAF50',
    fontFamily: 'Poppins-Regular',
  },
  productDescription: {
    fontSize: 14,
    color: '#555',
    fontFamily: 'Poppins-Regular',
    lineHeight: 22,
    marginBottom: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
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
  quantitySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityContainer: {
    alignItems: 'flex-start',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#9DCD5A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  quantityButton: {
    backgroundColor: '#9DCD5A',
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  disabledButton: {
    backgroundColor: '#CCC',
  },
  quantityInput: {
    width: 35,
    height: 35,
    textAlign: 'center',
    backgroundColor: '#fff',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#9DCD5A',
  },
  unitText: {
    fontSize: 14,
    color: '#888',
    fontFamily: 'Poppins-Regular',
  },
  voucherSection: {
    marginBottom: 24,
  },
  voucherInputContainer: {
    flexDirection: 'row',
  },
  voucherInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontFamily: 'Poppins-Regular',
  },
  applyButton: {
    backgroundColor: '#9DCD5A',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginLeft: 8,
    borderRadius: 8,
  },
  applyButtonText: {
    color: '#FFF',
    fontFamily: 'Poppins-SemiBold',
  },
  farmSection: {
    marginBottom: 24,
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
    flexShrink: 1,
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
    backgroundColor: '9DCD5A',
    color: '#FFFF',
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
  spacer: {
    height: 100, // Space for bottom buttons
  },
});

export default FocusedProductScreen;