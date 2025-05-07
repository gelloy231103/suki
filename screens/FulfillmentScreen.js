import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Pressable } from 'react-native';

const App = () => {
  const [page, setPage] = useState('fulfillment');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [fulfillments, setFulfillments] = useState({});

  const orders = [
    {
      id: 1,
      item: 'Order #1234',
      customer: 'Tadhana FarmVille',
      orders: [
        { name: 'Sweet Tomatoes', quantity: '2 kg' },
        { name: 'Lettuce Baguio', quantity: '1.5 kg' }
      ]
    },
    {
      id: 2,
      item: 'Order #1235',
      customer: 'Marikina Farm & Restaurant',
      orders: [
        { name: 'Biggest Eggplant', quantity: '3 kg' }
      ]
    },
    {
      id: 3,
      item: 'Order #1236',
      customer: 'Habana Farm',
      orders: [
        { name: 'Broccolicious', quantity: '1 kg' },
        { name: 'Sweet Tomatoes', quantity: '2.5 kg' }
      ]
    },
  ];

  const openOrders = (customer) => {
    const initialStatus = {};
    customer.orders.forEach((item) => {
      const key = `${customer.item}-${item.name}`;
      initialStatus[key] = fulfillments[key] || false;
    });
    setFulfillments(initialStatus);
    setSelectedCustomer(customer);
    setPage('orders');
  };

  const handleBack = () => {
    setPage('fulfillment');
    setSelectedCustomer(null);
  };

  const toggleFulfilled = (orderKey) => {
    setFulfillments(prev => ({
      ...prev,
      [orderKey]: !prev[orderKey]
    }));
  };

  if (page === 'orders') {
    return (
      <View style={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={handleBack}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.pageTitle}>{selectedCustomer.customer}</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scroll}>
          {selectedCustomer.orders.map((item, index) => {
            const orderKey = `${selectedCustomer.item}-${item.name}`;
            const isChecked = fulfillments[orderKey];

            return (
              <View key={index} style={styles.itemCard}>
                <View style={styles.orderRow}>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.product}>{item.name}</Text>
                    <Text style={styles.price}>₱40/kg</Text>
                    <Text style={styles.origin}>from {selectedCustomer.customer}</Text>
                  </View>
                  <Pressable
                    onPress={() => toggleFulfilled(orderKey)}
                    style={[
                      styles.checkbox,
                      isChecked && styles.checkboxChecked
                    ]}
                  >
                    {isChecked && <Text style={styles.checkboxTick}>✔</Text>}
                  </Pressable>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.pageTitle}>Fulfillment</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {orders.map((entry) => (
          <TouchableOpacity key={entry.id} style={styles.card} onPress={() => openOrders(entry)}>
            <View style={styles.cardRow}>
              <Image
                source={{ uri: 'https://img.icons8.com/fluency/48/vegetarian-food.png' }}
                style={styles.cardImage}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.product}>{entry.item}</Text>
                <Text style={styles.origin}>{entry.customer}</Text>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => Alert.alert(`Cancel ${entry.item}`)}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.completeButton}
                    onPress={() => Alert.alert(`Complete ${entry.item}`)}
                  >
                    <Text style={styles.buttonText}>Complete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FDF4',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#E9FBE3',
    borderBottomWidth: 1,
    borderBottomColor: '#C5E1A5',
  },
  backArrow: {
    fontSize: 24,
    marginRight: 12,
    color: '#558B2F',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#558B2F',
  },
  scroll: {
    padding: 16,
    paddingBottom: 50,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#00000020',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardRow: {
    flexDirection: 'row',
  },
  cardImage: {
    width: 60,
    height: 60,
    marginRight: 12,
    borderRadius: 12,
  },
  product: {
    fontSize: 18,
    fontWeight: '600',
    color: '#33691E',
  },
  origin: {
    fontSize: 14,
    color: '#689F38',
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    color: '#558B2F',
    fontWeight: '500',
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  cancelButton: {
    backgroundColor: '#FFEBEE',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 10,
  },
  completeButton: {
    backgroundColor: '#DCEDC8',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontWeight: '600',
    color: '#33691E',
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#00000020',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#33691E',
    marginRight: 12,
    width: 60,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#A5D6A7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#81C784',
    borderColor: '#388E3C',
  },
  checkboxTick: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
