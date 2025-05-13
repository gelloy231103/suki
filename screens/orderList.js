import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const OrderListScreen = ({ navigation }) => {
  // Static order data
  const orders = [
    {
      id: '123456',
      productName: 'Sweet Tomatoes',
      quantity: '10 kg',
      date: '05/13/2025',
      time: '20:39',
      image: require('../assets/tomatoes.png') // Replace with your actual image
    },
    {
      id: '123457',
      productName: 'Organic Potatoes',
      quantity: '15 kg',
      date: '05/12/2025',
      time: '14:20',
      image: require('../assets/tomatoes.png')
    },
    {
      id: '123458',
      productName: 'Fresh Carrots',
      quantity: '8 kg',
      date: '05/11/2025',
      time: '09:15',
      image: require('../assets/tomatoes.png')
    },
    {
      id: '123459',
      productName: 'Crisp Lettuce',
      quantity: '5 kg',
      date: '05/10/2025',
      time: '16:45',
      image: require('../assets/tomatoes.png')
    },
    {
      id: '123460',
      productName: 'Juicy Strawberries',
      quantity: '12 kg',
      date: '05/09/2025',
      time: '11:30',
      image: require('../assets/tomatoes.png')
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LIST OF ORDERS</Text>
        <View style={{ width: 24 }} /> {/* For alignment */}
      </View>

      {/* Order List */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {orders.map((order, index) => (
          <View key={index} style={styles.orderCard}>
            <Image source={order.image} style={styles.productImage} />
            <View style={styles.orderDetails}>
              <Text style={styles.productName}>{order.productName}</Text>
              <View style={styles.orderMeta}>
                <Text style={styles.metaText}>Order ID: {order.id}</Text>
                <Text style={styles.metaText}>Quantity: {order.quantity}</Text>
                <Text style={styles.metaText}>
                  Ordered: {order.date} {order.time}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <MaterialCommunityIcons name="pencil" size={24} color="#8CC63F" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#9DCD5A',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,

  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
  },
  orderDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  orderMeta: {
    marginTop: 5,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginBottom: 2,
  },
  editButton: {
    padding: 8,
  },
});

export default OrderListScreen;