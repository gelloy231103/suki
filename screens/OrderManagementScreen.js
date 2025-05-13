import React from "react";
import { View, Text, Image, TextInput, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons, FontAwesome, MaterialIcons, Entypo } from "@expo/vector-icons";
import { Feather } from '@expo/vector-icons';


export default function ManageOrderScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>MANAGE ORDER</Text>
      </View>

      {/* Expected Delivery */}
      <View style={styles.expectedDelivery}>
        <Text style={styles.expectedDeliveryText}>Expected Delivery on May 15</Text>
        <Ionicons name="pencil" size={16} color="#fff" />
      </View>

      {/* Order Status */}
      <View style={styles.section}>
        <Text style={styles.orderStatusTitle}>Order Status</Text>
        <View style={styles.statusRow}>
          <FontAwesome name="truck" size={16} color="#c0392b" />
          <Text style={styles.statusText}>Parcel shipped out</Text>
        </View>
        <Text style={styles.statusDate}>05/13/2025 08:45</Text>
      </View>

      {/* Delivery Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Information</Text>
        <View style={styles.infoRow}>
          <Entypo name="location-pin" size={20} color="#c0392b" />
          <Text>Elijah Arizobal ( +63 9153237390 )</Text>
        </View>
        <Text style={styles.address}>#94 St. Mary Street, KDC, Bangkal, Makati City</Text>
      </View>

      {/* Products */}
      <View style={styles.section}>
        {/* Sweet Tomatoes */}
        <View style={styles.productItem}>
          <Image source={{ uri: 'https://i.imgur.com/FxyR8C1.png' }} style={styles.productImage} />
          <View style={styles.productDetails}>
            <Text style={styles.productTitle}>Sweet Tomatoes</Text>
            <Text style={styles.productSubText}>Prod ID: 123456</Text>
            <Text style={styles.productSubText}>Variant: 1 kg</Text>
          </View>
          <Text style={styles.productPrice}>₱73</Text>
        </View>

        {/* Broccilicious */}
        <View style={styles.productItem}>
          <Image source={{ uri: 'https://i.imgur.com/j0t3z2N.png' }} style={styles.productImage} />
          <View style={styles.productDetails}>
            <Text style={styles.productTitle}>Broccilicious</Text>
            <Text style={styles.productSubText}>Prod ID: 789456</Text>
            <Text style={styles.productSubText}>Variant: 1 Sack</Text>
          </View>
          <Text style={styles.productPrice}>₱73</Text>
        </View>

        {/* Order Total */}
        <Text style={styles.orderTotal}>Order Total: ₱118</Text>
      </View>

      {/* Remarks */}
      <View style={styles.section}>
        <Text>Remarks:</Text>
        <TextInput style={styles.remarksInput} />
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity>
          <Ionicons name="chatbubble-ellipses" size={24} color="#8e44ad" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Entypo name="circle-with-cross" size={24} color="#c0392b" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Entypo name="block" size={24} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity>
          <MaterialIcons name="report" size={24} color="red" />
        </TouchableOpacity>
      </View>

      {/* Update Status */}
      <View style={styles.statusContainer}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusTitle}>Update Status</Text>
          <View style={styles.statusIcons}>
          <Feather name="edit" size={18} color="green" style={{ marginRight: 10 }} />
          <FontAwesome name="save" size={18} color="green" />
        </View>
        </View>

        <View style={styles.statusStepsRow}>
          <View style={styles.statusStepWrapper}>
            <View style={styles.circleWrapper}><FontAwesome name="shopping-bag" size={20} color="#8e44ad" /></View>
            <Text style={styles.statusStepText}>Order Placed{"\n"}05/12/2025 20:39</Text>
          </View>
          <View style={styles.line} />
          <View style={styles.statusStepWrapper}>
            <View style={styles.circleWrapper}><FontAwesome name="gift" size={20} color="#8e44ad" /></View>
            <Text style={styles.statusStepText}>Order Arranged{"\n"}05/13/2025 01:01</Text>
          </View>
          <View style={styles.line} />
          <View style={styles.statusStepWrapper}>
            <View style={styles.circleWrapper}><FontAwesome name="truck" size={20} color="#8e44ad" /></View>
            <Text style={styles.statusStepText}>Order Shipped Out{"\n"}05/13/2025 01:01</Text>
          </View>
          <View style={styles.line} />
          <View style={styles.statusStepWrapper}>
            <View style={styles.circleWrapper}><FontAwesome name="flag-checkered" size={20} color="#8e44ad" /></View>
            <Text style={styles.statusStepText}>Expect Order By{"\n"}05/15/2025</Text>
          </View>
        </View>
      </View>

      {/* Order ID and Payment */}
      <View style={styles.section}>
        <Text style={styles.grayText}>Order ID</Text>
        <View style={styles.idRow}>
          <Text>25051651TDASQ6K</Text>
          <TouchableOpacity style={styles.copyButton}><Text style={styles.copyText}>Copy</Text></TouchableOpacity>
        </View>
        <View style={styles.paymentTag1}>
          <Text style={styles.paymentLabel}>Paid by</Text>
          <Text style={styles.paymentMethod}>Cash on Delivery</Text>
        </View>
        <View style={styles.paymentTag}>
          
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { backgroundColor: '#AEDC63', padding: 15, alignItems: 'center' },
  headerText: { fontWeight: 'bold', color: '#fff' },
  expectedDelivery: { backgroundColor: '#AEDC63', padding: 15, margin: 10, borderRadius: 5, flexDirection: 'row', justifyContent: 'space-between' },
  expectedDeliveryText: { color: '#fff', fontWeight: 'bold' },
  section: { paddingHorizontal: 15, marginTop: 15 },
  orderStatusTitle: { fontWeight: 'bold', color: '#c0392b' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  statusText: { marginLeft: 10 },
  statusDate: { marginLeft: 26, color: 'gray' },
  sectionTitle: { fontWeight: 'bold' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  address: { marginLeft: 26, color: 'gray' },
  productItem: { flexDirection: 'row', marginBottom: 10, backgroundColor: '#f9f9f9', padding: 10, borderRadius: 5 },
  productImage: { width: 60, height: 60, borderRadius: 5 },
  productDetails: { flex: 1, marginLeft: 10 },
  productTitle: { fontWeight: 'bold' },
  productSubText: { color: 'gray' },
  productPrice: { alignSelf: 'center' },
  orderTotal: { textAlign: 'right', fontWeight: 'bold' },
  remarksInput: { borderColor: '#ccc', borderWidth: 1, borderRadius: 5, padding: 8, marginTop: 5 },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    paddingTop: 10
  },
  statusContainer: {
    margin: 15,
    padding: 15,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#fff'
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  statusTitle: {
    fontWeight: 'bold',
    color: '#A93226'
  },
  statusIcons: {
    flexDirection: 'row'
  },
  statusStepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  statusStepWrapper: {
    alignItems: 'center',
    width: 70
  },
  circleWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#AEDC63',
    justifyContent: 'center',
    alignItems: 'center'
  },
  line: {
    height: 3,
    flex: 1,
    backgroundColor: '#AEDC63'
  },
  statusStepText: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 5
  },
  section: {
    paddingHorizontal: 15,
    marginTop: 15
  },
  grayText: {
    color: 'gray'
  },
  idRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  copyButton: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 5
  },
  copyText: {
    color: '#2e7d32',
    fontWeight: 'bold'
  },
  paymentTag: {
    marginTop: 10,
    backgroundColor: '#AEDC63', padding: 15,
    marginBottom: 15,
  },
  paymentTag1: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  paymentLabel: {
    color: '#000'
  },
  paymentMethod: {
    color: '#000',
    fontWeight: 'bold'
  }
});
