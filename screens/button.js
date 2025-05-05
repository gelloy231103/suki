import { Text, StyleSheet, View } from 'react-native'
import React, { Component } from 'react'

export default class button extends Component {
  render() {
    return (
        <View>
        <TouchableOpacity style={styles.loginButton} onPress={signIn}>
            <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
    loginButton: {
        backgroundColor: '#A4DC4C',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
      },
      loginButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
      },
})
