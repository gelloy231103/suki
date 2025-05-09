import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  TouchableOpacity,
  Pressable
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';



const { width } = Dimensions.get('window');
// static product images
const productImages = [
  require('../assets/images/products/0.png'),
  require('../assets/images/products/1.png'),
  require('../assets/images/products/2.png'),
];

export default function DashboardScreen({navigation}) {
  return (
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
              <Text style={styles.nameLarge}>Aron Jeric Cao</Text>
              <Text style={styles.emailLarge}>aronjericandrade@gmail.com</Text>
              <TouchableOpacity onPress={()=>{navigation.navigate('EditUserProfile')}}>
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
          <Action icon="wallet" label="My Wallet" />
          <Action icon="credit-card" label="My Card" />
          <Action icon="receipt" label="Orders" />
          <Action icon="history" label="History" />
          <Action icon="star-outline" label="Rate It" />
        </View>

        {/* Saved Card */}
        <SectionHeader title="Saved Card" />
        <View style={styles.savedCard}>
          <View style={{flexDirection: 'column'}}>
            <View style={styles.savedIconName}>
              <MaterialCommunityIcons name="check-circle" size={16} color="#8CC63F" />
              <Text style={styles.cardNumber}>  XXXX XXXX XXXX 4321</Text>
            </View>
            <Text style={styles.cardHolder}>Aron Jeric Cao</Text>
          </View>
          <View style={{flexDirection:'column', flex: 1, gap: 5}}>
            <View style={styles.cardRight}>            
              <MaterialCommunityIcons name="wallet-plus-outline" size={23}/>
              <Image
                source={require('../assets/images/masterCard.png')}
                style={{ width: 40, height: 25, marginLeft: 5}}
                resizeMode='contain'
              />
            </View>
            <Text style={styles.cardExpiry}>VALID THRU 08/28</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Text style={styles.addCardText}>Add New Card +</Text>
        </TouchableOpacity>

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
  );
}

const Action = memo(({ icon, label }) => (
  <TouchableOpacity style={styles.action}>
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
  savedCard: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    marginHorizontal: 20, 
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
  addCardText: { 
    marginHorizontal: 20, 
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
});