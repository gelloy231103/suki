import { StyleSheet, Text, View, SafeAreaView, Image, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons';

import React from 'react'

const UploadId = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
        <Image
        source={require('../assets/bg1.png')}
        style={styles.backgroundImage}
        />
      <Text style={styles.title}>Upload Valid ID.</Text>
        <Text style={styles.subtitle}>
            Join Suki and Connect with Fresh, Local Produce! Create your account by filling up the form below. 
        </Text>
        <View style={styles.expanded}>
            <TouchableOpacity style={styles.uploadButton} onPress={() => navigation.navigate('UploadId')}>
                <Icon
                    name={'cloud-upload'}
                    size={90}
                    color="#9DCD5A"
                />
                <Text style={styles.buttonText}>Click here to upload Valid ID</Text>
            </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate('UploadId')}>
            <Text style={styles.registerText}>Register</Text>
        </TouchableOpacity>
    </SafeAreaView>
  )
}

export default UploadId;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        position: 'relative',
        padding: 24,
        paddingTop: 70,
    },
    buttonText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
    },
    registerButton: {
        marginTop: 30,
        backgroundColor: '#97C854',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
    },
    registerText:{
        fontFamily: 'Poppins-Bold',
        color: 'white',
        marginTop: 2,
        fontSize: 12,
    },
    expanded :{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    title: {
        fontSize: 29,
        color: '#97C854',
        fontFamily: 'Poppins-Black',
    },
    subtitle: {
        fontSize: 12,
        color: '#444',
        marginBottom: 10,
        fontFamily: 'Poppins-Regular',
    },
    backgroundImage: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 350,
        height: 350,
        opacity: .9,
        zIndex: -1,
        pointerEvents: 'none', 
    },  
    uploadButton: {
        paddingHorizontal: 50,
        paddingVertical: 40,
        backgroundColor:'#FDFDFD',
        borderRadius: 20,
        // Android shadow
        elevation: 3,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 13,
        marginTop: 15,
    }
})