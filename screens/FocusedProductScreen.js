// import React, { useState } from 'react';
// import MapView, { Marker } from 'react-native-maps';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Image,
//   TextInput,
//   Dimensions,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import Icon from 'react-native-vector-icons/MaterialIcons';

// const FocusedProduct = () => {
//   const navigation = useNavigation();
//   const [quantity, setQuantity] = useState(2);
//   const [voucher, setVoucher] = useState('');

//   const handleDecrease = () => {
//     if (quantity > 1) setQuantity(quantity - 1);
//   };

//   const handleIncrease = () => {
//     setQuantity(quantity + 1);
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <View style={styles.header}>
//         <Image
//           source={require('../assets/suki-no-text-logo.png')}
//           style={styles.logo}
//         />
//         <TextInput style={styles.search} placeholder="Search" />
//       </View>

//       <View style={styles.imageContainer}>
//         <Image
//           source={require('../assets/tomatoes.png')}
//           style={styles.productImage}
//         />
//         <TouchableOpacity style={styles.heartIcon}>
//           <Icon name="favorite" size={24} color="red" />
//         </TouchableOpacity>
//       </View>

//       <View style={styles.dots}>
//         <View style={styles.dotActive} />
//         <View style={styles.dot} />
//         <View style={styles.dot} />
//       </View>

//       <View style={styles.details}>
//         <View style={styles.row}>
//           <Text style={styles.title}>Sweet Tomatoes</Text>
//           <Text style={styles.price}>₱80/kg</Text>
//         </View>

//         <View style={styles.rating}>
//           {Array.from({ length: 4 }).map((_, i) => (
//             <Icon key={i} name="star" size={20} color="#4CAF50" />
//           ))}
//           <Icon name="star-border" size={20} color="#4CAF50" />
//           <Text style={styles.reviewText}>354 reviews</Text>
//         </View>

//         <Text style={styles.description}>
//           Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
//           been the industry's standard dummy text ever since the 1500s...
//         </Text>

//         <View style={styles.quantitySection}>
//           <Text style={styles.quantityLabel}>Quantity</Text>
//           <View style={styles.quantityControls}>
//             <TouchableOpacity onPress={handleDecrease} style={styles.qtyButton}>
//               <Text style={styles.qtyButtonText}>-</Text>
//             </TouchableOpacity>
//             <Text style={styles.quantityValue}>{quantity}</Text>
//             <TouchableOpacity onPress={handleIncrease} style={styles.qtyButton}>
//               <Text style={styles.qtyButtonText}>+</Text>
//             </TouchableOpacity>
//             <Text style={styles.kgText}>kg</Text>
//           </View>
//         </View>

//         <View style={styles.voucherSection}>
//           <TextInput
//             style={styles.voucherInput}
//             placeholder="Voucher Code"
//             value={voucher}
//             onChangeText={setVoucher}
//           />
//           <TouchableOpacity style={styles.applyButton}>
//             <Text style={styles.applyButtonText}>APPLY</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//       <View style={styles.farmLocationSection}>
//     <View style={styles.farmHeader}>
//       <Text style={styles.farmTitle}>Farm Location</Text>
//       <View style={styles.farmNameContainer}>
//         <Icon name="home" size={18} color="#A5D86E" />
//         <Text style={styles.farmName}> Tadhana Farm Ville</Text>
//       </View>
//     </View>

//     <MapView
//       style={styles.mapView}
//       initialRegion={{
//         latitude: 37.78825,
//         longitude: -122.4324,
//         latitudeDelta: 0.01,
//         longitudeDelta: 0.01,
//       }}
//     >
//       <Marker
//         coordinate={{ latitude: 37.78825, longitude: -122.4324 }}
//         title="Tadhana Farm Ville"
//         description="Sweet Tomatoes Farm Location"
//       />
//     </MapView>



//   <TouchableOpacity style={styles.chatButton}>
//     <Text style={styles.chatButtonText}>Chat Farm</Text>
//   </TouchableOpacity>

