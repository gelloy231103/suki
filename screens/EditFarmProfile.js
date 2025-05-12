import React, { useState, useEffect, useRef } from 'react';
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
  FlatList 
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dialog, Portal, Button as PaperButton } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import { format } from 'date-fns';

const ProfileScreen = ({ navigation }) => {
  // Initial state
  const initialState = {
    name: 'Aron Jeric Cao',
    lName: 'Cao',
    mName: '-',
    gender: 'Crop Farm',
    email: 'aronjericandrade@gmail.com',
    password: '',
    billing1: '4 E Jacinto St., Sta. Elena, Marikina City, NCR',
  };

  // State management
  const [formData, setFormData] = useState(initialState);
  const [originalData, setOriginalData] = useState(initialState);
  const [isEditable, setIsEditable] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date(2003, 8, 16));
  const [focusedField, setFocusedField] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [visibleDialog, setVisibleDialog] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({ title: '', message: '', actions: [] });

  // Address management
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [currentAddressId, setCurrentAddressId] = useState(null);
  const [addresses, setAddresses] = useState([{
    id: '1',
    street: '432 E Jochito St.',
    region: 'NCR',
    city: 'Marikina City',
    barangay: 'Sta. Elena',
    postalCode: '1800',
    type: 'Billing Home Address 1',
  }]);

  const [newAddress, setNewAddress] = useState({
    street: '',
    region: '',
    province: '',
    city: '',
    barangay: '',
    postalCode: '',
    type: 'Home',
    isDefault: false
  });

  const inputRefs = useRef({});
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  // Gender options
  const genderOptions = [
    { value: 'Crop Farm', icon: 'male', iconLib: FontAwesome5, iconColor: '#4285F4' },
    { value: 'Female', icon: 'female', iconLib: FontAwesome5, iconColor: '#EA4335' },
    { value: 'Other', icon: 'gender-male-female', iconLib: MaterialCommunityIcons, iconColor: '#34A853' },
    { value: 'Prefer not to say', icon: 'eye-off', iconLib: Feather, iconColor: '#9E9E9E' }
  ];

  // Validation functions
  const validateName = (name) => /^[A-Za-z\s\-']{2,50}$/.test(name);
  const validateEmail = (email) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
  const validatePassword = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$/.test(password);

  // Helper functions
  const showDialog = (title, message, actions) => {
    setDialogConfig({ title, message, actions });
    setVisibleDialog(true);
  };

  const hideDialog = () => setVisibleDialog(false);

  const formatDate = (date) => format(date, 'MMMM d, yyyy');

  const getAddressDisplay = (address) => {
    return `${address.street}, ${address.barangay}, ${address.city}, ${address.region}, ${address.postalCode}`;
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
            text: 'Yes', 
            onPress: () => {
              hideDialog();
              setFormData(originalData);
              setIsEditable(false);
              navigation.navigate('ProfileDashboard');
            }
          },
        ]
      );
    } else {
      navigation.navigate('ProfileDashboard');
    }
  };

  const handleSave = () => {
    if (!validateForm()) return;
    
    showDialog(
      'Confirm Changes',
      'Are you sure you want to save these changes?',
      [
        { text: 'Cancel', onPress: hideDialog },
        {
          text: 'Yes', 
          onPress: () => {
            hideDialog();
            setOriginalData(formData);
            setIsEditable(false);
            setValidationErrors({});
            setFocusedField(null);
            showDialog('Success', 'Your changes have been saved successfully', [
              { text: 'OK', onPress: hideDialog }
            ]);
          }
        },
      ]
    );
  };

  const validateForm = () => {
    const errors = {};
    
    if (!validateName(formData.name)) errors.name = 'Invalid first name';
    if (!validateName(formData.lName)) errors.lName = 'Invalid last name';
    if (formData.mName !== '-' && !validateName(formData.mName)) errors.mName = 'Invalid middle name';
    if (!validateEmail(formData.email)) errors.email = 'Invalid email address';
    if (formData.password && !validatePassword(formData.password)) {
      errors.password = 'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDateSelect = (day) => {
    const newDate = new Date(day.dateString);
    setSelectedDate(newDate);
    setShowDatePicker(false);
  };

  const handleGenderSelect = (gender) => {
    setFormData({ ...formData, gender });
    setShowGenderModal(false);
  };

  const handleAddAddress = () => {
    setIsEditingAddress(false);
    setCurrentAddressId(null);
    setNewAddress({
      street: '',
      region: '',
      province: '',
      city: '',
      barangay: '',
      postalCode: '',
      type: 'Home',
    });
    setShowAddressModal(true);
  };

  const handleSaveAddress = () => {
    if (isEditingAddress && currentAddressId) {
      setAddresses(prevAddresses => 
        prevAddresses.map(addr => 
          addr.id === currentAddressId 
            ? { ...newAddress, id: currentAddressId }
            : newAddress.isDefault ? { ...addr, isDefault: false } : addr
        )
      );
    } else {
      const formattedAddress = {
        id: Date.now().toString(),
        ...newAddress
      };

      if (newAddress.isDefault) {
        setAddresses(prev => 
          prev.map(addr => ({ ...addr, isDefault: false }))
          .concat(formattedAddress)
        );
      } else {
        setAddresses(prev => [...prev, formattedAddress]);
      }
    }

    setShowAddressModal(false);
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

  // Style getters
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsEditable(!isEditable)}>
            <Ionicons name={isEditable ? "checkmark" : "create"} size={24} color="#9DCD5A" />
          </TouchableOpacity>
        </View>

        <Text style={styles.screenTitle}>Edit Profile</Text>

        {/* Profile Card */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.imageContainer}>
            <Image
              source={require('../assets/images/sampleUser.png')}
              style={styles.profileImage}
              resizeMode='contain'
            />
            <Text style={styles.addProfileText}>Add New Profile +</Text>
          </TouchableOpacity>

          <View style={styles.infoSection}>
            {['name', 'lName', 'mName'].map((key, idx) => (
              <View key={idx}>
                <Text style={styles.infoLabel}>
                  {key === 'name' ? 'First Name' : key === 'lName' ? 'Last Name' : 'Middle Name'}
                </Text>
                <View style={styles.infoRow}>
                  <TextInput
                    style={getInfoInputStyle(key)}
                    value={formData[key]}
                    onChangeText={(text) => setFormData({ ...formData, [key]: text })}
                    editable={isEditable}
                    placeholder="Enter name"
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

        {/* Farm Information */}
        <Text style={styles.sectionTitle}>Other Farm Information</Text>
        <View style={styles.sectionContainer}>
          <Text style={styles.label}>Farm Type</Text>
          <TouchableOpacity 
            style={[
              styles.inputBox, 
              focusedField === 'gender' && { borderColor: '#9DCD5A', borderWidth: 1 },
              validationErrors.gender && { borderColor: 'red', borderWidth: 1 }
            ]}
            onPress={() => isEditable && (setFocusedField('gender'), setShowGenderModal(true))}
          >
            <Text style={styles.inputText}>{formData.gender}</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Birthday</Text>
          <TouchableOpacity 
            style={styles.inputBox}
            onPress={() => isEditable && (setFocusedField('birthday'), setShowDatePicker(true))}
          >
            <Text style={styles.inputText}>{formatDate(selectedDate)}</Text>
            <Ionicons name="calendar" size={20} color="green" />
          </TouchableOpacity>
        </View>

        {/* Account Information */}
        <Text style={styles.sectionTitle}>Account Information</Text>
        <View style={styles.sectionContainer}>
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
          <View style={[
            styles.inputRow, 
            validationErrors.password && { borderColor: 'red', borderWidth: 1 }
          ]}>
            <TextInput
              style={styles.inputText}
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry={!passwordVisible}
              editable={isEditable}
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

        {/* Billing Addresses */}
        <Text style={styles.sectionTitle}>Billing Addresses</Text>
        <View style={styles.sectionContainer}>
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
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, { opacity: hasChanges ? 1 : 0.5 }]}
          disabled={!hasChanges}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>

        {/* Gender Selection Modal */}
        <Modal
          visible={showGenderModal}
          transparent
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
                    style={[
                      styles.genderOption, 
                      formData.gender === option.value && styles.selectedGenderOption
                    ]}
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
          transparent
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
                current={format(selectedDate, 'yyyy-MM-dd')}
                onDayPress={handleDateSelect}
                markedDates={{
                  [format(selectedDate, 'yyyy-MM-dd')]: {selected: true}
                }}
                theme={calendarTheme}
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
          transparent
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
              </ScrollView>
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
    </SafeAreaView>
  );
};

// Calendar theme
const calendarTheme = {
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
};

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  screenTitle: {
    fontFamily: 'Poppins-Bold',
    marginTop: 20,
    marginBottom: 5,
    fontSize: 18,
  },
  sectionTitle: {
    fontFamily: 'Poppins-Bold',
    marginTop: 15,
    marginBottom: 5,
    fontSize: 17,
  },
  sectionContainer: {
    marginHorizontal: 10,
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
  inputText: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
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
  saveButton: {
    backgroundColor: '#8BC34A',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 10,
    marginBottom: 15,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  errorText: {
    color: 'red',
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
    marginLeft: 2,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
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
  addressForm: {
    maxHeight: 400,
    marginBottom: 10,
  },
});

export default ProfileScreen;