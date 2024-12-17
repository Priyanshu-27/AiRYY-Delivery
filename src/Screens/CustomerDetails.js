import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import LottieView from 'lottie-react-native';
import {useNavigation} from '@react-navigation/native';
import {Picker} from '@react-native-picker/picker';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {STATES_AND_CITIES} from '../utils/SatesCities';

const CustomerDetails = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [aadharNumber, setAadharNumber] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();

  const selectedStateData = STATES_AND_CITIES.find(
    state => state.name === selectedState,
  );
  const cities = selectedStateData ? selectedStateData.cities : [];

  const validatePhone = phone => /^[6-9]\d{9}$/.test(phone);
  const validateEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async () => {
    if (!selectedState || !selectedCity) {
      Alert.alert('Error', 'Please select a state and city.');
      return;
    }

    let isValid = true;

    if (!validatePhone(phoneNumber)) {
      setPhoneError('Please enter a valid 10-digit phone number');
      isValid = false;
    } else {
      setPhoneError('');
    }

    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!firstName || !lastName || !phoneNumber) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    if (!isValid) return;

    const userData = {
      phone: phoneNumber,
      fname: firstName,
      lname: lastName,
      user_City: selectedCity,
      user_State: selectedState,
      user_email: email || '',
      user_Gender: gender || '',
      secondary_phone: secondaryPhone || '',
      aadhar_number: aadharNumber || '',
    };

    setIsLoading(true);

    try {
      const response = await fetch(
        'http://airyy-backend-three.vercel.app/accounts/CreateDeliveryBoy/',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        },
      );

      const responseData = await response.json();
      console.log(responseData) ; 

      if (response.ok) {
        // Show Toast for success
        ToastAndroid.show('User created successfully!', ToastAndroid.SHORT);

        // navigation.navigate('NextScreen', {userData: responseData});
      } else {
        Alert.alert('Error', responseData.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Network request failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.background}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.animationContainer}>
          <LottieView
            style={styles.animation}
            source={require('../assets/animation_ljzoxvdm.json')}
            autoPlay
            loop
          />
        </View>
        <View
          style={{
            backgroundColor: '#FFF',
            width: '100%',
            padding: 30,
            borderRadius: 30,
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 30,
            }}>
            <Text style={{color: 'green'}}>Count -3</Text>
            <TouchableOpacity
              style={{
                backgroundColor: '#FFF',
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 30,
                elevation: 2, // For Android
                shadowColor: '#000', // For iOS
                shadowOffset: {width: 0, height: 2}, // For iOS
                shadowOpacity: 0.25, // For iOS
                shadowRadius: 3.84, // For iOS
              }}>
              <Text style={{color: '#000'}}>Update Doc.</Text>
            </TouchableOpacity>
          </View>

          {/* State Picker */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>State</Text>
            <Picker
              selectedValue={selectedState}
              onValueChange={value => {
                setSelectedState(value);
                setSelectedCity('');
              }}
              style={styles.picker}>
              <Picker.Item label="Select State" value="" />
              {STATES_AND_CITIES.map(state => (
                <Picker.Item
                  key={state.name}
                  label={state.name}
                  value={state.name}
                />
              ))}
            </Picker>
          </View>

          {/* City Picker */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>City</Text>
            <Picker
              selectedValue={selectedCity}
              onValueChange={setSelectedCity}
              style={styles.picker}
              enabled={!!selectedState}>
              <Picker.Item label="Select City" value="" />
              {cities.map(city => (
                <Picker.Item key={city} label={city} value={city} />
              ))}
            </Picker>
          </View>

          {/* Phone Number */}
          <View style={styles.inputContainer}>
            <FontAwesome
              name="phone"
              size={18}
              color="black"
              style={styles.icon}
            />
            <TextInput
              placeholder="Phone Number*"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              style={styles.input}
              keyboardType="phone-pad"
              maxLength={10}
            />
            {phoneError ? (
              <Text style={styles.errorText}>{phoneError}</Text>
            ) : null}
          </View>
          <View style={styles.inputContainer}>
            <FontAwesome
              name="phone"
              size={18}
              color="black"
              style={styles.icon}
            />
            <TextInput
              placeholder="Secondary Phone Number*"
              value={secondaryPhone}
              onChangeText={setSecondaryPhone}
              style={styles.input}
              keyboardType="phone-pad"
              maxLength={10}
            />
            {phoneError ? (
              <Text style={styles.errorText}>{phoneError}</Text>
            ) : null}
          </View>

          {/* First and Last Name */}
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="First Name*"
              value={firstName}
              onChangeText={setFirstName}
              style={styles.input}
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Last Name*"
              value={lastName}
              onChangeText={setLastName}
              style={styles.input}
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Aadhar Number*"
              value={aadharNumber}
              onChangeText={setAadharNumber}
              style={styles.input}
            />
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
            />
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}
          </View>

          {/* Gender */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Gender</Text>
            <Picker
              selectedValue={gender}
              onValueChange={value => setGender(value)}
              style={styles.picker}>
              <Picker.Item label="Select Gender" value="" />
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />
              <Picker.Item label="Other" value="other" />
            </Picker>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#feb101',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  contentContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  animationContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  animation: {
    width: 200,
    height: 200,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    height: 40,
    backgroundColor: '#fff',
    color: '#000',
  },
  picker: {
    height: 40,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
  },
  icon: {
    position: 'absolute',
    left: 10,
    top: 10,
  },
});

export default CustomerDetails;