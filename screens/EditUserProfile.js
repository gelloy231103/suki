import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, ScrollView, StyleSheet, Modal, TouchableWithoutFeedback } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dialog, Portal, Button as PaperButton } from 'react-native-paper';

const ProfileScreen = ({ navigation }) => {
  const initialState = {
    name: 'Aron Jeric Cao',
    lName: 'Cao',
    mName: '-',
    gender: 'Male',
    email: 'aronjericandrade@gmail.com',
    password: '',
    billing1: '4 E Jacinto St., Sta. Elena, Marikina City, NCR',
    billing2: '4 E Jacinto St., Sta. Elena, Marikina City, NCR',
  };

  const [formData, setFormData] = useState(initialState);
  const [originalData, setOriginalData] = useState(initialState);
  const [isEditable, setIsEditable] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [date] = useState(new Date(2003, 8, 16));
  const [focusedField, setFocusedField] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [visibleDialog, setVisibleDialog] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({ title: '', message: '', actions: [] });

  const inputRefs = useRef({});
  
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  // Gender options with icons
  const genderOptions = [
    { 
      value: 'Male', 
      icon: 'male', 
      iconLib: FontAwesome5,
      iconColor: '#4285F4' // Blue
    },
    { 
      value: 'Female', 
      icon: 'female', 
      iconLib: FontAwesome5,
      iconColor: '#EA4335' // Red
    },
    { 
      value: 'Other', 
      icon: 'gender-male-female', 
      iconLib: MaterialCommunityIcons,
      iconColor: '#34A853' // Green
    },
    { 
      value: 'Prefer not to say', 
      icon: 'eye-off', 
      iconLib: Feather,
      iconColor: '#9E9E9E' // Gray
    }
  ];

  // Validation functions
  const validateName = (name) => /^[A-Za-z\s\-']{2,50}$/.test(name);
  const validateEmail = (email) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
  const validatePassword = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$/.test(password);

  const showDialog = (title, message, actions) => {
    setDialogConfig({ title, message, actions });
    setVisibleDialog(true);
  };

  const hideDialog = () => setVisibleDialog(false);

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

  const validateForm = () => {
    const errors = {};
    
    if (!validateName(formData.name)) {
      errors.name = 'Invalid first name';
    }
    
    if (!validateName(formData.lName)) {
      errors.lName = 'Invalid last name';
    }
    
    if (formData.mName !== '-' && !validateName(formData.mName)) {
      errors.mName = 'Invalid middle name';
    }
    
    if (!validateEmail(formData.email)) {
      errors.email = 'Invalid email address';
    }
    
    if (formData.password && !validatePassword(formData.password)) {
      errors.password = 'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }
    
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
            setFocusedField(null); // Reset border colors
            showDialog('Success', 'Your changes have been saved successfully', [
              { text: 'OK', onPress: hideDialog }
            ]);
          }
        },
      ]
    );
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getInputStyle = (fieldName) => {
    return [
      styles.inputBox,
      focusedField === fieldName && { borderColor: '#9DCD5A', borderWidth: 1 },
      validationErrors[fieldName] && { borderColor: 'red', borderWidth: 1 }
    ];
  };

  const getInfoInputStyle = (fieldName) => {
    return [
      styles.infoInput,
      focusedField === fieldName && { borderBottomColor: '#9DCD5A', borderBottomWidth: 1 },
      validationErrors[fieldName] && { borderBottomColor: 'red', borderBottomWidth: 1 }
    ];
  };

  const handleGenderSelect = (gender) => {
    setFormData({ ...formData, gender });
    setShowGenderModal(false);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsEditable(!isEditable)}>
            <Ionicons name={isEditable ? "checkmark" : "create"} size={24} color="#9DCD5A" />
          </TouchableOpacity>
        </View>

        <Text style={[styles.otherInfoText, { marginTop: 20, fontSize: 18 }]}>
          Edit Profile
        </Text>

        <View style={styles.card}>
          <TouchableOpacity style={styles.imageContainer}>
            <Image
              source={require('../assets/images/sampleUser.png')}
              style={styles.profileImage}
              resizeMode='contain'
            />
            <Text style={styles.addProfileText}>
              Add New Profile +
            </Text>
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

        <Text style={styles.otherInfoText}>Other Information</Text>

        <View style={{ marginHorizontal: 10 }}>
          <Text style={styles.label}>Gender</Text>
          <TouchableOpacity 
            style={[
              styles.inputBox, 
              focusedField === 'gender' && { borderColor: '#9DCD5A', borderWidth: 1 },
              validationErrors.gender && { borderColor: 'red', borderWidth: 1 }
            ]}
            onPress={() => {
              if (isEditable) {
                setFocusedField('gender');
                setShowGenderModal(true);
              }
            }}
          >
            <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 12 }}>
              {formData.gender}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Birthday</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputText}>{formatDate(date)}</Text>
            <Ionicons name="calendar" size={20} color="green" />
          </View>
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
          <Text style={styles.label}>Billing Address 1</Text>
          <TextInput
            style={getInputStyle('billing1')}
            value={formData.billing1}
            onChangeText={(text) => setFormData({ ...formData, billing1: text })}
            editable={isEditable}
            onFocus={() => setFocusedField('billing1')}
            onBlur={() => setFocusedField(null)}
          />

          <Text style={styles.label}>Billing Address 2</Text>
          <TextInput
            style={getInputStyle('billing2')}
            value={formData.billing2}
            onChangeText={(text) => setFormData({ ...formData, billing2: text })}
            editable={isEditable}
            onFocus={() => setFocusedField('billing2')}
            onBlur={() => setFocusedField(null)}
          />

          <TouchableOpacity>
            <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 10, color: '#009216', textAlign: 'right' }}>
              Add New Billing Address +
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { opacity: hasChanges ? 1 : 0.5 }]}
          disabled={!hasChanges}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>

        {/* Enhanced Gender Selection Modal with Icons */}
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

        {/* Modern Dialog */}
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
  },
  inputRow: {
    borderWidth: 0.5,
    backgroundColor: '#FAFAFA',
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
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
    marginBottom: 40,
    marginTop: 20,
    marginHorizontal: 10,
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
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
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
});

export default ProfileScreen;