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
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import MapView, { Marker } from 'react-native-maps';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import Geocoder from 'react-native-geocoding';

// Initialize Geocoder with your API key (Google Maps API)
Geocoder.init('AIzaSyDYfZdROEjJR7qB31TM1t8Lm6pSc0twhPg', { language: 'en' });

const { width } = Dimensions.get('window');

// Static product images
const productImages = [
  require('../assets/images/products/0.png'),
  require('../assets/images/products/1.png'),
  require('../assets/images/products/2.png'),
];

export default function FarmDashboardScreen({ navigation, route }) {
  const { userData } = useContext(AuthContext);
  const [farmData, setFarmData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coordinates, setCoordinates] = useState({
    latitude: 14.5995,
    longitude: 120.9842,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  useEffect(() => {
    const fetchFarmData = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        // Fetch farm data
        const farmRef = doc(db, 'farms', userId);
        const farmSnap = await getDoc(farmRef);

        if (farmSnap.exists()) {
          const data = farmSnap.data();
          setFarmData(data);

          // Fetch products where farmId matches current user's ID
          const productsQuery = query(
            collection(db, 'products'),
            where('farmId', '==', userId)
          );
          const productsSnapshot = await getDocs(productsQuery);
          const productsData = productsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setProducts(productsData);

          // Geocode the address
          if (data.farmAddress) {
            const fullAddress = `${data.farmAddress.street}, ${data.farmAddress.barangay}, ${data.farmAddress.city}, ${data.farmAddress.province}, ${data.farmAddress.region}, ${data.farmAddress.postalCode}, Philippines`;
            
            try {
              const response = await Geocoder.from(fullAddress);
              const { lat, lng } = response.results[0].geometry.location;
              setCoordinates({
                latitude: lat,
                longitude: lng,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              });
            } catch (error) {
              console.error('Geocoding error:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFarmData();
  }, [route.params?.refresh]); // Add refresh dependency

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8CC63F" />
      </View>
    );
  }

  const handleProductPress = (product) => {
    navigation.navigate('AddProductScreen', { 
      product,
      mode: 'edit',
      onGoBack: () => fetchFarmData() // Refresh data when returning
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Green header section */}
        <View style={styles.greenHeader}>
          <View style={styles.headerTopRow}>
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color="#fff" 
              onPress={() => navigation.navigate('ProfileDashboard')}
            />
            <View style={styles.headerIcons}>
              <Ionicons name="chatbox-ellipses" size={24} color="#fff" />
              <Ionicons name="notifications" size={24} color="#fff" />
            </View>
          </View>
        </View>
        
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <Image 
              source={farmData?.farmImage ? { uri: farmData.farmImage } : require('../assets/farm.png')} 
              style={styles.avatar} 
            />
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{farmData?.farmName || 'My Farm'}</Text>
              <Text style={styles.address}>
                {farmData?.farmAddress ? 
                  `${farmData.farmAddress.street}, ${farmData.farmAddress.barangay}, ${farmData.farmAddress.city}` : 
                  'Address not set'}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('EditFarmProfile', { farmData })}>
                <Text style={styles.editText}>Edit Farm Information</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.balanceSection}>
            <View style={styles.balanceBox}>
              <View style={styles.balanceItem}>
                <MaterialCommunityIcons name="wallet" size={24} color="#fff" style={styles.balanceIconGreen} />
                <View style={styles.balanceTextBlock}>
                  <Text style={styles.balanceLabel}>Orders</Text>
                  <Text style={styles.balanceValue}>P{farmData?.ordersValue || '0'}</Text>
                </View>
              </View>
              <View style={styles.balanceItem}>
                <MaterialCommunityIcons name="currency-php" size={24} color="#8CC63F" style={styles.balanceIconWhite} />
                <View style={styles.balanceTextBlock}>
                  <Text style={styles.balanceLabel}>Income</Text>
                  <Text style={styles.balanceValue}>P{farmData?.income || '0'}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <Action 
            icon="wallet-plus" 
            label="My Income" 
            onPress={() => navigation.navigate('WalletScreen')} 
          />
          <Action 
            icon="fruit-grapes" 
            label="Products"
            onPress={() => navigation.navigate('ProductsScreen', { farmId: auth.currentUser?.uid })}
          />
          <Action 
            icon="cube-outline" 
            label="Fulfillment" 
            onPress={() => navigation.navigate('OrdermanagementScreen')}
          />
          <Action icon="history" label="History" />
          <Action icon="home" label="Home" />
        </View>

        <SectionHeader title="Your Farm Locator" />
        <MapView
          style={styles.map}
          region={coordinates}
        >
          <Marker
            coordinate={{
              latitude: coordinates.latitude,
              longitude: coordinates.longitude
            }}
            title={farmData?.farmName || 'My Farm'}
            description={farmData?.address ? 
              `${farmData.address.street}, ${farmData.address.barangay}, ${farmData.address.city}` : 
              'Farm location'}
          />
        </MapView>

        <SectionHeader title="Your Products" />
        {products.slice(0, 3).map((product, idx) => (
          <Pressable 
            key={product.id} 
            style={({ pressed }) => [
              styles.orderRow, 
              pressed && { opacity: 0.7 }
            ]}
            onPress={() => handleProductPress(product)}
          >
            <Image 
              source={product.images?.[0] ? { uri: product.images[0] } : productImages[idx % productImages.length]} 
              style={styles.orderImg} 
            />
            <View style={styles.orderText}>
              <Text style={styles.orderTitle}>{product.name}</Text>
              <Text style={styles.orderSubtitle}>
                Stocks: {product.stock || '0'} {product.unit || 'kg'}
              </Text>
            </View>
            <MaterialCommunityIcons name="circle-edit-outline" size={24} color="#8CC63F" />
          </Pressable>
        ))}

        {products.length === 0 && (
          <View style={styles.noProducts}>
            <Text style={styles.noProductsText}>No products added yet</Text>
            <TouchableOpacity 
              style={styles.addProductButton}
              onPress={() => navigation.navigate('AddProductScreen', { mode: 'add' })}
            >
              <Text style={styles.addProductButtonText}>Add Your First Product</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greenHeader: {
    height: 170,
    backgroundColor: '#009216',
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
  profileCard: {
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
  avatar: { 
    width: 70, 
    height: 70, 
    borderRadius: 12 
  },
  profileInfo: { 
    flex: 1, 
    marginLeft: 16 
  },
  name: { 
    fontSize: 14, 
    fontFamily: 'Poppins-Bold',
    marginTop: 5,
  },
  email: { 
    fontSize: 12, 
    color: 'gray',  
    fontFamily: 'Poppins-Regular',
    padding: 0,
  },
  address: {
    fontSize: 12,
    color: 'gray',
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
  },
  editText: { 
    color: '#08A647',     
    fontFamily: 'Poppins-Bold',
    fontSize: 12,
    marginTop: 5,
  },
  balanceSection: {
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
  balanceItem: {
    flexDirection: 'row',
    width: '50%',
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
  balanceLabel: { 
    fontSize: 12, 
    color: '#08A647', 
    fontFamily: 'Poppins-Bold',
  },
  balanceValue: { 
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
    fontSize: 8, 
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
  orderRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginHorizontal: 16, 
    backgroundColor: '#fff', 
    borderRadius: 8, 
    padding: 12,
    marginBottom: 10,
    elevation: 1,
  },
  orderImg: { 
    width: 45, 
    height: 45, 
    borderRadius: 50
  },
  orderText: { 
    flex: 1, 
    marginLeft: 12 
  },
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
  map: {
    width: '90%',
    height: 196,
    alignSelf: 'center',
    borderRadius: 10,
    marginBottom: 17,
  },
  noProducts: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  noProductsText: {
    fontSize: 14,
    color: 'gray',
    fontFamily: 'Poppins-Regular',
    marginBottom: 10,
  },
  addProductButton: {
    backgroundColor: '#8CC63F',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addProductButtonText: {
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },
});