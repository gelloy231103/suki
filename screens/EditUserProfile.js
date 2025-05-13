import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
  View, Text, TextInput, Image, TouchableOpacity, 
  ScrollView, StyleSheet, Modal, TouchableWithoutFeedback, 
  FlatList, ActivityIndicator 
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dialog, Portal, Button as PaperButton } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import { format } from 'date-fns';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  writeBatch,
  addDoc
} from 'firebase/firestore';
import { AuthContext } from '../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../config/firebase';

const ProfileScreen = ({ navigation }) => {
  const { userData, saveUserData } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [saving, setSaving] = useState(false); 

  const pickImage = async () => {
  if (!isEditable) return;

  try {
    // Request permission to access the media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    // Launch the image picker
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      await uploadImage(uri);
    }
  } catch (error) {
    console.error('Error picking image:', error);
    showDialog('Error', 'Failed to pick image. Please try again.', [
      { text: 'OK', onPress: hideDialog }
    ]);
  }
};

  const uploadImage = async (uri) => {
    try {
      setLoading(true);
      
      // Convert the image to blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Create a reference to the storage location
      const storageRef = ref(storage, `ProfilePictures/${userData.userId}_profilePic`);
      
      // Upload the image
      await uploadBytes(storageRef, blob);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update the user document in Firestore
      await updateDoc(doc(db, 'users', userData.userId), {
        profilePicUrl: downloadURL
      });
      
      // Update the AuthContext with the new profile picture URL
      saveUserData(
        formData.email || userData.email,
        userData.userId,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          middleName: formData.middleName,
          profilePicUrl: downloadURL // Add this
        }
      );
      
      // Update local state
      setFormData(prev => ({ ...prev, profilePicUrl: downloadURL }));
      setOriginalData(prev => ({ ...prev, profilePicUrl: downloadURL }));
      
      showDialog('Success', 'Profile picture updated successfully!', [
        { text: 'OK', onPress: hideDialog }
      ]);
    } catch (error) {
      console.error('Error uploading image:', error);
      showDialog('Error', 'Failed to upload image. Please try again.', [
        { text: 'OK', onPress: hideDialog }
      ]);
    } finally {
      setLoading(false);
    }
  };

  
  
  // User profile state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    gender: '',
    email: '',
    phone: '',
    password: '',
    birthDate: null
  });
  const [originalData, setOriginalData] = useState({});
  
  // Address state
  const [addresses, setAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [currentAddressId, setCurrentAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState({
    street: '',
    region: 'NCR',
    province: '',
    city: '',
    barangay: '',
    postalCode: '',
    type: 'Home',
    isDefault: false
  });

  // UI state
  const [isEditable, setIsEditable] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [visibleDialog, setVisibleDialog] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({ title: '', message: '', actions: [] });

  

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'Select your birthday';
    try {
      return format(new Date(date), 'MMMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const inputRefs = useRef({});
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  // Gender options with icons
  const genderOptions = [
    { value: 'Male', icon: 'male', iconLib: FontAwesome5, iconColor: '#4285F4' },
    { value: 'Female', icon: 'female', iconLib: FontAwesome5, iconColor: '#EA4335' },
    { value: 'Other', icon: 'gender-male-female', iconLib: MaterialCommunityIcons, iconColor: '#34A853' },
    { value: 'Prefer not to say', icon: 'eye-off', iconLib: Feather, iconColor: '#9E9E9E' }
  ];

  // Fetch additional user data and addresses from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userData?.userId) return;

        const userDoc = await getDoc(doc(db, 'users', userData.userId));
        
        if (userDoc.exists()) {
          const userDataFromFirestore = userDoc.data();
          
          // Initialize form data with values from AuthContext or Firestore
          const updatedFormData = {
            firstName: userData.firstName || userDataFromFirestore.firstName || '',
            lastName: userData.lastName || userDataFromFirestore.lastName || '',
            middleName: userData.middleName || userDataFromFirestore.middleName || '',
            gender: userDataFromFirestore.gender || '',
            email: userData.email || userDataFromFirestore.email || '',
            phone: userDataFromFirestore.phone || '',
            password: '',
            birthDate: userDataFromFirestore.birthDate?.toDate() || null
          };
          
          setFormData(updatedFormData);
          setOriginalData(updatedFormData);

          // ... (keep existing address fetching code)
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
        setLoadingAddresses(false);
      }
    };
    
    fetchData();
  }, [userData]);

  // Validation functions
  const validateName = (name) => /^[A-Za-z\s\-']{2,50}$/.test(name);
  const validateEmail = (email) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
  const validatePassword = (password) => password === '' || /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$/.test(password);
  const validatePhone = (phone) => phone === '' || /^[0-9]{11}$/.test(phone);

  const validateForm = () => {
    const errors = {};
    
    if (!validateName(formData.firstName)) errors.firstName = 'Invalid first name';
    if (!validateName(formData.lastName)) errors.lastName = 'Invalid last name';
    if (formData.middleName && !validateName(formData.middleName)) errors.middleName = 'Invalid middle name';
    if (!validateEmail(formData.email)) errors.email = 'Invalid email address';
    if (!validatePhone(formData.phone)) errors.phone = 'Phone must be 11 digits';
    if (!validatePassword(formData.password)) errors.password = 'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Dialog helpers
  const showDialog = (title, message, actions) => {
    setDialogConfig({ title, message, actions });
    setVisibleDialog(true);
  };

  const hideDialog = () => setVisibleDialog(false);

  // Date handling
  const handleDateSelect = (day) => {
    const newDate = new Date(day.dateString);
    setFormData({...formData, birthDate: newDate});
    setShowDatePicker(false);
  };

  // Gender handling
  const handleGenderSelect = (gender) => {
    setFormData({ ...formData, gender });
    setShowGenderModal(false);
  };

  // Address handling
  const handleAddAddress = () => {
    setIsEditingAddress(false);
    setCurrentAddressId(null);
    setNewAddress({
      street: '',
      region: 'NCR',
      province: '',
      city: '',
      barangay: '',
      postalCode: '',
      type: 'Home',
      isDefault: addresses.length === 0
    });
    setShowAddressModal(true);
  };

  const handleAddressSelect = (address) => {
    setIsEditingAddress(true);
    setCurrentAddressId(address.id);
    setNewAddress({
      street: address.street,
      region: address.region,
      province: address.province || '',
      city: address.city,
      barangay: address.barangay,
      postalCode: address.postalCode,
      type: address.type,
      isDefault: address.isDefault
    });
    setShowAddressModal(true);
  };

  const handleSaveAddress = async () => {
    try {
      const addressData = {
        street: newAddress.street,
        region: newAddress.region,
        province: newAddress.province,
        city: newAddress.city,
        barangay: newAddress.barangay,
        postalCode: newAddress.postalCode,
        type: newAddress.type,
        isDefault: newAddress.isDefault,
        updatedAt: serverTimestamp()
      };

      const userRef = doc(db, 'users', userData.userId);
      
      if (isEditingAddress && currentAddressId) {
        // Update existing address
        await updateDoc(doc(db, 'users', userData.userId, 'addresses', currentAddressId), addressData);
        
        // If this is now the default, update others
        if (newAddress.isDefault) {
          const batch = writeBatch(db);
          const addressesRef = collection(db, 'users', userData.userId, 'addresses');
          const q = query(
            addressesRef, 
            where('isDefault', '==', true),
            where('__name__', '!=', currentAddressId)
          );
          const snapshot = await getDocs(q);
            
          snapshot.forEach(doc => {
            batch.update(doc.ref, { isDefault: false });
          });
          await batch.commit();
        }
      } else {
        // Add new address
        if (newAddress.isDefault) {
          const batch = writeBatch(db);
          const addressesRef = collection(db, 'users', userData.userId, 'addresses');
          const q = query(addressesRef, where('isDefault', '==', true));
            
          const snapshot = await getDocs(q);
          snapshot.forEach(doc => {
            batch.update(doc.ref, { isDefault: false });
          });
          await batch.commit();
        }
        
        await addDoc(collection(db, 'users', userData.userId, 'addresses'), {
          ...addressData,
          createdAt: serverTimestamp()
        });
      }
      
      // Refresh addresses
      const addressesRef = collection(db, 'users', userData.userId, 'addresses');
      const q = query(addressesRef, orderBy('createdAt', 'desc'));
      const updatedAddresses = await getDocs(q);
      
      setAddresses(updatedAddresses.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
      
      setShowAddressModal(false);
    } catch (error) {
      console.error("Error saving address:", error);
      showDialog('Error', 'Failed to save address. Please try again.', [
        { text: 'OK', onPress: hideDialog }
      ]);
    }
  };

  // Save profile changes
  const handleSave = async () => {
    if (!validateForm()) return;
    
    showDialog(
      'Confirm Changes',
      'Are you sure you want to save these changes?',
      [
        { text: 'Cancel', onPress: hideDialog },
        {
          text: 'Yes', 
          onPress: async () => {
            setSaving(true); // Start loading indicator
            try {
              // Prepare updated data including profilePicUrl
              const updatedData = {
                firstName: formData.firstName || "",
                lastName: formData.lastName || "",
                middleName: formData.middleName || "",
                gender: formData.gender || "",
                phone: formData.phone || "",
                birthDate: formData.birthDate ? serverTimestamp(formData.birthDate) : null,
                profilePicUrl: userData.profilePicUrl || null, // Add profilePicUrl to the update
                lastUpdated: serverTimestamp()
              };

              // Update in Firebase
              await updateDoc(doc(db, 'users', userData.userId), updatedData);

              // Also update the AuthContext with the new data including profilePicUrl
              saveUserData(
                formData.email || userData.email,
                userData.userId,
                {
                  firstName: formData.firstName,
                  lastName: formData.lastName,
                  middleName: formData.middleName,
                  profilePicUrl: userData.profilePicUrl // Include profilePicUrl
                }
              );

              // Update email if changed
              if (formData.email !== originalData.email) {
                await auth.currentUser.updateEmail(formData.email);
                await updateDoc(doc(db, 'users', userData.userId), { email: formData.email });
              }

              // Update password if changed
              if (formData.password) {
                await auth.currentUser.updatePassword(formData.password);
              }

              setOriginalData({
                ...formData,
                profilePicUrl: userData.profilePicUrl // Include profilePicUrl in originalData
              });
              setIsEditable(false);
              setValidationErrors({});
              setFocusedField(null);
              
              showDialog('Success', 'Your changes have been saved successfully', [
                { text: 'OK', onPress: hideDialog }
              ]);
            } catch (error) {
              console.error("Error saving changes:", error);
              showDialog('Error', 'Failed to save changes. Please try again.', [
                { text: 'OK', onPress: hideDialog }
              ]);
            } finally {
              setSaving(false); // Stop loading indicator
            }
          }
        },
      ]
    );
  };

  const handleBackPress = () => {
    if (hasChanges) {
      showDialog(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Cancel', onPress: hideDialog },
          {
            text: 'Yes', 
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

  const getAddressDisplay = (address) => {
    const parts = [
      address.street,
      address.barangay,
      address.city,
      address.province,
      address.region,
      address.postalCode
    ].filter(part => part && part.trim() !== '');
    
    return parts.join(', ');
  };

  const getInputStyle = (fieldName) => [
    styles.inputBox,
    focusedField === fieldName && { borderColor: '#9DCD5A', borderWidth: 1 },
    validationErrors[fieldName] && { borderColor: 'red', borderWidth: 1 }
  ];

  const getInfoInputStyle = (fieldName) => [
    styles.infoInput,
    focusedField === fieldName && { borderBottomColor: '#9DCD5A', borderBottomWidth: 1 },
    validationErrors[fieldName] && { borderBottomColor: 'red', borderBottomWidth: 1 }
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9DCD5A" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </SafeAreaView>
    );
  }
  

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setIsEditable(!isEditable)}
            disabled={saving} // Disable edit button while saving
          >
            {saving ? (
              <ActivityIndicator size="small" color="#9DCD5A" />
            ) : (
              <Ionicons name={isEditable ? "checkmark" : "create"} size={24} color="#9DCD5A" />
            )}
          </TouchableOpacity>
        </View>

        <Text style={[styles.otherInfoText, { marginTop: 20, fontSize: 18 }]}>
          Edit Profile
        </Text>

        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.imageContainer}
            onPress={pickImage}
            disabled={!isEditable || loading}
          >
            {userData.profilePicUrl ? (
              <Image
                source={{ uri: userData.profilePicUrl }}
                style={styles.profileImage}
                resizeMode='cover'
              />
            ) : (
              <Image
                source={require('../assets/images/sampleUser.png')}
                style={styles.profileImage}
                resizeMode='contain'
              />
            )}
            {isEditable && (
              <Text style={styles.addProfileText}>
                {userData.profilePicUrl ? 'Change Profile' : 'Add Profile Picture'}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.infoSection}>
            {['firstName', 'lastName', 'middleName'].map((key, idx) => (
              <View key={idx}>
                <Text style={styles.infoLabel}>
                  {key === 'firstName' ? 'First Name' : key === 'lastName' ? 'Last Name' : 'Middle Name'}
                </Text>
                <View style={styles.infoRow}>
                  <TextInput
                    style={getInfoInputStyle(key)}
                    value={formData[key]}
                    onChangeText={(text) => setFormData({ ...formData, [key]: text })}
                    editable={isEditable}
                    placeholder={`Enter ${key === 'middleName' ? 'middle name (optional)' : key.replace('Name', ' name')}`}
                    placeholderTextColor="#aaa"
                    onFocus={() => setFocusedField(key)}
                    onBlur={() => setFocusedField(null)}
                    ref={ref => inputRefs.current[key] = ref}
                  />
                  <MaterialIcons name="edit" size={16} color="#BDBDBD" />
                </View>
                {validationErrors[key] && (
                  <Text style={styles.errorText}>{validationErrors[key]}</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.otherInfoText}>Other Information</Text>

        <View style={{ marginHorizontal: 10 }}>
          <Text style={styles.label}>Gender</Text>
          <TouchableOpacity 
            style={[styles.inputBox, 
              focusedField === 'gender' && { borderColor: '#9DCD5A', borderWidth: 1 },
              validationErrors.gender && { borderColor: 'red', borderWidth: 1 }]}
            onPress={() => {
              if (isEditable) {
                setFocusedField('gender');
                setShowGenderModal(true);
              }
            }}
          >
            <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 12 }}>
              {formData.gender || 'Select gender'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Birthday</Text>
          <TouchableOpacity 
            style={styles.inputBox}
            onPress={() => {
              if (isEditable) {
                setFocusedField('birthday');
                setShowDatePicker(true);
              }
            }}
          >
            <Text style={styles.inputText}>{formatDate(formData.birthDate)}</Text>
            <Ionicons name="calendar" size={20} color="green" />
          </TouchableOpacity>

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={getInputStyle('phone')}
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            editable={isEditable}
            placeholder="Enter phone number"
            placeholderTextColor="#aaa"
            keyboardType="phone-pad"
            onFocus={() => setFocusedField('phone')}
            onBlur={() => setFocusedField(null)}
          />
          {validationErrors.phone && (
            <Text style={styles.errorText}>{validationErrors.phone}</Text>
          )}
        </View>

        <Text style={styles.otherInfoText}>Account Information</Text>

        <View style={{ marginHorizontal: 10 }}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={getInputStyle('email')}
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            editable={isEditable}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            keyboardType="email-address"
          />
          {validationErrors.email && (
            <Text style={styles.errorText}>{validationErrors.email}</Text>
          )}

          <Text style={styles.label}>Password</Text>
          <View style={[styles.inputRow, validationErrors.password && { borderColor: 'red', borderWidth: 1 }]}>
            <TextInput
              style={styles.inputText}
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry={!passwordVisible}
              editable={isEditable}
              placeholder="Leave empty to keep current"
              placeholderTextColor="#aaa"
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
            />
            <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
              <Ionicons name={passwordVisible ? 'eye-off' : 'eye'} size={20} color="green" />
            </TouchableOpacity>
          </View>
          {validationErrors.password && (
            <Text style={styles.errorText}>{validationErrors.password}</Text>
          )}
        </View>

        <Text style={styles.otherInfoText}>Billing Addresses</Text>

        <View style={{ marginHorizontal: 10 }}>
          {loadingAddresses ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#9DCD5A" />
            </View>
          ) : addresses.length === 0 ? (
            <View style={styles.noAddressContainer}>
              <Text style={styles.noAddressText}>No billing addresses saved</Text>
              <TouchableOpacity 
                style={styles.addAddressButton}
                onPress={handleAddAddress}
              >
                <Text style={styles.addAddressButtonText}>Add New Billing Address</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <ScrollView showsVerticalScrollIndicator={false}>
                {addresses.map((item, index) => (
                  <View key={item.id}>
                    <TouchableOpacity 
                      style={styles.addressContainer}
                      onPress={() => handleAddressSelect(item)}
                    >
                      <View style={styles.addressHeader}>
                        <Text style={styles.addressType}>{item.type}</Text>
                        {item.isDefault && (
                          <View style={styles.defaultBadge}>
                            <Text style={styles.defaultBadgeText}>Default</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.addressText}>{getAddressDisplay(item)}</Text>
                    </TouchableOpacity>
                    
                    {index < addresses.length - 1 && (
                      <View style={styles.addressSeparator} />
                    )}
                  </View>
                ))}
              </ScrollView>
              
              <TouchableOpacity 
                style={styles.addAddressTextContainer}
                onPress={handleAddAddress}
              >
                <Text style={styles.addAddressText}>
                  Add New Billing Address +
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, {marginBottom: 15}, { opacity: hasChanges ? 1 : 0.5 }]}
          disabled={!hasChanges || saving} // Disable while saving
          onPress={handleSave}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>

        {/* Gender Selection Modal */}
        <Modal
          visible={showGenderModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowGenderModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowGenderModal(false)}>
            <View style={styles.modalOverlay} />
          </TouchableWithoutFeedback>
          
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Gender</Text>
              
              {genderOptions.map((option, index) => {
                const IconComponent = option.iconLib;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.genderOption, formData.gender === option.value && styles.selectedGenderOption]}
                    onPress={() => handleGenderSelect(option.value)}
                  >
                    <View style={styles.genderIconContainer}>
                      <IconComponent 
                        name={option.icon} 
                        size={20} 
                        color={option.iconColor}
                      />
                      <Text style={styles.genderOptionText}>{option.value}</Text>
                    </View>
                    {formData.gender === option.value && (
                      <Ionicons 
                        name="checkmark" 
                        size={20} 
                        color="#9DCD5A" 
                        style={styles.genderCheckIcon}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
              
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowGenderModal(false)}
              >
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Date Picker Modal */}
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowDatePicker(false)}>
            <View style={styles.modalOverlay} />
          </TouchableWithoutFeedback>
          
          <View style={styles.modalContainer}>
            <View style={styles.datePickerContent}>
              <Text style={styles.modalTitle}>Select Birthday</Text>
              
              <Calendar
                current={formData.birthDate ? format(formData.birthDate, 'yyyy-MM-dd') : ''}
                onDayPress={handleDateSelect}
                markedDates={{
                  [formData.birthDate ? format(formData.birthDate, 'yyyy-MM-dd') : '']: {selected: true}
                }}
                theme={{
                  backgroundColor: '#ffffff',
                  calendarBackground: '#ffffff',
                  textSectionTitleColor: '#9DCD5A',
                  selectedDayBackgroundColor: '#9DCD5A',
                  selectedDayTextColor: '#ffffff',
                  todayTextColor: '#9DCD5A',
                  dayTextColor: '#2d4150',
                  textDisabledColor: '#d9e1e8',
                  dotColor: '#9DCD5A',
                  selectedDotColor: '#ffffff',
                  arrowColor: '#9DCD5A',
                  monthTextColor: '#9DCD5A',
                  indicatorColor: '#9DCD5A',
                  textDayFontFamily: 'Poppins-Regular',
                  textMonthFontFamily: 'Poppins-SemiBold',
                  textDayHeaderFontFamily: 'Poppins-Medium',
                  textDayFontSize: 14,
                  textMonthFontSize: 16,
                  textDayHeaderFontSize: 12
                }}
                style={styles.calendar}
              />
              
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Address Modal */}
        <Modal
          visible={showAddressModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowAddressModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowAddressModal(false)}>
            <View style={styles.modalOverlay} />
          </TouchableWithoutFeedback>
          
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {isEditingAddress ? 'Edit Address' : 'Add New Address'}
              </Text>
              <ScrollView 
                style={styles.addressForm}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.label}>Street Address</Text>
                <TextInput
                  style={styles.inputBox}
                  value={newAddress.street}
                  onChangeText={(text) => setNewAddress({...newAddress, street: text})}
                  placeholder="Enter street address"
                />

                <Text style={styles.label}>Region</Text>
                <TextInput
                  style={styles.inputBox}
                  value={newAddress.region}
                  onChangeText={(text) => setNewAddress({...newAddress, region: text})}
                  placeholder="Enter Region"
                />
                
                <Text style={styles.label}>Province</Text>
                <TextInput
                  style={styles.inputBox}
                  value={newAddress.province}
                  onChangeText={(text) => setNewAddress({...newAddress, province: text})}
                  placeholder="Enter Province"
                />

                <Text style={styles.label}>City/Municipality</Text>
                <TextInput
                  style={styles.inputBox}
                  value={newAddress.city}
                  onChangeText={(text) => setNewAddress({...newAddress, city: text})}
                  placeholder="Enter City"
                />

                <Text style={styles.label}>Barangay</Text>
                <TextInput
                  style={styles.inputBox}
                  value={newAddress.barangay}
                  onChangeText={(text) => setNewAddress({...newAddress, barangay: text})}
                  placeholder="Enter Baranggay"
                />

                <Text style={styles.label}>Postal Code</Text>
                <TextInput
                  style={styles.inputBox}
                  value={newAddress.postalCode}
                  onChangeText={(text) => setNewAddress({...newAddress, postalCode: text})}
                  placeholder="Enter postal code"
                  keyboardType="numeric"
                />

                <Text style={styles.label}>Address Type</Text>
                <View style={styles.typeContainer}>
                  {['Home', 'Work', 'Other'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        newAddress.type === type && styles.selectedTypeButton
                      ]}
                      onPress={() => setNewAddress({...newAddress, type})}
                    >
                      <Text style={[
                        styles.typeButtonText,
                        newAddress.type === type && styles.selectedTypeButtonText
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.defaultContainer}>
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => setNewAddress({...newAddress, isDefault: !newAddress.isDefault})}
                  >
                    {newAddress.isDefault && (
                      <Ionicons name="checkmark" size={16} color="#9DCD5A" />
                    )}
                  </TouchableOpacity>
                  <Text style={styles.defaultText}>Set as default address</Text>
                </View>
              </ScrollView>

              <View style={styles.addressModalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSaveAddress}
                  disabled={!newAddress.street || !newAddress.region || !newAddress.city || !newAddress.barangay}
                >
                  <Text style={styles.modalButtonText}>
                    {isEditingAddress ? 'Update Address' : 'Save Address'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowAddressModal(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
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
                  labelStyle={[styles.dialogButtonText, index === dialogConfig.actions.length - 1 && styles.dialogPrimaryButton]}
                >
                  {action.text}
                </PaperButton>
              ))}
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </ScrollView>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
    padding: 10,
    flexDirection: 'row',
  },
  imageContainer: {
    flex: 0.9,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: '100%',
    height: 150,
    borderRadius: 20,
  },
  addProfileText: {
    position: 'absolute',
    bottom: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    fontFamily: 'Poppins-Bold',
    fontSize: 8,
    color: '#009216',
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  infoSection: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    flex: 1,
    justifyContent: 'center',
    gap: 10,
  },
  infoLabel: {
    fontSize: 11.5,
    color: '#ACD671',
    marginBottom: -8,
    marginLeft: 2,
    fontFamily: 'Poppins-Regular',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0.6,
    borderBottomColor: '#888',
  },
  infoInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 6,
    paddingRight: 10,
    fontFamily: 'Poppins-Medium',
    paddingBottom: 0,
    borderBottomWidth: 0.6,
    borderBottomColor: '#888',
  },
  label: {
    fontSize: 11.5,
    color: '#9DCD5A',
    fontFamily: 'Poppins-Medium',
    marginBottom: 4,
  },
  otherInfoText: {
    fontFamily: 'Poppins-Bold',
    marginTop: 15,
    marginBottom: 5,
    fontSize: 17,
  },
  inputBox: {
    borderWidth: 0.5,
    backgroundColor: '#FAFAFA',
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  inputRow: {
    borderWidth: 0.5,
    backgroundColor: '#FAFAFA',
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  inputText: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
  saveButton: {
    backgroundColor: '#8BC34A',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 10,
    borderRadius: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
    marginLeft: 2,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#9DCD5A',
    opacity: 0.3,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  datePickerContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  calendar: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  genderOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedGenderOption: {
    backgroundColor: '#f9f9f9',
  },
  genderOptionText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#333',
  },
  genderIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  genderCheckIcon: {
    marginRight: 8,
  },
  modalCloseButton: {
    marginTop: 20,
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#555',
  },
  dialog: {
    borderRadius: 16,
    backgroundColor: 'white',
  },
  dialogTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#333',
  },
  dialogMessage: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666',
  },
  dialogActions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  dialogButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#666',
  },
  dialogPrimaryButton: {
    color: '#9DCD5A',
  },
  
  addressContainer: {
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  addressType: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    color: '#333',
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  defaultBadgeText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    color: '#009216',
  },
  addressText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#555',
  },
  addressSeparator: {
    height: 10,
  },
  addAddressText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    color: '#009216',
    textAlign: 'right',
    marginTop: 10,
  },
  addressForm: {
    maxHeight: 400,
    marginBottom: 10,
  },
  dropdownContainer: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  dropdownItem: {
    padding: 12,
  },
  dropdownItemText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
  dropdownSeparator: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  selectedTypeButton: {
    borderColor: '#9DCD5A',
    backgroundColor: '#F1F8E9',
  },
  typeButtonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#555',
  },
  selectedTypeButtonText: {
    color: '#9DCD5A',
  },
  defaultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#9DCD5A',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  defaultText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#555',
  },
  addressModalButtons: {
    height: 100,
    marginTop: 10,
    gap: 10,
    marginBottom: 13,
  },
  modalButton: {
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  modalButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    color: 'white',
  },
});

export default ProfileScreen;
