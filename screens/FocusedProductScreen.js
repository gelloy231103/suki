import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, TextInput, Animated, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const productImages = [
  require('../assets/tomatoes.png'),
  require('../assets/turnip.png'),
  require('../assets/onions.png'),
];

const FocusedProductScreen = ({ route }) => {
  const navigation = useNavigation();
  const [quantity, setQuantity] = useState(2);
  const [voucherCode, setVoucherCode] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollX = new Animated.Value(0);

  const { product } = route.params || {
    name: 'Sweet Tomatoes',
    price: 80,
    rating: 4,
    reviews: 354,
    farm: 'Tadhana Farm Ville',
    description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry...'
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  const toggleSummary = () => setShowSummary(!showSummary);

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Icon 
            key={i}
            name={i <= product.rating ? 'star' : 'star-border'}
            size={20}
            color={i <= product.rating ? '#FFD700' : '#CCCCCC'}
          />
        ))}
      </View>
    );
  };

  const renderImagePagination = () => {
    return (
      <View style={styles.pagination}>
        {productImages.map((_, i) => (
          <View 
            key={i}
            style={[
              styles.paginationDot,
              currentImageIndex === i && styles.paginationDotActive
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#403F3F" />
        </TouchableOpacity>

        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIcon}>
            <Icon name="message" size={24} color="#403F3F" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Icon name="shopping-bag" size={24} color="#403F3F" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Image Gallery */}
        <View style={styles.imageGalleryContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(index);
            }}
          >
            {productImages.map((image, index) => (
              <Image
                key={index}
                source={image}
                style={styles.productImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          {renderImagePagination()}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>

          <View style={styles.ratingContainer}>
            {renderStars()}
            <Text style={styles.reviewText}>{product.reviews} reviews</Text>
          </View>

          <Text style={styles.productPrice}>{product.price}</Text>
          <Text style={styles.productDescription}>{product.description}</Text>
        </View>

        {/* Quantity Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.quantitySelector}>
            <TouchableOpacity
              onPress={decrementQuantity}
              style={styles.quantityButton}
            >
              <Icon name="remove" size={20} color="#9DCD5A" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              onPress={incrementQuantity}
              style={styles.quantityButton}
            >
              <Icon name="add" size={20} color="#9DCD5A" />
            </TouchableOpacity>
            <Text style={styles.quantityUnit}>kg</Text>
          </View>
        </View>

        {/* Voucher Code */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voucher Code</Text>
          <View style={styles.voucherContainer}>
            <TextInput
              style={styles.voucherInput}
              placeholder="Enter voucher code"
              value={voucherCode}
              onChangeText={setVoucherCode}
            />
            <TouchableOpacity style={styles.applyButton}>
              <Text style={styles.applyButtonText}>APPLY</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Farm Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Farm Location</Text>
          <View style={styles.farmLocation}>
            <Text style={styles.farmName}>{product.farm}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.chatButton}>
            <Text style={styles.chatButtonText}>Chat Farm</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buyButton} onPress={toggleSummary}>
            <Text style={styles.buyButtonText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Order Summary Modal */}
      {showSummary && (
        <View style={styles.modalOverlay}>
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Order Summary</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Price:</Text>
              <Text style={styles.summaryValue}>
                P{product.price * quantity}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Quantity:</Text>
              <Text style={styles.summaryValue}>{quantity} kg</Text>
            </View>

            {voucherCode && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount:</Text>
                <Text style={styles.summaryValue}>
                  -P{(product.price * quantity * 0.1).toFixed(2)}
                </Text>
              </View>
            )}

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping:</Text>
              <Text style={styles.summaryValue}>P50.00</Text>
            </View>

            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={[styles.summaryLabel, styles.totalLabel]}>
                Total:
              </Text>
              <Text style={[styles.summaryValue, styles.totalValue]}>
                P
                {(
                  product.price * quantity -
                  (voucherCode ? product.price * quantity * 0.1 : 0) +
                  50
                ).toFixed(2)}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={() => {
                navigation.navigate("CheckOut"); // This navigates to CheckOutScreen
                setShowSummary(false); // This closes the modal
              }}
            >
              <Text style={styles.checkoutButtonText}>Check Out</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={toggleSummary}
            >
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#F9F9F9',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  headerIcon: {
    marginLeft: 16,
  },
  content: {
    paddingBottom: 20,
  },
  imageGalleryContainer: {
    height: 300,
    position: 'relative',
  },
  productImage: {
    width,
    height: 300,
  },
  pagination: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CCC',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#9DCD5A',
    width: 16,
  },
  productInfo: {
    padding: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#403F3F',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  reviewText: {
    fontSize: 14,
    color: '#666',
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9DCD5A',
    marginBottom: 16,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  section: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#403F3F',
    marginBottom: 12,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#9DCD5A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 18,
    marginHorizontal: 16,
    color: '#403F3F',
  },
  quantityUnit: {
    fontSize: 16,
    marginLeft: 8,
    color: '#666',
  },
  voucherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voucherInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  applyButton: {
    backgroundColor: '#9DCD5A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  applyButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  farmLocation: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  farmName: {
    fontSize: 16,
    color: '#403F3F',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 8,
  },
  chatButton: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#9DCD5A',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginRight: 8,
  },
  chatButtonText: {
    color: '#9DCD5A',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buyButton: {
    flex: 1,
    backgroundColor: '#9DCD5A',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryContainer: {
    backgroundColor: '#FFF',
    width: '90%',
    borderRadius: 12,
    padding: 20,
    position: 'relative',
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#403F3F',
    marginBottom: 20,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 12,
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    color: '#403F3F',
    fontWeight: 'bold',
  },
  totalLabel: {
    fontSize: 18,
  },
  totalValue: {
    fontSize: 18,
    color: '#9DCD5A',
  },
  checkoutButton: {
    backgroundColor: '#9DCD5A',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  checkoutButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 8,
  },
});

export default FocusedProductScreen;