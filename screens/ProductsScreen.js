import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const ProductsScreen = () => {
  const [activeTab, setActiveTab] = useState('products');
  
  const products = [
    {
      id: '248721',
      name: 'Tomatoes',
      category: 'Vegetables',
      price: 'P 40 / kg',
      quantity: '80',
      discount: '10%',
      status: 'In Stack',
      image: require('../assets/tomatoes.png'), // Replace with your actual image path
    },
    {
      id: '249725',
      name: 'Eggplant',
      category: 'Vegetables',
      price: 'P 50 / kg',
      quantity: '20',
      discount: '5%',
      status: 'In Stack',
      image: require('../assets/eggplant.png'), // Replace with your actual image path
    },
    {
      id: '249852',
      name: 'Broccoliclous',
      category: 'Vegetables',
      price: 'P 90 / kg',
      quantity: '40',
      discount: '60%',
      status: 'Out of Stack',
      image: require('../assets/broccoli.png'), // Replace with your actual image path
    },
    {
      id: '248336',
      name: 'Lettuce Baguio',
      category: 'Vegetables',
      price: 'P 60 / kg',
      quantity: '110',
      discount: null,
      status: 'In Stack',
      image: require('../assets/lettuce.png'), // Replace with your actual image path
    },
  ];

  const drafts = [
    // Sample draft items (you can customize these)
    {
      id: '248722',
      name: 'Carrots',
      category: 'Vegetables',
      price: 'P 30 / kg',
      quantity: '50',
      discount: null,
      status: 'In Stack',
      image: require('../assets/carrots.png'),
    },
    {
      id: '249726',
      name: 'Potatoes',
      category: 'Vegetables',
      price: 'P 45 / kg',
      quantity: '75',
      discount: '8%',
      status: 'In Stack',
      image: require('../assets/potato.png'),
    },
  ];

  const renderProductItem = ({ item }) => (
    <View style={styles.productContainer}>
      <View style={styles.productHeader}>
        <View style={styles.productInfo}>
          <Image source={item.image} style={styles.productImage} />
          <View>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productId}>ID {item.id}</Text>
          </View>
        </View>
        <View style={styles.statusContainer}>
          <Text style={[
            styles.statusText,
            item.status === 'In Stack' ? styles.inStack : styles.outOfStack
          ]}>
            {item.status}
          </Text>
          <TouchableOpacity>
            <MaterialIcons name="more-vert" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.detailsRow}>
        <Text style={styles.detailLabel}>Category</Text>
        <Text style={styles.detailLabel}>Price</Text>
        <Text style={styles.detailLabel}>Quantity (u)</Text>
      </View>
      
      <View style={styles.detailsRow}>
        <Text style={styles.detailValue}>{item.category}</Text>
        <Text style={styles.detailValue}>{item.price}</Text>
        <Text style={styles.detailValue}>{item.quantity}</Text>
      </View>
      
      {item.discount && (
        <View style={styles.discountContainer}>
          <Text style={styles.discountText}>Discounted price</Text>
          <View style={styles.discountRow}>
            <Text style={styles.discountValue}>- {item.discount}</Text>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit Discount</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Products</Text>
        
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'products' && styles.activeTab]}
            onPress={() => setActiveTab('products')}
          >
            <Text style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}>Products</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'drafts' && styles.activeTab]}
            onPress={() => setActiveTab('drafts')}
          >
            <Text style={[styles.tabText, activeTab === 'drafts' && styles.activeTabText]}>Drafts</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <FlatList
        data={activeTab === 'products' ? products : drafts}
        renderItem={renderProductItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No {activeTab} found</Text>
        }
        />
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={32} color="white" />
        </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 28,
    fontFamily: 'Poppins-Black',
    marginBottom: 16,
    color:'#9DCD5A',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#9DCD5A',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: 'white',
    fontFamily: 'Poppins-Black',
  },
  listContent: {
    padding: 16,
  },
  productContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productId: {
    fontSize: 14,
    color: '#666',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  inStack: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
  },
  outOfStack: {
    backgroundColor: '#ffebee',
    color: '#c62828',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
  discountContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  discountText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  discountValue: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: '#9DCD5A',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  editButtonText: {
    color: 'white',
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#9DCD5A',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default ProductsScreen;