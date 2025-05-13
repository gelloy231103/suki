import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Switch
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

const AddProductScreen = ({ navigation }) => {
  // Product Information
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [availableStock, setAvailableStock] = useState('');
  const [minimumOrder, setMinimumOrder] = useState('1');
  
  // Category & Type
  const [category, setCategory] = useState('Fruits');
  const [subcategory, setSubcategory] = useState('');
  const [cropType, setCropType] = useState('Fruits');
  
  // Pricing & Discount
  const [percentage, setPercentage] = useState('');
  const [validUntil, setValidUntil] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Delivery Options
  const [deliveryOptions, setDeliveryOptions] = useState({
    pickup: true,
    delivery: false,
    shipping: false
  });
  
  // Product Status
  const [status, setStatus] = useState('available');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBundled, setIsBundled] = useState(false);
  
  // Bundle Details
  const [bundleDetails, setBundleDetails] = useState({
    items: [],
    discount: 0
  });
  
  // Tags
  const [tags, setTags] = useState('');
  
  // Image handling
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  
  // Replace these with actual values from your auth context
  const currentUserId = "user123";
  const currentFarmId = "farm456";

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      if (images.length < 6) {
        setImages([...images, result.assets[0]]);
      } else {
        Alert.alert('Limit reached', 'You can upload maximum 6 images');
      }
    }
  };

  const uploadImageAsync = async (uri) => {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function() {
        resolve(xhr.response);
      };
      xhr.onerror = function(e) {
        console.log(e);
        reject(new TypeError('Network request failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });

    const storage = getStorage();
    const storageRef = ref(storage, `products/${currentUserId}/${Date.now()}`);
    await uploadBytes(storageRef, blob);
    blob.close();
    
    return await getDownloadURL(storageRef);
  };

  const clearForm = () => {
    setName('');
    setDescription('');
    setStock('');
    setAvailableStock('');
    setMinimumOrder('1');
    setPrice('');
    setCategory('Fruits');
    setSubcategory('');
    setCropType('Fruits');
    setPercentage('');
    setValidUntil(null);
    setImages([]);
    setTags('');
    setIsFeatured(false);
    setIsBundled(false);
    setDeliveryOptions({
      pickup: true,
      delivery: false,
      shipping: false
    });
  };

  const handleAddProduct = async () => {
    if (!name || !description || !stock || !price) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setUploading(true);

    try {
      // Upload images first
      const imageUrls = [];
      for (const image of images) {
        const url = await uploadImageAsync(image.uri);
        imageUrls.push(url);
      }

      // Generate product ID
      const now = new Date();
      const productId = `${currentFarmId}_${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(Math.floor(Math.random() * 10000)).padStart(4,'0')}`;

      // Prepare product data
      const productData = {
        productId,
        farmId: currentFarmId,
        name,
        cropType,
        description,
        price: parseFloat(price),
        unit: 'Kilogram', // Default unit
        stock: parseInt(stock),
        availableStock: parseInt(availableStock || stock),
        images: imageUrls,
        status,
        isBundled,
        percentage: percentage ? parseInt(percentage) : 0,
        validUntil: validUntil ? Timestamp.fromDate(validUntil) : null,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        harvestDate: serverTimestamp(),
        isFeatured,
        category,
        subcategory,
        deliveryOptions,
        minimumOrder: parseInt(minimumOrder),
        rating: {
          average: 0,
          count: 0
        },
        views: 0
      };

      // Add bundle details if bundled product
      if (isBundled) {
        productData.bundleDetails = bundleDetails;
      }

      // Add to Firestore
      await addDoc(collection(db, 'products'), productData);
      
      Alert.alert('Success', 'Product added successfully');
      clearForm();
    } catch (error) {
      console.error('Error adding product: ', error);
      Alert.alert('Error', 'Failed to add product');
    } finally {
      setUploading(false);
    }
  };

  const toggleDeliveryOption = (option) => {
    setDeliveryOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Product</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Product Images */}
        <Text style={styles.sectionTitle}>Product Images</Text>
        <View style={styles.imageSection}>
          <TouchableOpacity style={styles.mainImage} onPress={pickImage}>
            {images[0]?.uri ? (
              <Image source={{ uri: images[0].uri }} style={styles.imagePreview} />
            ) : (
              <View style={styles.addImageContainer}>
                <Ionicons name="camera" size={32} color="#9DCD5A" />
                <Text style={styles.addImageText}>Add Main Image</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.additionalImages}>
            {[...Array(5)].map((_, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.smallImageBox} 
                onPress={pickImage}
              >
                {images[index + 1]?.uri ? (
                  <Image source={{ uri: images[index + 1].uri }} style={styles.smallImagePreview} />
                ) : (
                  <View style={styles.addSmallImageContainer}>
                    <Ionicons name="add" size={20} color="#9DCD5A" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Basic Information */}
        <Text style={styles.sectionTitle}>Basic Information</Text>
        <View style={styles.card}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Product Name*</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Premium Grapes"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description*</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              multiline
              placeholder="Describe your product in detail"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Category*</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={category}
                  onValueChange={setCategory}
                >
                  <Picker.Item label="Fruits" value="Fruits" />
                  <Picker.Item label="Vegetables" value="Vegetables" />
                  <Picker.Item label="Grains" value="Grains" />
                  <Picker.Item label="Dairy" value="Dairy" />
                </Picker>
              </View>
            </View>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Subcategory</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Grapes"
                value={subcategory}
                onChangeText={setSubcategory}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Tags</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: organic, fresh, premium"
              value={tags}
              onChangeText={setTags}
            />
            <Text style={styles.hint}>Separate tags with commas</Text>
          </View>
        </View>

        {/* Pricing & Inventory */}
        <Text style={styles.sectionTitle}>Pricing & Inventory</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Price*</Text>
              <View style={styles.priceInputContainer}>
                <Text style={styles.currencySymbol}>₱</Text>
                <TextInput
                  style={[styles.input, styles.priceInput]}
                  keyboardType="numeric"
                  placeholder="0.00"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>
            </View>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Discount %</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="0"
                value={percentage}
                onChangeText={setPercentage}
              />
            </View>
          </View>

          {percentage ? (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Discount Valid Until</Text>
              <TouchableOpacity 
                style={styles.dateInput} 
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={validUntil ? styles.dateText : styles.placeholderText}>
                  {validUntil ? validUntil.toDateString() : 'Select date'}
                </Text>
                <Ionicons name="calendar" size={20} color="#9DCD5A" />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={validUntil || new Date()}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={(event, date) => {
                    setShowDatePicker(false);
                    if (date) setValidUntil(date);
                  }}
                />
              )}
            </View>
          ) : null}

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Total Stock*</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="0"
                value={stock}
                onChangeText={setStock}
              />
            </View>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Available Stock</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Same as total"
                value={availableStock}
                onChangeText={setAvailableStock}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Minimum Order Quantity*</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="1"
              value={minimumOrder}
              onChangeText={setMinimumOrder}
            />
          </View>
        </View>

        {/* Delivery Options */}
        <Text style={styles.sectionTitle}>Delivery Options</Text>
        <View style={styles.card}>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Pickup Available</Text>
            <Switch
              value={deliveryOptions.pickup}
              onValueChange={() => toggleDeliveryOption('pickup')}
              thumbColor={deliveryOptions.pickup ? '#9DCD5A' : '#f4f3f4'}
              trackColor={{ false: '#767577', true: '#9DCD5A' }}
            />
          </View>
          
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Local Delivery</Text>
            <Switch
              value={deliveryOptions.delivery}
              onValueChange={() => toggleDeliveryOption('delivery')}
              thumbColor={deliveryOptions.delivery ? '#9DCD5A' : '#f4f3f4'}
              trackColor={{ false: '#767577', true: '#9DCD5A' }}
            />
          </View>
          
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Shipping Available</Text>
            <Switch
              value={deliveryOptions.shipping}
              onValueChange={() => toggleDeliveryOption('shipping')}
              thumbColor={deliveryOptions.shipping ? '#9DCD5A' : '#f4f3f4'}
              trackColor={{ false: '#767577', true: '#9DCD5A' }}
            />
          </View>
        </View>

        {/* Product Status */}
        <Text style={styles.sectionTitle}>Product Status</Text>
        <View style={styles.card}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={status}
                onValueChange={setStatus}
              >
                <Picker.Item label="Available" value="available" />
                <Picker.Item label="Sold Out" value="sold-out" />
                <Picker.Item label="Seasonal" value="seasonal" />
              </Picker>
            </View>
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Featured Product</Text>
            <Switch
              value={isFeatured}
              onValueChange={setIsFeatured}
              thumbColor={isFeatured ? '#9DCD5A' : '#f4f3f4'}
              trackColor={{ false: '#767577', true: '#9DCD5A' }}
            />
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Bundled Product</Text>
            <Switch
              value={isBundled}
              onValueChange={setIsBundled}
              thumbColor={isBundled ? '#9DCD5A' : '#f4f3f4'}
              trackColor={{ false: '#767577', true: '#9DCD5A' }}
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleAddProduct}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Add Product</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginTop: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageSection: {
    marginBottom: 16,
  },
  mainImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  addImageContainer: {
    alignItems: 'center',
  },
  addImageText: {
    marginTop: 8,
    color: '#9DCD5A',
    fontWeight: '500',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  additionalImages: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallImageBox: {
    width: 60,
    height: 60,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  addSmallImageContainer: {
    alignItems: 'center',
  },
  smallImagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  input: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#eee',
    height: 55,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pickerContainer: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  currencySymbol: {
    paddingHorizontal: 12,
    color: '#555',
    fontWeight: '500',
  },
  priceInput: {
    flex: 1,
    borderWidth: 0,
    paddingLeft: 0,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  dateText: {
    color: '#000',
  },
  placeholderText: {
    color: '#999',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 14,
    color: '#555',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#9DCD5A',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default AddProductScreen;