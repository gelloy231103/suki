import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons, Entypo } from '@expo/vector-icons';

const ProductDetails = () => {
  const [stock, setStock] = useState('359');
  const [unit, setUnit] = useState('KG');
  const [price, setPrice] = useState('200');
  const [cropType, setCropType] = useState('Fruits');
  const [discount, setDiscount] = useState('');
  const [period, setPeriod] = useState('');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <Image source={require('../assets/tomatoes.png')} style={styles.mainImage} />

      <View style={styles.imageSlider}>
        {[1, 2, 3].map((_, index) => (
          <Image
            key={index}
            source={require('../assets/tomatoes.png')}
            style={styles.thumbImage}
          />
        ))}
        <TouchableOpacity style={styles.addImageButton}>
          <Text style={{ fontSize: 10 }}>Add Image</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>Sweet Tomatoes</Text>
        <TouchableOpacity>
          <Entypo name="edit" size={18} color="green" />
        </TouchableOpacity>
      </View>

      <Text style={styles.reviews}>⭐ 4.6 · 334 reviews</Text>

      <Text style={styles.description}>
        Lorem Ipsum is simply dummy text of the printing and typesetting industry...
      </Text>

      <View style={styles.editIcon}>
        <Entypo name="edit" size={16} color="green" />
      </View>

      <Text style={styles.label}>Stocks</Text>
      <View style={styles.row}>
        <TextInput
          value={stock}
          onChangeText={setStock}
          style={[styles.input, { flex: 3, marginRight: 10 }]}
          keyboardType="numeric"
        />
        <View style={[styles.pickerContainer, { flex: 1 }]}>
          <Picker
            selectedValue={unit}
            onValueChange={setUnit}
            style={styles.picker}
          >
            <Picker.Item label="KG" value="KG" />
            <Picker.Item label="LB" value="LB" />
          </Picker>
        </View>
      </View>

      <Text style={styles.label}>Price per Stock</Text>
      <View style={styles.row}>
        <View style={styles.currencyContainer}>
          <Text style={styles.currencySymbol}>₱</Text>
        </View>
        <TextInput
          value={price}
          onChangeText={setPrice}
          style={[styles.input, { flex: 1 }]}
          keyboardType="numeric"
        />
      </View>

      <Text style={styles.label}>Crop Type</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={cropType}
          onValueChange={(itemValue) => setCropType(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Fruits" value="Fruits" />
          <Picker.Item label="Vegetables" value="Vegetables" />
        </Picker>
      </View>

      <View style={styles.row}>
        <View style={{ flex: 3, marginRight: 10 }}>
          <Text style={styles.label}>Discount</Text>
          <TextInput
            value={discount}
            onChangeText={setDiscount}
            style={styles.input}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Period</Text>
          <TextInput
            value={period}
            onChangeText={setPeriod}
            style={styles.input}
          />
        </View>
      </View>

      <View style={styles.rowBetween}>
        <TouchableOpacity style={[styles.saveButton, { flex: 1, marginRight: 10 }]}>
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.trashButton}>
          <Entypo name="trash" size={28} color="red" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  mainImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  imageSlider: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
  },
  thumbImage: {
    width: 50,
    height: 50,
    marginRight: 8,
    borderRadius: 5,
  },
  addImageButton: {
    width: 60,
    height: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  reviews: {
    color: 'gray',
    marginBottom: 10,
  },
  description: {
    color: '#444',
  },
  editIcon: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  label: {
    marginTop: 16,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 6,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    height: 49,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    flex: 1,
  },
  picker: {
    flex: 1,
    height: 49,
    minWidth: 200,
  },
  saveButton: {
    backgroundColor: '#90EE90',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveText: {
    fontWeight: 'bold',
    color: '#000',
  },
  trashButton: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  currencyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    height: 44,
    marginRight: 10,
  },
  currencySymbol: {
    fontSize: 16,
    color: 'gray',
  },
});

export default ProductDetails;
