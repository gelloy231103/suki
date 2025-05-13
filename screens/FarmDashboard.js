import React, { memo, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import MapView, { Marker } from 'react-native-maps';

const { width } = Dimensions.get('window');

// Static product images
const productImages = [
  require('../assets/images/products/0.png'),
  require('../assets/images/products/1.png'),
  require('../assets/images/products/2.png'),
];

export default function FarmDashboardScreen({ navigation }) {
  const { userData } = useContext(AuthContext);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Green header section */}
        <View style={styles.greenHeader}>
          <View style={styles.headerTopRow}>
            <Ionicons name="arrow-back" size={24} color="#fff" 
            onPress={() => navigation.navigate('ProfileDashboard', { ProfileDashboard: 'value' })}
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
            <Image source={require('../assets/farm.png')} style={styles.avatar} />
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{userData.firstName + " " + userData.lastName}</Text>
              <Text style={styles.email}>{userData.email}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('EditFarmProfile')}>
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
                  <Text style={styles.balanceValue}>P321</Text>
                </View>
              </View>
              <View style={styles.balanceItem}>
                <MaterialCommunityIcons name="currency-php" size={24} color="#8CC63F" style={styles.balanceIconWhite} />
                <View style={styles.balanceTextBlock}>
                  <Text style={styles.balanceLabel}>Income</Text>
                  <Text style={styles.balanceValue}>P4100</Text>
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
          <Action icon="fruit-grapes" label="Products"
          onPress={() => navigation.navigate('ProductsScreen', { someParam: 'value' })}
          />
          <Action icon="cube-outline" label="Fulfillment" 
          onPress={() => navigation.navigate('OrderManagementScreen', { OrdermanagementScreen: 'value' })}
          />
          <Action icon="history" label="History" />
          <Action icon="home" label="Home" />
        </View>

        <SectionHeader title="Your Farm Locator" />
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker
            coordinate={{ latitude: 37.78825, longitude: -122.4324 }}
            title="Your Farm"
            description="This is your farm location"
          />
        </MapView>

        <SectionHeader title="Your Products" />
        {[
          {
            name: 'Sweet Tomato',
            desc: 'Sweet Tomato',
            status: 'Stocks: 30kg',
            icon: 'circle-edit-outline',
          },
          {
            name: 'Magestic Potato',
            desc: '1 Box of Magestic Potato from Garden',
            status: 'Ready for pick up at Bernadette Farm',
            icon: 'circle-edit-outline',
          },
          {
            name: 'Sweet Tomato',
            desc: '3kg of Sweet Tomato from Garden',
            status: 'Now Harvesting...',
            icon: 'circle-edit-outline',
          }
        ].map((item, idx) => (
          <Pressable 
            key={idx} 
            style={({ pressed }) => [
              styles.orderRow, 
              pressed && { opacity: 0.7 }
            ]}
          >
            <Image source={productImages[idx]} style={styles.orderImg} />
            <View style={styles.orderText}>
              <Text style={styles.orderTitle}>{item.desc}</Text>
              <Text style={styles.orderSubtitle}>
                {item.status}
              </Text>
            </View>
            <MaterialCommunityIcons name={item.icon} size={24} color="#8CC63F" />
          </Pressable>
        ))}
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
  editText: { 
    color: '#08A647',     
    fontFamily: 'Poppins-Bold',
    fontSize: 12,
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
    width: 359,
    height: 196,
    alignSelf: 'center',
    borderRadius: 10,
    marginBottom: 17,
  },
});