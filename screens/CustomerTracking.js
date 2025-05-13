import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import MapView, { Marker } from 'react-native-maps';
import { useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';


const CustomerTracking = ({ navigation }) => {
  const route = useRoute();
  const [order, setOrder] = useState(route.params?.order || null);
  const [product, setProduct] = useState(route.params?.product || null);
  const [farm, setFarm] = useState(route.params?.farm || null);
  const [user, setUser] = useState(route.params?.user || null);
  const [loading, setLoading] = useState(!route.params?.order);
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  const statusSteps = [
    { title: 'Order Placed', icon: 'cart', description: 'Your order has been received' },
    { title: 'Processing', icon: 'cog', description: 'Farmer is preparing your order' },
    { title: 'On Delivery', icon: 'truck-delivery', description: 'Your order is on the way' },
    { title: 'Delivered', icon: 'check-circle', description: 'Order successfully delivered' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (route.params?.order) {
        // Data was passed from previous screen
        setCurrentStep(getStatusIndex(route.params.order.status));
        startAnimations();
        return;
      }

      try {
        const orderId = route.params?.orderId;
        if (!orderId) return;

        // Fetch order details
        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists()) {
          const orderData = orderSnap.data();
          setOrder(orderData);
          setCurrentStep(getStatusIndex(orderData.status));

          // Fetch product details if not passed
          if (!route.params?.product) {
            const productRef = doc(db, 'products', orderData.productId);
            const productSnap = await getDoc(productRef);
            if (productSnap.exists()) setProduct(productSnap.data());
          }

          // Fetch farm details if not passed
          if (!route.params?.farm) {
            const farmRef = doc(db, 'farms', orderData.farmId);
            const farmSnap = await getDoc(farmRef);
            if (farmSnap.exists()) setFarm(farmSnap.data());
          }

          // Fetch user details if not passed
          if (!route.params?.user) {
            const userRef = doc(db, 'users', orderData.userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) setUser(userSnap.data());
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
        startAnimations();
      }
    };

    const getStatusIndex = (status) => {
      return Math.max(0, ['processing', 'preparing', 'onDelivery', 'delivered']
        .indexOf(status?.toLowerCase()));
    };

    const startAnimations = () => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.back(1)),
          useNativeDriver: true,
        })
      ]).start();
    };

    fetchData();
  }, [route.params]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9DCD5A" />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Order not found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <Animated.View 
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          {/* Order Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Order #{order.orderId}</Text>
            <Text style={styles.headerSubtitle}>
              {order.createdAt?.toDate().toLocaleDateString()}
            </Text>
          </View>

                  {/* Product Card */}
        <View style={styles.card}>
          <View style={styles.productInfo}>
            {product?.imageUrl ? (
              <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
            ) : (
              <View style={[styles.productImage, styles.productImagePlaceholder]}>
                <Ionicons name="leaf" size={32} color="#9DCD5A" />
              </View>
            )}
            <View style={styles.productDetails}>
              <Text style={styles.productName}>{product?.name || 'Product'}</Text>
              <Text style={styles.productPrice}>₱{order.price.toFixed(2)}</Text>
              <Text style={styles.productQuantity}>
                {order.quantity} {product?.unit || 'item'}{order.quantity > 1 ? 's' : ''}
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.farmInfo}>
            <MaterialCommunityIcons name="farm" size={20} color="#9DCD5A" />
            <Text style={styles.farmName}>{farm?.name || 'Local Farm'}</Text>
          </View>
        </View>

        {/* Delivery Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Status</Text>
          <View style={styles.progressContainer}>
            {statusSteps.map((step, index) => (
              <View key={index} style={styles.stepContainer}>
                <View style={[
                  styles.stepIcon,
                  index <= currentStep && styles.activeStepIcon
                ]}>
                  <MaterialCommunityIcons 
                    name={step.icon} 
                    size={20} 
                    color={index <= currentStep ? '#FFF' : '#9DCD5A'} 
                  />
                </View>
                <View style={styles.stepTextContainer}>
                  <Text style={[
                    styles.stepTitle,
                    index <= currentStep && styles.activeStepText
                  ]}>
                    {step.title}
                  </Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>
                {index < statusSteps.length - 1 && (
                  <View style={[
                    styles.stepConnector,
                    index < currentStep && styles.activeConnector
                  ]} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Delivery Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Details</Text>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="truck-delivery" size={20} color="#9DCD5A" />
            <Text style={styles.detailText}>
              Estimated delivery: {new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="credit-card" size={20} color="#9DCD5A" />
            <Text style={styles.detailText}>
              Paid via: {order.paymentMethod}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="map-marker" size={20} color="#9DCD5A" />
            <Text style={styles.detailText}>
              Delivering to: {user?.address || 'Your address'}
            </Text>
          </View>
        </View>

        {/* Farm Location Map */}
        {farm?.location && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Farm Location</Text>
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: farm.location.latitude || 14.5995,
                  longitude: farm.location.longitude || 120.9842,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: farm.location.latitude || 14.5995,
                    longitude: farm.location.longitude || 120.9842,
                  }}
                  title={farm.name}
                  description="Product source"
                >
                  <View style={styles.marker}>
                    <MaterialCommunityIcons name="farm" size={24} color="#FFF" />
                  </View>
                </Marker>
              </MapView>
            </View>
          </View>
        )}

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>₱{(order.price * order.quantity).toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Discount:</Text>
            <Text style={styles.summaryValue}>-₱{order.discount.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee:</Text>
            <Text style={styles.summaryValue}>₱50.00</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>₱{order.totalPrice.toFixed(2)}</Text>
          </View>
        </View>

        {/* Support Local Farmers Message */}
        <View style={styles.messageContainer}>
          <MaterialCommunityIcons name="hand-heart" size={24} color="#9DCD5A" />
          <Text style={styles.messageText}>
            Thank you for supporting local farmers and sustainable agriculture!
          </Text>
        </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
   container: {
    flex: 1,
    backgroundColor: '#F9FCF4',
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF5252',
    fontFamily: 'Poppins-Regular',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#9DCD5A',
    padding: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFF',
    fontFamily: 'Poppins-SemiBold',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FCF4',
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF5252',
    fontFamily: 'Poppins-Regular',
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    color: '#2E7D32',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productInfo: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  productImagePlaceholder: {
    backgroundColor: '#F0F8E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#9DCD5A',
    marginBottom: 5,
  },
  productQuantity: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 10,
  },
  farmInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  farmName: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    marginLeft: 10,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 15,
  },
  progressContainer: {
    marginLeft: 10,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#9DCD5A',
  },
  activeStepIcon: {
    backgroundColor: '#9DCD5A',
    borderColor: '#9DCD5A',
  },
  stepTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  stepTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#666',
    marginBottom: 3,
  },
  activeStepText: {
    color: '#2E7D32',
  },
  stepDescription: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#888',
  },
  stepConnector: {
    position: 'absolute',
    left: 19,
    top: 40,
    bottom: -15,
    width: 2,
    backgroundColor: '#EEE',
  },
  activeConnector: {
    backgroundColor: '#9DCD5A',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#555',
    marginLeft: 10,
    flex: 1,
  },
  mapContainer: {
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 10,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  marker: {
    backgroundColor: '#9DCD5A',
    padding: 5,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },
  totalRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#9DCD5A',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8E6',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  messageText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#2E7D32',
    marginLeft: 10,
    flex: 1,
  },
});

export default CustomerTracking;