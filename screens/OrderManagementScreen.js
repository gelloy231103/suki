import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const OrderManagementScreen = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>MANAGE ORDER</Text>
      </View>

      {/* Expected Delivery */}
      <View style={styles.expectedDelivery}>
        <Text style={styles.expectedText}>Expected Delivery on May 15</Text>
        <Icon name="edit" size={18} color="#fff" />
      </View>

      {/* Order Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Status</Text>
        <Text style={styles.statusText}>
          <Icon name="local-shipping" size={18} /> Parcel shipped out on 05/13/2025
        </Text>
      </View>

      {/* Delivery Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Information</Text>
        <Text style={styles.boldText}>
          <Icon name="place" size={18} color="red" /> Elijah Arizobal (+63 9658232301)
        </Text>
        <Text style={styles.grayText}>#42 St. Mary Street, BGC, Barangay, Makina City</Text>
      </View>

      {/* Items */}
      <View style={styles.itemCard}>
        <ItemCard
          title="Sweet Tomatoes"
          productId="123456"
          variant="1 kg"
          price="₱73"
          image="https://via.placeholder.com/60x60.png?text=Tomatoes"
        />
        <ItemCard
          title="Broccilicious"
          productId="789456"
          variant="1 Sack"
          price="₱73"
          image="https://via.placeholder.com/60x60.png?text=Broccoli"
        />
        <Text style={styles.totalText}>Order Total: ₱118</Text>
      </View>

      {/* Remarks */}
      <Text style={styles.remarksLabel}>Remarks:</Text>
      <TextInput style={styles.inputBox} placeholder="Type your remarks..." />

      {/* Action Buttons */}
      <View style={styles.actions}>
        {[
          { icon: 'chat', label: 'Chat' },
          { icon: 'cancel', label: 'Cancel' },
          { icon: 'block', label: 'Block' },
          { icon: 'report', label: 'Report' },
        ].map((btn, i) => (
          <TouchableOpacity key={i} style={styles.iconBox}>
            <Icon name={btn.icon} size={26} color="#900" />
            <Text style={styles.iconLabel}>{btn.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Update Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Update Status</Text>
        <View style={styles.statusRow}>
          {[
            ['Order Placed', '05/11/2025'],
            ['Order Arranged', '05/12/2025'],
            ['Order Shipped Out', '05/13/2025'],
            ['Expected Order By', '05/15/2025'],
          ].map(([label, date], i) => (
            <View key={i} style={styles.statusStep}>
              <View style={styles.stepCircle} />
              <Text style={styles.stepText}>{label}</Text>
              <Text style={styles.stepDate}>{date}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Footer Info */}
      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Order ID:</Text>
          <Text style={styles.orderId}>2505165ITDASQ8K</Text>
          <TouchableOpacity>
            <Text style={styles.copy}>Copy</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.footerText}>Paid by</Text>
        <Text style={styles.paymentMethod}>Cash on Delivery</Text>
      </View>
    </ScrollView>
  );
};

// ItemCard Component
const ItemCard = ({ title, productId, variant, price, image }) => (
  <View style={styles.itemRow}>
    <Image source={{ uri: image }} style={styles.itemImage} />
    <View style={{ flex: 1 }}>
      <Text style={styles.itemTitle}>{title}</Text>
      <Text style={styles.itemSub}>Prod ID: {productId}</Text>
      <Text style={styles.itemSub}>Variant: {variant}</Text>
    </View>
    <Text style={styles.itemPrice}>{price}</Text>
  </View>
);

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { backgroundColor: '#9AD36A', padding: 12 },
  headerText: { textAlign: 'center', color: '#fff', fontWeight: 'bold' },
  expectedDelivery: {
    backgroundColor: '#B3E283',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    alignItems: 'center',
  },
  expectedText: { color: '#fff', fontWeight: 'bold' },

  section: { padding: 10 },
  sectionTitle: { fontWeight: 'bold', marginBottom: 5 },
  statusText: { color: '#555' },
  boldText: { fontWeight: 'bold' },
  grayText: { color: '#555', marginTop: 2 },

  itemCard: { padding: 10 },
  itemRow: { flexDirection: 'row', marginBottom: 15 },
  itemImage: { width: 60, height: 60, borderRadius: 8, marginRight: 10 },
  itemTitle: { fontWeight: 'bold' },
  itemSub: { fontSize: 12, color: '#555' },
  itemPrice: { alignSelf: 'center', fontWeight: 'bold', color: '#222' },
  totalText: { textAlign: 'right', fontWeight: 'bold' },

  remarksLabel: { marginLeft: 10, marginTop: 5 },
  inputBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    margin: 10,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  iconBox: { alignItems: 'center' },
  iconLabel: { fontSize: 12, marginTop: 3 },

  statusRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statusStep: { alignItems: 'center', width: '23%' },
  stepCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#9AD36A',
    marginBottom: 5,
  },
  stepText: { fontSize: 10, fontWeight: 'bold', textAlign: 'center' },
  stepDate: { fontSize: 10, color: '#666', textAlign: 'center' },

  footer: {
    borderTopWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    backgroundColor: '#F6F6F6',
  },
  footerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  footerText: { color: '#555' },
  orderId: { fontWeight: 'bold', marginLeft: 5 },
  copy: {
    marginLeft: 10,
    fontSize: 12,
    color: '#007BFF',
    textDecorationLine: 'underline',
  },
  paymentMethod: {
    backgroundColor: '#9AD36A',
    color: '#fff',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 4,
    alignSelf: 'flex-start',
    fontWeight: 'bold',
  },
});

export default OrderManagementScreen;
