import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Modal, 
  TouchableWithoutFeedback,
  FlatList,
  Platform,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dialog, Portal, Button as PaperButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../context/AuthContext';
import { db, storage } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import * as mime from 'react-native-mime-types';

const { width } = Dimensions.get('window');

const FarmProfileScreen = ({ navigation }) => {
  const { userData } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Initial empty state for farm profile
  const initialState = {
    farmName: '',
    ownerName: '',
    email: '',
    phone: '',
    farmType: '',
    farmAddress: {
      street: '',
      barangay: '',
      city: '',
      province: '',
      region: '',
      postalCode: '',
      coordinates: { latitude: 0, longitude: 0 }
    },
    farmSize: '',
    certification: '',
    yearsOperating: 0,
    description: '',
    farmImageUrl: '',
    rating: {
      average: 0,
      count: 0
    },
    isVerified: false,
    status: 'active'
  };

  // State management
  const [formData, setFormData] = useState(initialState);
  const [originalData, setOriginalData] = useState(initialState);
  const [isEditable, setIsEditable] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [visibleDialog, setVisibleDialog] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({ title: '', message: '', actions: [] });
  const [farmImage, setFarmImage] = useState(require('../assets/images/farm-placeholder.png'));
  const [showFarmTypeModal, setShowFarmTypeModal] = useState(false);
  const [newImageSelected, setNewImageSelected] = useState(false);

  const inputRefs = useRef({});
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  // Farm type options
  const farmTypeOptions = [
    { value: 'Organic Crop Farm', icon: 'leaf', iconLib: MaterialCommunityIcons, iconColor: '#4CAF50' },
    { value: 'Livestock Farm', icon: 'cow', iconLib: MaterialCommunityIcons, iconColor: '#795548' },
    { value: 'Poultry Farm', icon: 'egg', iconLib: MaterialCommunityIcons, iconColor: '#FFC107' },
    { value: 'Dairy Farm', icon: 'cow', iconLib: MaterialCommunityIcons, iconColor: '#2196F3' },
    { value: 'Aquaculture Farm', icon: 'fish', iconLib: MaterialCommunityIcons, iconColor: '#00BCD4' },
    { value: 'Mixed Farm', icon: 'barn', iconLib: MaterialCommunityIcons, iconColor: '#9E9E9E' }
  ];

  // Validation functions
  const validateEmail = (email) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
  const validatePhone = (phone) => /^\+?[\d\s-]{10,15}$/.test(phone);

  // Helper functions
  const showDialog = (title, message, actions) => {
    setDialogConfig({ title, message, actions });
    setVisibleDialog(true);
  };

  const hideDialog = () => setVisibleDialog(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setFarmImage({ uri: result.assets[0].uri });
      setNewImageSelected(true);
    }
  };

  // Fetch farm data from Firestore
  const fetchFarmData = async () => {
    if (!userData?.userId) return;
    
    try {
      setIsLoading(true);
      const farmRef = doc(db, 'farms', userData.userId);
      const farmSnap = await getDoc(farmRef);
      
      if (farmSnap.exists()) {
        const data = farmSnap.data();
        setFormData(data);
        setOriginalData(data);
        
        if (data.farmImageUrl) {
          setFarmImage({ uri: data.farmImageUrl });
        }
      } else {
        // Initialize with empty values if no document exists
        setFormData({
          ...initialState,
          email: userData.email || '',
          ownerName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
        });
        setOriginalData(initialState);
      }
    } catch (error) {
      console.error('Error fetching farm data:', error);
      showDialog('Error', 'Failed to load farm profile', [
        { text: 'OK', onPress: hideDialog }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Upload image to Firebase Storage
  const uploadImage = async (uri) => {
    if (!userData?.userId) return null;
    
    try {
      setUploading(true);
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Delete previous image if exists
      if (formData.farmImageUrl) {
        const oldImageRef = ref(storage, formData.farmImageUrl);
        try {
          await deleteObject(oldImageRef);
        } catch (error) {
          console.log('No previous image to delete or error deleting:', error);
        }
      }
      
      // Upload new image
      const fileExtension = uri.split('.').pop();
      const fileName = `${userData.userId}_FarmProfilePic.${fileExtension}`;
      const storageRef = ref(storage, `FarmsProfilePics/${fileName}`);
      
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  // Save farm data to Firestore
  const saveFarmData = async () => {
    if (!userData?.userId) return;
    
    try {
      setIsLoading(true);
      let imageUrl = formData.farmImageUrl;
      
      // Upload new image if selected
      if (newImageSelected && farmImage.uri) {
        imageUrl = await uploadImage(farmImage.uri);
      }
      
      const farmData = {
        ...formData,
        farmImageUrl: imageUrl || '',
        userId: userData.userId,
        updatedAt: new Date(),
        createdAt: formData.createdAt || new Date()
      };
      
      const farmRef = doc(db, 'farms', userData.userId);
      await setDoc(farmRef, farmData, { merge: true });
      
      setOriginalData(farmData);
      setFormData(farmData);
      setNewImageSelected(false);
      
      showDialog('Success', 'Farm profile saved successfully', [
        { text: 'OK', onPress: () => {
              navigation.navigate('FarmDashboard');
              hideDialog();
            } }
      ]);
    } catch (error) {
      console.error('Error saving farm data:', error);
      showDialog('Error', 'Failed to save farm profile', [
        { text: 'OK', onPress: hideDialog }
      ]);
    } finally {
      setIsLoading(false);
      setIsEditable(false);
    }
  };

  // Event handlers
  const handleBackPress = () => {
    if (hasChanges) {
      showDialog(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Cancel', onPress: hideDialog },
          { 
            text: 'Discard', 
            onPress: () => {
              hideDialog();
              setFormData(originalData);
              setIsEditable(false);
              navigation.goBack();
            }
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const handleSave = () => {
    if (!validateForm()) return;
    
    showDialog(
      'Confirm Changes',
      'Are you sure you want to save these changes to your farm profile?',
      [
        { text: 'Cancel', onPress: hideDialog },
        {
          text: 'Save Changes', 
          onPress: () => {
            hideDialog();
            saveFarmData();
          }
        },
      ]
    );
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.farmName.trim()) errors.farmName = 'Farm name is required';
    if (!formData.ownerName.trim()) errors.ownerName = 'Owner name is required';
    if (!validateEmail(formData.email)) errors.email = 'Invalid email address';
    if (!validatePhone(formData.phone)) errors.phone = 'Invalid phone number';
    if (!formData.farmAddress.street.trim()) errors.farmAddress = 'Farm address is required';
    if (!formData.farmType.trim()) errors.farmType = 'Farm type is required';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFarmTypeSelect = (type) => {
    setFormData({ ...formData, farmType: type });
    setShowFarmTypeModal(false);
  };

  const handleAddressChange = (field, value) => {
    setFormData({
      ...formData,
      farmAddress: {
        ...formData.farmAddress,
        [field]: value
      }
    });
  };

  // Load data when screen focuses or userData changes
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchFarmData();
    });
    
    return unsubscribe;
  }, [navigation, userData]);

  // Style getters
  const getInputStyle = (fieldName) => [
    styles.input,
    focusedField === fieldName && styles.inputFocused,
    validationErrors[fieldName] && styles.inputError
  ];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A7C59" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#4A7C59" />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Farm Profile</Text>
          <TouchableOpacity 
            onPress={() => isEditable ? handleSave() : setIsEditable(true)}
            style={styles.editButton}
            disabled={!formData.farmName && !formData.ownerName && !formData.email && !formData.phone}
          >
            <Text style={styles.editButtonText}>
              {isEditable ? 'Save' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Farm Image */}
        <View style={styles.imageContainer}>
          <Image
            source={farmImage}
            style={styles.farmImage}
            resizeMode='cover'
          />
          {isEditable && (
            <TouchableOpacity 
              style={styles.changeImageButton}
              onPress={pickImage}
            >
              <Ionicons name="camera" size={20} color="white" />
              <Text style={styles.changeImageText}>Change Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Farm Information Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Farm Details</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Farm Name</Text>
            <TextInput
              style={getInputStyle('farmName')}
              value={formData.farmName}
              onChangeText={(text) => setFormData({ ...formData, farmName: text })}
              editable={isEditable}
              placeholder="Enter farm name"
              placeholderTextColor="#aaa"
              onFocus={() => setFocusedField('farmName')}
              onBlur={() => setFocusedField(null)}
            />
            {validationErrors.farmName && (
              <Text style={styles.errorText}>{validationErrors.farmName}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Farm Type</Text>
            <TouchableOpacity 
              style={[
                styles.input,
                styles.farmTypeInput,
                focusedField === 'farmType' && styles.inputFocused,
                validationErrors.farmType && styles.inputError
              ]}
              onPress={() => isEditable && (setFocusedField('farmType'), setShowFarmTypeModal(true))}
              disabled={!isEditable}
            >
              <Text style={[styles.inputText, !formData.farmType && { color: '#aaa' }]}>
                {formData.farmType || 'Select farm type'}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={24} color="#888" />
            </TouchableOpacity>
            {validationErrors.farmType && (
              <Text style={styles.errorText}>{validationErrors.farmType}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Street Address</Text>
            <TextInput
              style={getInputStyle('farmAddress')}
              value={formData.farmAddress.street}
              onChangeText={(text) => handleAddressChange('street', text)}
              editable={isEditable}
              placeholder="Enter street address"
              placeholderTextColor="#aaa"
              onFocus={() => setFocusedField('farmAddress')}
              onBlur={() => setFocusedField(null)}
            />
            {validationErrors.farmAddress && (
              <Text style={styles.errorText}>{validationErrors.farmAddress}</Text>
            )}
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Barangay</Text>
              <TextInput
                style={styles.input}
                value={formData.farmAddress.barangay}
                onChangeText={(text) => handleAddressChange('barangay', text)}
                editable={isEditable}
                placeholder="Enter barangay"
                placeholderTextColor="#aaa"
              />
            </View>

            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                value={formData.farmAddress.city}
                onChangeText={(text) => handleAddressChange('city', text)}
                editable={isEditable}
                placeholder="Enter city"
                placeholderTextColor="#aaa"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Province</Text>
              <TextInput
                style={styles.input}
                value={formData.farmAddress.province}
                onChangeText={(text) => handleAddressChange('province', text)}
                editable={isEditable}
                placeholder="Enter province"
                placeholderTextColor="#aaa"
              />
            </View>

            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Region</Text>
              <TextInput
                style={styles.input}
                value={formData.farmAddress.region}
                onChangeText={(text) => handleAddressChange('region', text)}
                editable={isEditable}
                placeholder="Enter region"
                placeholderTextColor="#aaa"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Postal Code</Text>
            <TextInput
              style={styles.input}
              value={formData.farmAddress.postalCode}
              onChangeText={(text) => handleAddressChange('postalCode', text)}
              editable={isEditable}
              placeholder="Enter postal code"
              placeholderTextColor="#aaa"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Farm Size</Text>
              <TextInput
                style={styles.input}
                value={formData.farmSize}
                onChangeText={(text) => setFormData({ ...formData, farmSize: text })}
                editable={isEditable}
                placeholder="e.g. 5 hectares"
                placeholderTextColor="#aaa"
              />
            </View>

            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Years Operating</Text>
              <TextInput
                style={styles.input}
                value={formData.yearsOperating.toString()}
                onChangeText={(text) => {
                  const num = text ? parseInt(text) : 0;
                  setFormData({ ...formData, yearsOperating: isNaN(num) ? 0 : num });
                }}
                editable={isEditable}
                placeholder="e.g. 8"
                placeholderTextColor="#aaa"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Certification</Text>
            <TextInput
              style={styles.input}
              value={formData.certification}
              onChangeText={(text) => setFormData({ ...formData, certification: text })}
              editable={isEditable}
              placeholder="e.g. Organic Certified"
              placeholderTextColor="#aaa"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Farm Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              editable={isEditable}
              placeholder="Tell customers about your farm"
              placeholderTextColor="#aaa"
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        {/* Owner Information Card */}
        <View style={[styles.card, { marginTop: 15 }]}>
          <Text style={styles.cardTitle}>Owner Information</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Owner Name</Text>
            <TextInput
              style={getInputStyle('ownerName')}
              value={formData.ownerName}
              onChangeText={(text) => setFormData({ ...formData, ownerName: text })}
              editable={isEditable}
              placeholder="Enter owner's full name"
              placeholderTextColor="#aaa"
              onFocus={() => setFocusedField('ownerName')}
              onBlur={() => setFocusedField(null)}
            />
            {validationErrors.ownerName && (
              <Text style={styles.errorText}>{validationErrors.ownerName}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={getInputStyle('email')}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              editable={isEditable}
              placeholder="Enter email address"
              placeholderTextColor="#aaa"
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              keyboardType="email-address"
            />
            {validationErrors.email && (
              <Text style={styles.errorText}>{validationErrors.email}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={getInputStyle('phone')}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              editable={isEditable}
              placeholder="Enter phone number"
              placeholderTextColor="#aaa"
              onFocus={() => setFocusedField('phone')}
              onBlur={() => setFocusedField(null)}
              keyboardType="phone-pad"
            />
            {validationErrors.phone && (
              <Text style={styles.errorText}>{validationErrors.phone}</Text>
            )}
        </View>
        </View>
           <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>

        {/* Farm Type Selection Modal */}
        <Modal
          visible={showFarmTypeModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowFarmTypeModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowFarmTypeModal(false)}>
            <View style={styles.modalOverlay} />
          </TouchableWithoutFeedback>
          
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Farm Type</Text>
              
              <FlatList
                data={farmTypeOptions}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => {
                  const IconComponent = item.iconLib;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.farmTypeOption, 
                        formData.farmType === item.value && styles.selectedFarmTypeOption
                      ]}
                      onPress={() => handleFarmTypeSelect(item.value)}
                    >
                      <View style={styles.farmTypeIconContainer}>
                        <IconComponent 
                          name={item.icon} 
                          size={20} 
                          color={item.iconColor}
                        />
                        <Text style={styles.farmTypeOptionText}>{item.value}</Text>
                      </View>
                      {formData.farmType === item.value && (
                        <Ionicons 
                          name="checkmark" 
                          size={20} 
                          color="#4A7C59" 
                          style={styles.farmTypeCheckIcon}
                        />
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
              
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowFarmTypeModal(false)}
              >
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        
        {/* Confirmation Dialog */}
        <Portal>
          <Dialog visible={visibleDialog} onDismiss={hideDialog} style={styles.dialog}>
            <Dialog.Title style={styles.dialogTitle}>{dialogConfig.title}</Dialog.Title>
            <Dialog.Content>
              <Text style={styles.dialogMessage}>{dialogConfig.message}</Text>
            </Dialog.Content>
            <Dialog.Actions style={styles.dialogActions}>
              {dialogConfig.actions.map((action, index) => (
                <PaperButton
                  key={index}
                  onPress={action.onPress}
                  labelStyle={[
                    styles.dialogButtonText, 
                    index === dialogConfig.actions.length - 1 && styles.dialogPrimaryButton
                  ]}
                >
                  {action.text}
                </PaperButton>
              ))}
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </ScrollView>

      {uploading && (
        <View style={styles.uploadOverlay}>
          <View style={styles.uploadContainer}>
            <ActivityIndicator size="large" color="#4A7C59" />
            <Text style={styles.uploadText}>Uploading Image...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    marginBottom: 10,
  },
  backButton: {
    padding: 5,
  },
  screenTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: '#2C3E50',
  },
  editButton: {
    padding: 8,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  editButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#4A7C59',
  },
  imageContainer: {
    height: 200,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#E9ECEF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  farmImage: {
    width: '100%',
    height: '100%',
  },
  changeImageButton: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  changeImageText: {
    color: 'white',
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    marginLeft: 5,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#2C3E50',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  formGroup: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    color: '#5E6D7E',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#2C3E50',
  },
  inputFocused: {
    borderColor: '#4A7C59',
    backgroundColor: 'white',
    shadowColor: '#4A7C59',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    borderColor: '#E74C3C',
  },
  inputText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#2C3E50',
  },
  farmTypeInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    color: '#E74C3C',
    marginTop: 4,
    marginLeft: 4,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: width - 40,
    maxHeight: '80%',
  },
  modalTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#2C3E50',
    marginBottom: 20,
    textAlign: 'center',
  },
  farmTypeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  selectedFarmTypeOption: {
    backgroundColor: '#F8F9FA',
  },
  farmTypeOptionText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: '#2C3E50',
  },
  farmTypeIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  farmTypeCheckIcon: {
    marginRight: 5,
  },
  modalCloseButton: {
    marginTop: 15,
    paddingVertical: 12,
    backgroundColor: '#F1F3F5',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#4A7C59',
  },
  dialog: {
    borderRadius: 12,
    backgroundColor: 'white',
  },
  dialogTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#2C3E50',
  },
  dialogMessage: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#495057',
    lineHeight: 22,
  },
  dialogActions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  dialogButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  dialogPrimaryButton: {
    color: '#4A7C59',
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  uploadText: {
    marginTop: 10,
    fontFamily: 'Poppins-Medium',
    color: '#2C3E50',
  },
    buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  saveButton: {
    backgroundColor: '#4CAF50', // Green color
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default FarmProfileScreen;