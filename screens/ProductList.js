import React from 'react';
import { View, Text, TextInput, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const products = [
  {
    name: 'Sweet Tomatoes',
    price: '₱40/kg',
    image: require('../assets/tomatoes.png'),
  },
  {
    name: 'Biggest Eggplant',
    price: '₱80/kg',
    image: require('../assets/eggplant.png'),
  },
  {
    name: 'Broccolicious',
    price: '₱40/kg',
    image: require('../assets/broccoli.png'),
  },
  {
    name: 'Lettuce Baguio',
    price: '₱35/kg',
    image: require('../assets/lettuce.png'),
  },
];

export default function ProductList() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Products</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#ccc" />
        <TextInput style={styles.searchInput} placeholder="Search" />
      </View>

      <View style={styles.tagsContainer}>
        {['leafy greens', 'Broccoli', 'Cauliflower'].map(tag => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>Add New Product +</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.productList}>
        {products.map((product, index) => (
          <View key={index} style={styles.productCard}>
            <Image source={product.image} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>{product.price}</Text>
              <Text style={styles.reviews}>⭐ 254 reviews</Text>
            </View>
            <MaterialIcons name="edit" size={20} color="green" />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    padding: 24,
    justifyContent: 'center',
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    flex: 1,
  },
  header: {
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: '#009216',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: 5,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  tag: {
    backgroundColor: '#9DCD5A',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
  },
  tagText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
  },
  addButton: {
    backgroundColor: '#7cc95e',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontFamily:'Poppins-SemiBold',
    fontSize: 12,
  },
  productList: {
    gap: 15,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 10,
    elevation: 1,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
   fontFamily: 'Poppins-Bold',
    marginBottom: 3,
  },
  productPrice: {
    color: '#009216',
    fontFamily: 'Poppins-Bold'
  },
  reviews: {
    color: '#aaa',
    fontSize: 12,
  },
});
