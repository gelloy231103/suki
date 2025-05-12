import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { MaterialIcons, FontAwesome, Ionicons, Entypo, Feather } from '@expo/vector-icons';

const OrderManagementScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="arrow-back" size={24} color="#000" />
        <Text style={styles.headerText}>MANAGE ORDER</Text>
        <View style={{ width: 24 }} /> {/* Spacer for alignment */}
      </View>

      <View style={styles.deliveryInfo}>
        <Ionicons name="time-outline" size={20} color="#4CAF50" />
        <Text style={styles.deliveryDate}>Expected Delivery on May 15</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="local-shipping" size={20} color="#555" />
          <Text style={styles.sectionTitle}>Order Status</Text>
        </View>
        <View style={styles.statusContainer}>
          <FontAwesome name="check-circle" size={16} color="#4CAF50" />
          <Text style={styles.statusText}>Parcel shipped out</Text>
        </View>
        <Text style={styles.statusSubText}>only/zone: oan</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Entypo name="location-pin" size={20} color="#555" />
          <Text style={styles.sectionTitle}>Delivery Information</Text>
        </View>
        <View style={styles.infoRow}>
          <Feather name="user" size={16} color="#555" />
          <Text style={styles.infoText}>Elijah Attabadi (163 96533700)</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="business" size={16} color="#555" />
          <Text style={styles.infoText}>and is Mary Janda, LLC. Boroughs Montero City</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.productItem}>
          <Image 
            source={require('../assets/tomatoes.png')} 
            style={styles.productImage}
          />
          <View style={styles.productDetails}>
            <Text style={styles.itemTitle}>Sweet Tomatoes</Text>
            <Text style={styles.itemDetail}>Prod ID: 123456</Text>
            <Text style={styles.itemDetail}>Variant: 1 kg</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.productItem}>
          <Image 
            source={require('../assets/broccoli.png')} 
            style={styles.productImage}
          />
          <View style={styles.productDetails}>
            <Text style={styles.itemTitle}>Brocelleious</Text>
            <Text style={styles.itemDetail}>Prod ID: 789456</Text>
            <Text style={styles.itemDetail}>Variant: 1 back</Text>
          </View>
        </View>
      </View>

      <View style={styles.totalSection}>
        <Text style={styles.totalText}>Order Total: $18</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="notes" size={20} color="#555" />
          <Text style={styles.sectionTitle}>Remarks:</Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button}>
          <FontAwesome name="comment" size={16} color="#555" />
          <Text style={styles.buttonText}> Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <MaterialIcons name="cancel" size={16} color="#555" />
          <Text style={styles.buttonText}> Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <MaterialIcons name="block" size={16} color="#555" />
          <Text style={styles.buttonText}> Block</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <MaterialIcons name="report" size={16} color="#555" />
          <Text style={styles.buttonText}> Report</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.updateButton}>
        <Text style={styles.updateButtonText}>Update Status</Text>
        <MaterialIcons name="keyboard-arrow-right" size={20} color="#fff" />
      </TouchableOpacity>

      <View style={styles.statusTimeline}>
        <View style={styles.statusItem}>
          <View style={styles.statusIcon}>
            <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
          </View>
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusItemTitle}>Order Planned</Text>
            <Text style={styles.statusItemDate}>04/10/2025 20:39</Text>
          </View>
        </View>
        <View style={styles.statusItem}>
          <View style={styles.statusIcon}>
            <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
          </View>
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusItemTitle}>Order Arranged</Text>
            <Text style={styles.statusItemDate}>05/01/2025 03:01</Text>
          </View>
        </View>
        <View style={styles.statusItem}>
          <View style={styles.statusIcon}>
            <MaterialIcons name="radio-button-unchecked" size={20} color="#9E9E9E" />
          </View>
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusItemTitle}>Order Stepped Out</Text>
            <Text style={styles.statusItemDate}>06/01/2025 03:01</Text>
          </View>
        </View>
      </View>

      <View style={styles.footerSection}>
        <View style={styles.footerRow}>
          <MaterialIcons name="calendar-today" size={14} color="#666" />
          <Text style={styles.footerText}> Expect Order By 05/01/2025</Text>
        </View>
        <View style={styles.footerRow}>
          <MaterialIcons name="receipt" size={14} color="#666" />
          <Text style={styles.footerText}> Order ID 25051651TOASQ6K Copy</Text>
        </View>
        <View style={styles.footerRow}>
          <MaterialIcons name="payment" size={14} color="#666" />
          <Text style={styles.footerText}> Fold by Cash on Delivery</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 8,
  },
  deliveryDate: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    marginLeft: 8,
  },
  statusSubText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 24, // Align with status text
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 8,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  itemDetail: {
    fontSize: 14,
    color: '#555',
  },
  totalSection: {
    marginBottom: 20,
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  buttonText: {
    fontSize: 14,
  },
  updateButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  statusTimeline: {
    marginBottom: 20,
    paddingLeft: 12,
  },
  statusItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statusIcon: {
    marginRight: 12,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusItemTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusItemDate: {
    fontSize: 12,
    color: '#666',
  },
  footerSection: {
    marginTop: 20,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
  },
});

export default OrderManagementScreen;