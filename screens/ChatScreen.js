import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Dummy chat data - you can replace this with real data later
const initialMessages = [
  {
    id: '1',
    text: 'Hey, is the product still available?',
    sender: 'user',
    timestamp: '10:30 AM',
  },
  {
    id: '2',
    text: 'Yes, it is! Are you interested in purchasing?',
    sender: 'me',
    timestamp: '10:31 AM',
  },
  {
    id: '3',
    text: "Great! What's the best price you can offer?",
    sender: 'user',
    timestamp: '10:32 AM',
  },
];

const ChatScreen = ({ route, navigation }) => {
  const { name, product } = route.params;
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = (text = newMessage) => {
    if (text.trim().length === 0) return;

    const message = {
      id: Date.now().toString(),
      text: text,
      sender: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([message, ...messages]);
    setNewMessage('');
  };

  const sendDirections = () => {
    // This would typically use actual farm coordinates
    const dummyFarmLocation = "14.6091,121.0223"; // Example coordinates
    const mapsUrl = `https://www.google.com/maps?q=${dummyFarmLocation}`;
    
    // Send the maps link as a message
    sendMessage(`Here's the direction to the farm: ${mapsUrl}`);
    
    // Optionally open maps app
    Linking.openURL(mapsUrl);
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.sender === 'me' ? styles.myMessage : styles.theirMessage
    ]}>
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.timestamp}>{item.timestamp}</Text>
    </View>
  );

  const renderProductCard = () => (
    <View style={styles.productCard}>
      <Image 
        source={product?.image || require('../assets/tomatoes.png')} 
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product?.name || "Product Name"}</Text>
        <Text style={styles.productPrice}>{product?.price || "₱0"}</Text>
        <View style={styles.farmInfo}>
          <Icon name="store" size={16} color="#666" />
          <Text style={styles.farmName}>{name}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerName}>{name}</Text>
        </View>
      </View>

      {/* Product Card */}
      {renderProductCard()}

      <KeyboardAvoidingView 
        style={styles.keyboardAvoid} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          inverted
          style={styles.messagesList}
        />

        {/* Directions Button */}
        <TouchableOpacity 
          style={styles.directionsButton}
          onPress={sendDirections}
        >
          <Icon name="directions" size={20} color="#fff" />
          <Text style={styles.directionsButtonText}>Directions to Farm</Text>
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            multiline
          />
          <TouchableOpacity 
            style={styles.sendButton} 
            onPress={() => sendMessage()}
            disabled={newMessage.trim().length === 0}
          >
            <Icon 
              name="send" 
              size={24} 
              color={newMessage.trim().length === 0 ? '#CCC' : '#9DCD5A'} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    marginLeft: 10,
  },
  headerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  productCard: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    backgroundColor: '#f9f9f9',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 15,
    color: '#9DCD5A',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  farmInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  farmName: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  keyboardAvoid: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    padding: 15,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 5,
    padding: 12,
    borderRadius: 20,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#9DCD5A',
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F0F0',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9DCD5A',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    position: 'absolute',
    bottom: 80,
    right: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  directionsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatScreen; 