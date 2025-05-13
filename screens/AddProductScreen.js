import { db, auth, storage } from '../config/firebase';
import { collection, addDoc, doc, updateDoc, getDoc, serverTimestamp, Timestamp, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
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
  Switch,
  Modal,
  FlatList
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';



const AddProductScreen = ({ navigation, route }) => {
  const { product: existingProduct, mode = 'add' } = route.params || {};
  
  // Product Information
  const [name, setName] = useState(existingProduct?.name || '');
  const [description, setDescription] = useState(existingProduct?.description || '');
  const [price, setPrice] = useState(existingProduct?.price?.toString() || '');
  const [stock, setStock] = useState(existingProduct?.stock?.toString() || '');
  const [availableStock, setAvailableStock] = useState(existingProduct?.availableStock?.toString() || '');
  const [minimumOrder, setMinimumOrder] = useState(existingProduct?.minimumOrder?.toString() || '1');
  
  // Category & Type
  const [category, setCategory] = useState(existingProduct?.category || 'Fruits');
  const [subcategory, setSubcategory] = useState(existingProduct?.subcategory || '');
  const [cropType, setCropType] = useState(existingProduct?.cropType || 'Fruits');
  
  // Pricing & Discount
  const [percentage, setPercentage] = useState(existingProduct?.percentage?.toString() || '');
  const [validUntil, setValidUntil] = useState(
    existingProduct?.validUntil ? existingProduct.validUntil.toDate() : null
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Delivery Options
  const [deliveryOptions, setDeliveryOptions] = useState(
    existingProduct?.deliveryOptions || {
      pickup: true,
      delivery: false,
      shipping: false
    }
  );
  
  // Product Status
  const [status, setStatus] = useState(existingProduct?.status || 'available');
  const [isFeatured, setIsFeatured] = useState(existingProduct?.isFeatured || false);
  const [isBundled, setIsBundled] = useState(existingProduct?.isBundled || false);
  
  // Bundle Details
  const [bundleDetails, setBundleDetails] = useState(
    existingProduct?.bundleDetails || {
      items: [],
      discount: 0,
      totalPrice: 0,
      discountedPrice: 0
    }
  );
  const [showBundleModal, setShowBundleModal] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  
  // Tags
  const [tags, setTags] = useState(existingProduct?.tags?.join(', ') || '');
  
  // Image handling
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState(existingProduct?.images || []);
  const [uploading, setUploading] = useState(false);
  
  const currentUserId = auth.currentUser?.uid;
  const currentFarmId = currentUserId;

  // Initialize form with existing product data
  useEffect(() => {
    if (existingProduct) {
      if (existingProduct.bundleDetails?.items) {
        setSelectedProducts(existingProduct.bundleDetails.items);
      }
    }
  }, [existingProduct]);

  // Fetch available products for bundling
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), where('farmId', '==', currentFarmId));
        const querySnapshot = await getDocs(q);
        const products = [];
        querySnapshot.forEach((doc) => {
          if (doc.id !== existingProduct?.id) { // Exclude current product when editing
            products.push({ id: doc.id, ...doc.data() });
          }
        });
        setAvailableProducts(products);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    if (isBundled) {
      fetchProducts();
    }
  }, [isBundled, currentFarmId, existingProduct?.id]);

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
      if (images.length + existingImages.length < 6) {
        setImages([...images, result.assets[0]]);
      } else {
        Alert.alert('Limit reached', 'You can upload maximum 6 images');
      }
    }
  };

  const removeImage = async (imageUri, isExisting) => {
    if (isExisting) {
      // Remove from existing images array
      setExistingImages(existingImages.filter(img => img !== imageUri));
      
      // Delete from Firebase Storage
      try {
        const imageRef = ref(storage, imageUri);
        await deleteObject(imageRef);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    } else {
      // Remove from new images array
      setImages(images.filter(img => img.uri !== imageUri));
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
    setExistingImages([]);
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

  const handleSaveProduct = async () => {
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
      // Upload new images first
      const newImageUrls = [];
      for (let i = 0; i < images.length; i++) {
        const url = await uploadImageAsync(images[i].uri, i + 1);
        newImageUrls.push(url);
      }

      // Combine existing and new images
      const allImageUrls = [...existingImages, ...newImageUrls];

      // Prepare product data
      const productData = {
        farmId: currentFarmId,
        userId: currentUserId,
        name,
        cropType,
        description,
        price: parseFloat(price),
        unit: 'Kilogram',
        stock: parseInt(stock),
        availableStock: parseInt(availableStock || stock),
        images: allImageUrls,
        status,
        isBundled,
        percentage: percentage ? parseInt(percentage) : 0,
        validUntil: validUntil ? Timestamp.fromDate(validUntil) : null,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        updatedAt: serverTimestamp(),
        isFeatured: isFeatured && parseInt(percentage) > 50,
        category,
        subcategory,
        deliveryOptions,
        minimumOrder: parseInt(minimumOrder),
      };

      // Add bundle details if bundled product
      if (isBundled) {
        productData.bundleDetails = bundleDetails;
      }

      if (mode === 'edit' && existingProduct) {
        // Update existing product
        await updateDoc(doc(db, 'products', existingProduct.id), productData);
        Alert.alert('Success', 'Product updated successfully');
      } else {
        // Add new product
        productData.createdAt = serverTimestamp();
        productData.harvestDate = serverTimestamp();
        productData.rating = {
          average: 0,
          count: 0
        };
        productData.views = 0;
        
        await addDoc(collection(db, 'products'), productData);
        Alert.alert('Success', 'Product added successfully');
        clearForm();
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving product: ', error);
      Alert.alert('Error', `Failed to ${mode === 'edit' ? 'update' : 'add'} product`);
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
      const isSelected = prev.some(p => p.productId === product.id);
      if (isSelected) {
        return prev.filter(p => p.productId !== product.id);
      } else {
        if (prev.length < 5) { // Limit to 5 products in a bundle
          return [...prev, {
            productId: product.id,
            name: product.name,
            quantity: 1,
            price: product.price,
            image: product.images?.[0] || null
          }];
        } else {
          Alert.alert('Limit reached', 'You can select maximum 5 products in a bundle');
          return prev;
        }
      }
    });
  };

  const saveBundleDetails = () => {
    // Calculate total price and discounted price
    const totalPrice = selectedProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountedPrice = totalPrice * (1 - bundleDetails.discount / 100);

    setBundleDetails({
      ...bundleDetails,
      items: selectedProducts,
      totalPrice,
      discountedPrice
    });

    setShowBundleModal(false);
  };

  const updateBundleItemQuantity = (productId, quantity) => {
    setSelectedProducts(prev =>
      prev.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const renderProductItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.productItem,
        selectedProducts.some(p => p.productId === item.id) && styles.selectedProductItem
      ]}
      onPress={() => toggleProductSelection(item)}
    >
      <Image 
        source={{ uri: item.images?.[0] || 'https://via.placeholder.com/150' }} 
        style={styles.productImage} 
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>₱{item.price.toFixed(2)}</Text>
        <Text style={styles.productStock}>Stock: {item.availableStock || item.stock}</Text>
      </View>
      {selectedProducts.some(p => p.productId === item.id) && (
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
        <Text style={styles.headerTitle}>
          {mode === 'edit' ? 'Edit Product' : 'Add New Product'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Product Images */}
        <Text style={styles.sectionTitle}>Product Images</Text>
        <View style={styles.imageSection}>
          <TouchableOpacity style={styles.mainImage} onPress={pickImage}>
            {(existingImages[0] || images[0]?.uri) ? (
              <Image 
                source={{ uri: existingImages[0] || images[0].uri }} 
                style={styles.imagePreview} 
              />
            ) : (
              <View style={styles.addImageContainer}>
                <Ionicons name="camera" size={32} color="#9DCD5A" />
                <Text style={styles.addImageText}>Add Main Image</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.additionalImages}>
            {[...Array(5)].map((_, index) => {
              const imageIndex = index + 1;
              const existingImage = existingImages[imageIndex];
              const newImage = images[imageIndex]?.uri;
              
              return (
                <TouchableOpacity 
                  key={index} 
                  style={styles.smallImageBox} 
                  onPress={() => {
                    if (existingImage || newImage || 
                        (index === 0 && (existingImages[0] || images[0]?.uri)) || 
                        (index > 0 && (existingImages[index] || images[index]?.uri))) {
                      pickImage();
                    }
                  }}
                >
                  {existingImage || newImage ? (
                    <View style={{ position: 'relative' }}>
                      <Image 
                        source={{ uri: existingImage || newImage }} 
                        style={styles.smallImagePreview} 
                      />
                      <TouchableOpacity
                        style={styles.deleteImageButton}
                        onPress={() => removeImage(existingImage || newImage, !!existingImage)}
                      >
                        <Ionicons name="close" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.addSmallImageContainer}>
                      {(index === 0 && (existingImages[0] || images[0]?.uri)) || 
                       (index > 0 && (existingImages[index] || images[index]?.uri)) ? (
                        <Ionicons name="add" size={20} color="#9DCD5A" />
                      ) : null}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Product Information */}
        <Text style={styles.sectionTitle}>Product Information</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Product Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter product name"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Enter product description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Price (₱) *</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Stock *</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              keyboardType="numeric"
              value={stock}
              onChangeText={setStock}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Available Stock</Text>
            <TextInput
              style={styles.input}
              placeholder="Same as stock"
              keyboardType="numeric"
              value={availableStock}
              onChangeText={setAvailableStock}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Minimum Order</Text>
            <TextInput
              style={styles.input}
              placeholder="1"
              keyboardType="numeric"
              value={minimumOrder}
              onChangeText={setMinimumOrder}
            />
          </View>
        </View>

        {/* Category & Type */}
        <Text style={styles.sectionTitle}>Category & Type</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <Picker
            selectedValue={category}
            onValueChange={(itemValue) => setCategory(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Fruits" value="Fruits" />
            <Picker.Item label="Vegetables" value="Vegetables" />
            <Picker.Item label="Herbs" value="Herbs" />
            <Picker.Item label="Grains" value="Grains" />
            <Picker.Item label="Livestock" value="Livestock" />
            <Picker.Item label="Dairy" value="Dairy" />
            <Picker.Item label="Other" value="Other" />
          </Picker>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Subcategory (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Citrus, Leafy Greens"
            value={subcategory}
            onChangeText={setSubcategory}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Crop Type</Text>
          <Picker
            selectedValue={cropType}
            onValueChange={(itemValue) => setCropType(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Fruits" value="Fruits" />
            <Picker.Item label="Vegetables" value="Vegetables" />
            <Picker.Item label="Herbs" value="Herbs" />
            <Picker.Item label="Grains" value="Grains" />
            <Picker.Item label="Livestock" value="Livestock" />
            <Picker.Item label="Dairy" value="Dairy" />
            <Picker.Item label="Other" value="Other" />
          </Picker>
        </View>

        {/* Pricing & Discount */}
        <Text style={styles.sectionTitle}>Pricing & Discount</Text>
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Discount % (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              keyboardType="numeric"
              value={percentage}
              onChangeText={setPercentage}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Valid Until</Text>
            <TouchableOpacity 
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text>{validUntil ? validUntil.toDateString() : 'Select date'}</Text>
              <Ionicons name="calendar" size={20} color="#9DCD5A" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={validUntil || new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setValidUntil(selectedDate);
                  }
                }}
              />
            )}
          </View>
        </View>

        {/* Delivery Options */}
        <Text style={styles.sectionTitle}>Delivery Options</Text>
        <View style={styles.deliveryOptions}>
          <TouchableOpacity 
            style={[
              styles.deliveryOption,
              deliveryOptions.pickup && styles.selectedDeliveryOption
            ]}
            onPress={() => toggleDeliveryOption('pickup')}
          >
            <Ionicons 
              name={deliveryOptions.pickup ? "radio-button-on" : "radio-button-off"} 
              size={24} 
              color={deliveryOptions.pickup ? "#8CC63F" : "#ccc"} 
            />
            <Text style={styles.deliveryOptionText}>Pickup</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.deliveryOption,
              deliveryOptions.delivery && styles.selectedDeliveryOption
            ]}
            onPress={() => toggleDeliveryOption('delivery')}
          >
            <Ionicons 
              name={deliveryOptions.delivery ? "radio-button-on" : "radio-button-off"} 
              size={24} 
              color={deliveryOptions.delivery ? "#8CC63F" : "#ccc"} 
            />
            <Text style={styles.deliveryOptionText}>Delivery</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.deliveryOption,
              deliveryOptions.shipping && styles.selectedDeliveryOption
            ]}
            onPress={() => toggleDeliveryOption('shipping')}
          >
            <Ionicons 
              name={deliveryOptions.shipping ? "radio-button-on" : "radio-button-off"} 
              size={24} 
              color={deliveryOptions.shipping ? "#8CC63F" : "#ccc"} 
            />
            <Text style={styles.deliveryOptionText}>Shipping</Text>
          </TouchableOpacity>
        </View>

        {/* Product Status */}
        <Text style={styles.sectionTitle}>Product Status</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Status</Text>
          <Picker
            selectedValue={status}
            onValueChange={(itemValue) => setStatus(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Available" value="available" />
            <Picker.Item label="Out of Stock" value="out_of_stock" />
            <Picker.Item label="Coming Soon" value="coming_soon" />
            <Picker.Item label="Seasonal" value="seasonal" />
          </Picker>
        </View>

        <View style={styles.switchGroup}>
          <Text style={styles.label}>Featured Product</Text>
          <Switch
            value={isFeatured}
            onValueChange={setIsFeatured}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isFeatured ? "#f5dd4b" : "#f4f3f4"}
          />
        </View>

        <View style={styles.switchGroup}>
          <Text style={styles.label}>Bundled Product</Text>
          <Switch
            value={isBundled}
            onValueChange={setIsBundled}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isBundled ? "#f5dd4b" : "#f4f3f4"}
          />
          {isBundled && (
            <TouchableOpacity 
              style={styles.bundleButton}
              onPress={() => setShowBundleModal(true)}
            >
              <Text style={styles.bundleButtonText}>
                {bundleDetails.items.length > 0 
                  ? `Edit Bundle (${bundleDetails.items.length} items)` 
                  : 'Add Products to Bundle'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tags */}
        <Text style={styles.sectionTitle}>Tags</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Product Tags (comma separated)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. organic, fresh, local"
            value={tags}
            onChangeText={setTags}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleSaveProduct}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>
              {mode === 'edit' ? 'Save Changes' : 'Add Product'}
            </Text>
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
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deliveryOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  deliveryOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 4,
  },
  selectedDeliveryOption: {
    borderColor: '#8CC63F',
  },
  deliveryOptionText: {
    marginLeft: 8,
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bundleButton: {
    backgroundColor: '#8CC63F',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  bundleButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#8CC63F',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageSection: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  mainImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  addImageContainer: {
    alignItems: 'center',
  },
  addImageText: {
    marginTop: 8,
    color: '#9DCD5A',
  },
  additionalImages: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  smallImageBox: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginBottom: 8,
  },
  smallImagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  addSmallImageContainer: {
    alignItems: 'center',
  },
  deleteImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedProductItem: {
    borderColor: '#8CC63F',
    backgroundColor: '#f8fff0',
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
    fontWeight: 'bold',
  },
  productPrice: {
    color: '#8CC63F',
  },
  productStock: {
    color: '#666',
    fontSize: 12,
  },
  bundleControls: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  discountInputContainer: {
    marginBottom: 16,
  },
  discountLabel: {
    marginBottom: 8,
    fontSize: 14,
    color: '#666',
  },
  discountInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  saveBundleButton: {
    backgroundColor: '#8CC63F',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBundleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddProductScreen;