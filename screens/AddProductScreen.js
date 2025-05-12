import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const AddProductScreen = () => {
  const [selectedCropType, setSelectedCropType] = React.useState('Fruits');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.mainImage}>
        <Text style={styles.addImageText}>+{"\n"}Add Image</Text>
      </TouchableOpacity>

      <View style={styles.imageRow}>
        {[...Array(5)].map((_, index) => (
          <TouchableOpacity key={index} style={styles.smallImageBox}>
            <Text style={styles.smallImageText}>+{"\n"}Add Image</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Product Name</Text>
        <TextInput style={styles.input} />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, { height: 100 }]} multiline />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Stocks</Text>
        <View style={styles.inlineRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginRight: 8 }]}
            keyboardType="numeric"
          />
          <View style={styles.unitBox}>
            <Text style={styles.unitText}>KG</Text>
          </View>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Price per Stock</Text>
        <TextInput style={styles.input} keyboardType="numeric" />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Crop Type</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedCropType}
            onValueChange={(itemValue) => setSelectedCropType(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Fruits" value="Fruits" />
            <Picker.Item label="Vegetables" value="Vegetables" />
            <Picker.Item label="Grains" value="Grains" />
          </Picker>
        </View>
      </View>

      <View style={styles.inlineRow}>
        <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Discount</Text>
          <TextInput style={styles.input} />
        </View>
        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.label}>Period</Text>
          <TextInput style={styles.input} />
        </View>
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Add Product</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  mainImage: {
    width: 346,
    height: 346,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F3F3F3',
  },
  addImageText: {
    textAlign: 'center',
    color: 'green',
    fontSize: 16,
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  smallImageBox: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  smallImageText: {
    fontSize: 10,
    textAlign: 'center',
    color: 'green',
  },
  formGroup: {
    width: '100%',
    marginBottom: 12,
  },
  label: {
    marginBottom: 4,
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#000000',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  unitBox: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  unitText: {
    fontSize: 14,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: 50,
  },
  button: {
    backgroundColor: '#9DCD5A',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Medium',
  },
});

export default AddProductScreen;