//   <View style={styles.buyNowContainer}>
//     <TouchableOpacity style={styles.buyNowButton}>
//       <Text style={styles.buyNowText}>Buy Now</Text>
//     </TouchableOpacity>
//     <TouchableOpacity style={styles.cartButton}>
//       <Icon name="shopping-cart" size={24} color="#000" />
//     </TouchableOpacity>
//   </View>
// </View>

//     </ScrollView>
//   );
// };

// const { width } = Dimensions.get('window');

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   header: {
//     flexDirection: 'row',
//     padding: 16,
//     alignItems: 'center',
//   },
//   logo: {
//     width: 50,
//     height: 50,
//     resizeMode: 'contain',
//     marginRight: 10,
//   },
//   search: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 10,
//     paddingHorizontal: 10,
//     height: 40,
//   },
//   imageContainer: {
//     position: 'relative',
//     alignItems: 'center',
//   },
//   productImage: {
//     width: width - 40,
//     height: 250,
//     resizeMode: 'contain',
//     borderRadius: 12,
//     marginVertical: 10,
//   },
//   heartIcon: {
//     position: 'absolute',
//     top: 10,
//     right: 20,
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     padding: 5,
//   },
//   dots: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginBottom: 10,
//   },
//   dot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: '#ccc',
//     margin: 4,
//   },
//   dotActive: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: '#4CAF50',
//     margin: 4,
//   },
//   details: {
//     paddingHorizontal: 20,
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   title: {
//     fontWeight: 'bold',
//     fontSize: 20,
//   },
//   price: {
//     color: '#00C853',
//     fontWeight: 'bold',
//     fontSize: 18,
//   },
//   rating: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginVertical: 8,
//   },
//   reviewText: {
//     marginLeft: 8,
//     color: '#777',
//     fontSize: 12,
//   },
//   description: {
//     fontSize: 14,
//     color: '#444',
//     marginVertical: 10,
//   },
//   quantitySection: {
//     marginVertical: 10,
//   },
//   quantityLabel: {
//     fontWeight: 'bold',
//     fontSize: 16,
//     marginBottom: 6,
//   },
//   quantityControls: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   qtyButton: {
//     backgroundColor: '#ccc',
//     paddingHorizontal: 14,
//     paddingVertical: 6,
//     borderRadius: 6,
//   },
//   qtyButtonText: {
//     fontSize: 18,
//   },
//   quantityValue: {
//     marginHorizontal: 10,
//     fontSize: 16,
//   },
//   kgText: {
//     marginLeft: 10,
//     fontWeight: 'bold',
//     fontSize: 16,
//     color: '#00C853',
//   },
//   voucherSection: {
//     flexDirection: 'row',
//     marginTop: 16,
//     marginBottom: 30,
//   },
//   voucherInput: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 8,
//     paddingHorizontal: 10,
//     height: 40,
//   },
//   applyButton: {
//     backgroundColor: '#A5D86E',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     marginLeft: 10,
//     borderRadius: 8,
//   },
//   applyButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   farmLocationSection: {
//     paddingHorizontal: 20,
//   },
//   farmHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   farmTitle: {
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   farmNameContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   farmName: {
//     color: '#A5D86E',
//     fontWeight: '500',
//   },
//   mapImage: {
//     width: '100%',
//     height: 180,
//     borderRadius: 10,
//     marginBottom: 16,
//   },
//   chatButton: {
//     backgroundColor: '#000',
//     paddingVertical: 14,
//     borderRadius: 12,
//     alignItems: 'center',
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   chatButtonText: {
//     color: '#A5D86E',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   buyNowContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 30,
//   },
//   buyNowButton: {
//     backgroundColor: '#A5D86E',
//     flex: 1,
//     paddingVertical: 14,
//     borderRadius: 12,
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   buyNowText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   cartButton: {
//     backgroundColor: '#F2F0ED',
//     padding: 14,
//     borderRadius: 14,
//   },
//   mapView: {
//     width: '100%',
//     height: 180,
//     borderRadius: 10,
//     marginBottom: 16,
//   },
  
  
// });

// export default FocusedProduct;
