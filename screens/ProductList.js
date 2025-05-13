import React from 'react';
import { View, Text, TextInput, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const defaultImage = require('../assets/tomatoes.png');

const products = [
  {
    id: '1',
    name: 'Sweet Tomatoes',
    price: 40.00,
    unit: 'kilogram',
    category: 'Vegetables',
    stock: 100,
    status: 'available',
    image: require('../assets/tomatoes.png'),
    farmName: 'Tadhana FarmVille',
  },
  {
    id: '2',
    name: 'Biggest Eggplant',
    price: 80.00,
    unit: 'kilogram',
    category: 'Vegetables',
    stock: 50,
    status: 'available',
    image: require('../assets/eggplant.png'),
    farmName: 'Tadhana FarmVille',
  },
  {
    id: '3',
    name: 'Broccolicious',
    price: 40.00,
    unit: 'kilogram',
    category: 'Vegetables',
    stock: 75,
    status: 'available',
    image: require('../assets/broccoli.png'),
    farmName: 'Tadhana FarmVille',
  },
  {
    id: '4',
    name: 'Lettuce Baguio',
    price: 35.00,
    unit: 'kilogram',
    category: 'Leafy Greens',
    stock: 60,
    status: 'available',
    image: require('../assets/lettuce.png'),
    farmName: 'Tadhana FarmVille',
  },
];

export default function ProductList() {
  const navigation = useNavigation();

  const handleProductPress = (product) => {
    navigation.navigate('FocusedProduct', { 
      productId: product.id,
      product: {
        ...product,
        formattedPrice: `₱${product.price.toFixed(2)}/${product.unit}`,
        images: [product.image],
      }
    });
  };

  const formatPrice = (price, unit) => {
    return `₱${price.toFixed(2)}/${unit}`;
  };

  const getImageSource = (image) => {
    try {
      return image || defaultImage;
    } catch (error) {
      return defaultImage;
    }
  };

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
          <TouchableOpacity
            key={index}
            style={styles.productCard}
            onPress={() => handleProductPress(product)}
          >
            <Image 
              source={getImageSource(product.image)} 
              style={styles.productImage}
              defaultSource={defaultImage}
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>{formatPrice(product.price, product.unit)}</Text>
              <Text style={styles.reviews}>⭐ 254 reviews</Text>
            </View>
            <MaterialIcons name="edit" size={20} color="green" />
          </TouchableOpacity>
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
