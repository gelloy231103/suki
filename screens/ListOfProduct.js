import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';

const orders = [
  { id: '123456', quantity: '10 kg', date: '05/12/2025 20:39' },
  { id: '123456', quantity: '10 kg', date: '05/12/2025 20:39' },
  { id: '123456', quantity: '10 kg', date: '05/12/2025 20:39' },
  { id: '123456', quantity: '10 kg', date: '05/12/2025 20:39' },
  { id: '123456', quantity: '10 kg', date: '05/12/2025 20:39' },
  { id: '123456', quantity: '10 kg', date: '05/12/2025 20:39' },
];

const OrderItem = ({ order }) => (
  <View style={styles.orderItem}>
    <Image source={require('../assets/tomatoes.png')} style={styles.image} />
    <View style={styles.orderDetails}>
      <Text style={styles.productName}>Sweet Tomatoes</Text>
      <Text style={styles.orderText}>Order ID: {order.id}</Text>
      <Text style={styles.orderText}>Quantity: {order.quantity}</Text>
     <Text style={[styles.orderText, { marginTop: 15 }]}>Order Made: {order.date}</Text>
    </View>
    <TouchableOpacity style={styles.editIcon}>
      <Entypo name="edit" size={13} color="#9DCD5A" />
    </TouchableOpacity>

  </View>
);

const ListOfProducts = () => (
  <SafeAreaView style={styles.safeArea}>
    <View style={styles.container}>
      <Text style={styles.header}>LIST OF ORDERS</Text>
      <ScrollView>
        {orders.map((order, index) => (
          <OrderItem key={index} order={order} />
        ))}
      </ScrollView>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#a4d65e',
    padding: 15,
    fontSize: 12    ,
    fontFamily: 'Poppins-Bold',
    color: '#fff',
    alignContent: 'center',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  image: {
    width: 89,
    height: 89,
  },
  orderDetails: {
    flex: 1,
    marginLeft: 10,
  },
  productName: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
  },
  orderText: {
    fontSize: 10,
    color: '#BDBDBD',
    fontFamily: 'Poppins-Regular',
  },
  editIcon: {
    padding: 5,
  },
  editText: {
    fontSize: 18,
    color: '#a4d65e',
  },
});

export default ListOfProducts;