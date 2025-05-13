import { db, auth } from '../config/firebase';
import { collection, addDoc, serverTimestamp, Timestamp, getDocs, query, where } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
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
  Switch,
  Modal,
  FlatList
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

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
    discount: 0,
    totalPrice: 0,
    discountedPrice: 0
  });
  const [showBundleModal, setShowBundleModal] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  
  // Tags
  const [tags, setTags] = useState('');
  
  // Image handling
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  
  // Replace these with actual values from your auth context
  const currentUserId = auth.currentUser?.uid;
  const currentFarmId = currentUserId; // Setting farmId equal to userId

  // Fetch available products for bundling
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), where('farmId', '==', currentFarmId));
        const querySnapshot = await getDocs(q);
        const products = [];
        querySnapshot.forEach((doc) => {
          products.push({ id: doc.id, ...doc.data() });
        });
        setAvailableProducts(products);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    if (isBundled) {
      fetchProducts();
    }
  }, [isBundled, currentFarmId]);

  // Enable featured product if discount > 50
  useEffect(() => {
    if (parseInt(percentage) > 50) {
      setIsFeatured(true);
    }
  }, [percentage]);

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

  const uploadImageAsync = async (uri, index) => {
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
    const storageRef = ref(storage, `products/${currentUserId}/${Date.now()}_${index}.jpg`);
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
    setBundleDetails({
      items: [],
      discount: 0,
      totalPrice: 0,
      discountedPrice: 0
    });
  };

  const generateProductId = () => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return `${currentUserId}_${randomNum}`;
  };

  const handleAddProduct = async () => {
    if (!name || !description || !stock || !price) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (isBundled && bundleDetails.items.length === 0) {
      Alert.alert('Error', 'Please select products to bundle');
      return;
    }

    setUploading(true);

    try {
      // Upload images first with incremental numbering
      const imageUrls = [];
      for (let i = 0; i < images.length; i++) {
        const url = await uploadImageAsync(images[i].uri, i + 1);
        imageUrls.push(url);
      }

      // Generate product ID
      const productId = generateProductId();

      // Prepare product data
      const productData = {
        productId,
        farmId: currentFarmId,
        userId: currentUserId, // Adding userId as well
        name,
        cropType,
        description,
        price: parseFloat(price),
        unit: 'Kilogram',
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
        isFeatured: isFeatured && parseInt(percentage) > 50,
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

  const toggleProductSelection = (product) => {
    setSelectedProducts(prev => {
      const isSelected = prev.some(p => p.id === product.id);
      if (isSelected) {
        return prev.filter(p => p.id !== product.id);
      } else {
        if (prev.length < 5) { // Limit to 5 products in a bundle
          return [...prev, product];
        } else {
          Alert.alert('Limit reached', 'You can select maximum 5 products in a bundle');
          return prev;
        }
      }
    });
  };

  const saveBundleDetails = () => {
    const items = selectedProducts.map(product => ({
      productId: product.id,
      name: product.name,
      quantity: 1, // Default quantity
      price: product.price,
      image: product.images[0] || null
    }));

    // Calculate total price and discounted price
    const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
    const discountedPrice = totalPrice * (1 - bundleDetails.discount / 100);

    setBundleDetails({
      ...bundleDetails,
      items,
      totalPrice,
      discountedPrice
    });

    setShowBundleModal(false);
  };

  const updateBundleItemQuantity = (productId, quantity) => {
    setBundleDetails(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.productId === productId ? { ...item, quantity } : item
      )
    }));
  };

  const renderProductItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.productItem,
        selectedProducts.some(p => p.id === item.id) && styles.selectedProductItem
      ]}
      onPress={() => toggleProductSelection(item)}
    >
      <Image 
        source={{ uri: item.images[0] || 'https://via.placeholder.com/150' }} 
        style={styles.productImage} 
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>₱{item.price.toFixed(2)}</Text>
        <Text style={styles.productStock}>Stock: {item.availableStock || item.stock}</Text>
      </View>
      {selectedProducts.some(p => p.id === item.id) && (
        <MaterialCommunityIcons name="check-circle" size={24} color="#8CC63F" />
      )}
    </TouchableOpacity>
  );

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
                onPress={() => {
                  if (index === 0 || images[index - 1]?.uri) {
                    pickImage();
                  }
                }}
                disabled={index > 0 && !images[index - 1]?.uri}
              >
                {images[index + 1]?.uri ? (
                  <Image source={{ uri: images[index + 1].uri }} style={styles.smallImagePreview} />
                ) : (
                  <View style={styles.addSmallImageContainer}>
                    {index === 0 || images[index - 1]?.uri ? (
                      <Ionicons name="add" size={20} color="#9DCD5A" />
                    ) : null}
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
              disabled={parseInt(percentage) <= 50}
              thumbColor={isFeatured ? '#9DCD5A' : '#f4f3f4'}
              trackColor={{ false: '#767577', true: '#9DCD5A' }}
            />
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Bundled Product</Text>
            <Switch
              value={isBundled}
              onValueChange={(value) => {
                setIsBundled(value);
                if (!value) {
                  setBundleDetails({
                    items: [],
                    discount: 0,
                    totalPrice: 0,
                    discountedPrice: 0
                  });
                }
              }}
              disabled={availableProducts.length === 0}
              thumbColor={isBundled ? '#9DCD5A' : '#f4f3f4'}
              trackColor={{ false: '#767577', true: '#9DCD5A' }}
            />
          </View>

          {isBundled && (
            <>
              <TouchableOpacity 
                style={styles.bundleButton}
                onPress={() => setShowBundleModal(true)}
              >
                <Text style={styles.bundleButtonText}>
                  {bundleDetails.items.length > 0 
                    ? `Edit Bundle (${bundleDetails.items.length} items)`
                    : 'Select Products to Bundle'}
                </Text>
              </TouchableOpacity>

              {bundleDetails.items.length > 0 && (
                <View style={styles.bundleSummary}>
                  <Text style={styles.bundleSummaryTitle}>Bundle Summary:</Text>
                  <ScrollView style={styles.bundleItemsContainer}>
                    {bundleDetails.items.map((item, index) => (
                      <View key={index} style={styles.bundleItem}>
                        <Image 
                          source={{ uri: item.image || 'https://via.placeholder.com/150' }} 
                          style={styles.bundleItemImage} 
                        />
                        <View style={styles.bundleItemDetails}>
                          <Text style={styles.bundleItemName} numberOfLines={1}>
                            {item.name}
                          </Text>
                          <Text style={styles.bundleItemPrice}>
                            ₱{item.price.toFixed(2)} x {item.quantity}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                  <View style={styles.bundleTotal}>
                    <Text style={styles.bundleTotalText}>Subtotal: ₱{bundleDetails.totalPrice.toFixed(2)}</Text>
                    <Text style={styles.bundleDiscountText}>
                      Discount: {bundleDetails.discount}% (₱{(bundleDetails.totalPrice * (bundleDetails.discount / 100)).toFixed(2)})
                    </Text>
                    <Text style={styles.bundleFinalPrice}>
                      Final Price: ₱{bundleDetails.discountedPrice.toFixed(2)}
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}
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

      {/* Bundle Products Modal */}
      <Modal
        visible={showBundleModal}
        animationType="slide"
        onRequestClose={() => setShowBundleModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setShowBundleModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Products to Bundle</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.productListContainer}>
            <FlatList
              data={availableProducts}
              renderItem={renderProductItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.productList}
            />
          </View>

          {selectedProducts.length > 0 && (
            <View style={styles.bundleControls}>
              <View style={styles.discountInputContainer}>
                <Text style={styles.discountLabel}>Bundle Discount %</Text>
                <TextInput
                  style={styles.discountInput}
                  keyboardType="numeric"
                  value={bundleDetails.discount.toString()}
                  onChangeText={(text) => 
                    setBundleDetails(prev => ({
                      ...prev,
                      discount: Math.min(100, Math.max(0, parseInt(text) || 0))
                    }))
                  }
                />
              </View>

              <TouchableOpacity 
                style={styles.saveBundleButton}
                onPress={saveBundleDetails}
              >
                <Text style={styles.saveBundleButtonText}>Save Bundle ({selectedProducts.length} items)</Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </Modal>
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
  bundleButton: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  bundleButtonText: {
    color: '#8CC63F',
    fontWeight: '600',
  },
  bundleSummary: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
  },
  bundleItemsContainer: {
    maxHeight: 200,
    marginBottom: 10,
  },
  bundleSummaryTitle: {
    fontWeight: '600',
    marginBottom: 5,
  },
  bundleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  bundleItemImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 10,
  },
  bundleItemDetails: {
    flex: 1,
  },
  bundleItemName: {
    color: '#555',
    fontWeight: '500',
  },
  bundleItemPrice: {
    color: '#555',
  },
  bundleTotal: {
    marginTop: 5,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  bundleTotalText: {
    fontWeight: '600',
  },
  bundleDiscountText: {
    color: '#8CC63F',
  },
  bundleFinalPrice: {
    fontWeight: '600',
    color: '#009216',
    fontSize: 16,
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  productListContainer: {
    flex: 1,
  },
  productList: {
    padding: 16,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
  },
  selectedProductItem: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#8CC63F',
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontWeight: '500',
  },
  productPrice: {
    color: '#009216',
  },
  productStock: {
    fontSize: 12,
    color: '#666',
  },
  bundleControls: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  discountInputContainer: {
    marginBottom: 12,
  },
  discountLabel: {
    marginBottom: 8,
    fontWeight: '500',
  },
  discountInput: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  saveBundleButton: {
    backgroundColor: '#9DCD5A',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBundleButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default AddProductScreen;