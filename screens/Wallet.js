import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const Wallet = () => {
  const [showBalance, setShowBalance] = useState(false);
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headContainer}>
        <View style={styles.headerTopRow}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <View style={styles.headerIcons}>
            <Ionicons name="chatbox-ellipses" size={24} color="#fff" />
            <Ionicons name="notifications" size={24} color="#fff" />
          </View>
        </View>
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Suki Balance</Text>
            <View style={styles.balance}>
              <Text style={styles.balanceAmount}><Text>₱</Text>
                {showBalance ? '300.25' : '••••.••'}
              </Text>
              <TouchableOpacity
                onPress={() => setShowBalance(!showBalance)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showBalance ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Wallet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headContainer: {
    padding: 15,
    height: 150,
    backgroundColor: '#9DCD5A', // Green color
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
  },
  headerTopRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  headerIcons: { 
    flexDirection: 'row', 
    width: 60, 
    justifyContent: 'space-between' 
  },
  balanceContainer: {
    marginTop: 20,
    paddingHorizontal: 15,
    backgroundColor: 'red'
  },
  balanceLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    display: 'flex',
    justifyContent: 'center',
  },
  eyeIcon: {
    alignSelf: 'flex-start',
  },
  balance: {
    flexDirection: 'row',
  }
});