import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import {DOMAIN} from '@env';
import {useDispatch} from 'react-redux';
import {login} from '../Redux/Counter/counterAction';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import localStorage from 'redux-persist/es/storage';
// import messaging from '@react-native-firebase/messaging';

const LoginScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [Name, setName] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(true);
  const [isNameValid, setIsNameValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  // const sendFCMTokenToServer = async () => {
  //   try {
  //     // Request permission and get FCM token
  //     await messaging().requestPermission();
  //     let token = await messaging().getToken();
  //     console.log(token);

  //     // Construct data with FCM token
  //     const data = JSON.stringify({
  //       code: token,
  //     });

  //     console.log(data);

  //     // Send FCM token to the server
  //     const response = await fetch(
  //       `https://${DOMAIN}/accounts/create_FMC/${phoneNumber}/`,
  //       {
  //         method: 'PUT',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: data,
  //       },
  //     );

  //     if (response.ok) {
  //       console.log('FCM token sent successfully to the server.');
  //     } else {
  //       console.error('Failed to send FCM token to the server.');
  //     }
  //   } catch (error) {
  //     console.error('Error obtaining or sending FCM token:', error);
  //     setIsLoading(false);
  //   }
  // };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    setIsPhoneNumberValid(phoneNumber.length === 10);
    setIsNameValid(Name.trim().length > 0);
    setIsPasswordValid(password.trim().length > 0);
  };

  const data = {
    phone: phoneNumber,
    name: Name,
    password: password,
  };
  const handleLogin = () => {
    validateForm();
    setIsFormSubmitted(true);
    setIsLoading(true);
    fetch(`https://${DOMAIN}/Team/verify_Team/`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        if (data.uid) {
          dispatch(login(phoneNumber));
          sendFCMTokenToServer();
          if (
            isPhoneNumberValid &&
            isNameValid &&
            isPasswordValid &&
            isFormSubmitted
          ) {
            setTimeout(() => {
              setIsLoading(false);
            }, 3000);
          }
        } else {
          setIsLoading(false);
          Alert.alert('Wrong', 'Data Entry' + 'Try again!');
        }
      })
      .catch(error => {
        console.log(error);
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      });
    // setName("");
    // setPassword("");

    // setPhoneNumber("");
  };

  const {height} = Dimensions.get('window');
  const containerHeight = height;

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled">
      <View style={[styles.container, {height: containerHeight}]}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: '#000',
            marginBottom: 10,
            marginTop: -30,
          }}>
          AiRYY Delivery
        </Text>
        <Text style={styles.loginText}>Login for our Super Heroes</Text>
        <Image
          source={require('../assets/newLogin.png')}
          style={styles.image}
        />
        {!isPhoneNumberValid && isFormSubmitted && (
          <Text style={styles.errorText}>
            Please enter a valid phone number
          </Text>
        )}
        <TextInput
          style={[
            styles.input,
            !isPhoneNumberValid && isFormSubmitted && styles.invalidInput,
          ]}
          placeholder="Phone Number"
          placeholderTextColor="#000"
          keyboardType="numeric"
          value={phoneNumber}
          onChangeText={text => {
            setPhoneNumber(text);
            setIsPhoneNumberValid(text.length === 10);
          }}
          placeholderStyle={styles.placeholderText}
        />
        {!isNameValid && isFormSubmitted && (
          <Text style={styles.errorText}>Please enter your name</Text>
        )}
        <TextInput
          style={[
            styles.input,
            !isNameValid && isFormSubmitted && styles.invalidInput,
          ]}
          placeholder="Name"
          placeholderTextColor="#000"
          value={Name}
          onChangeText={text => {
            setName(text);
            setIsNameValid(text.trim().length > 0);
          }}
          placeholderStyle={styles.placeholderText}
        />
        {!isPasswordValid && isFormSubmitted && (
          <Text style={styles.errorText}>Please enter valid Password</Text>
        )}
        <View style={styles.passwordContainer}>
          <TextInput
            style={[
              styles.input,
              !isPasswordValid && isFormSubmitted && styles.invalidInput,
            ]}
            placeholder="Password"
            placeholderTextColor="#000"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={text => {
              setPassword(text);
              setIsPasswordValid(text.trim().length > 0);
            }}
            placeholderStyle={styles.placeholderText}
          />

          <TouchableOpacity
            style={styles.passwordVisibilityToggle}
            onPress={togglePasswordVisibility}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={24}
              color="#000"
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        {isLoading && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#000000" />
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  invalidInput: {
    borderColor: 'red',
    borderWidth: 3,
  },
  errorText: {
    color: 'red',
    fontSize: 15,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    // backgroundColor: '#feb101',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#feb101',
  },
  loginText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 400,
    marginBottom: 20,
    marginTop: 0,
  },

  input: {
    width: '100%',
    height: 40,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    marginBottom: 13,
    color: '#000',
    shadowColor: 'black',
    shadowOpacity: 0.5,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 6,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  passwordVisibilityToggle: {
    position: 'absolute',
    right: 8,
    top: 7.5,
  },
  button: {
    backgroundColor: '#000',
    width: '100%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#feb101',
    fontWeight: 'bold',
    letterSpacing: 1,
    fontSize: 18,
  },
  placeholderText: {
    fontWeight: 'bold',
  },
});

export default LoginScreen;
