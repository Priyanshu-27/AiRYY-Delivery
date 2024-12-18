import React, {useState, useEffect} from 'react';
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
import {DOMAIN} from '@env';
const CustomerDetails = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [UserNotFound, setUserNotFound] = useState(true);

  const [UserCount, setUserCount] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [aadharNumber, setAadharNumber] = useState('');
  const [PanNumber, setPanNumber] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [Update, setUpdate] = useState(false);
  const [IGotTheuser, setIGotTheuser] = useState(false);

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
    console.log('da', userData);

    setIsLoading(true);

    try {
      const response = await fetch(
        `https://${DOMAIN}/accounts/CreateDeliveryBoy/`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        },
      );

      const responseData = await response.json();

      if (response.ok) {
        // Show Toast for success
        ToastAndroid.show('User created successfully!', ToastAndroid.SHORT);
        if (EmergencyCOntact) {
          navigation.navigate('VehicleDetails', {
            phoneNumber: phoneNumber,
          });
        } else {
          navigation.navigate('Emergency', {
            phoneNumber: phoneNumber,
          });
        }

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

  const handleVerifyUser = async phone => {
    setIsLoading(true);
    setUserNotFound(false);
    try {
      const response = await fetch(
        `https://${DOMAIN}/accounts/CreateDeliveryBoy/?phone=${phone}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const responseData = await response.json();

      if (response.ok && responseData.user_phone) {
        console.log(responseData);
        setIGotTheuser(true);
        setEmail(responseData.user_email);
        setAadharNumber(responseData.aadhar_number);
        setPanNumber(responseData.pan_number);
        setSecondaryPhone(responseData.secondary_phone);
        setPhoneNumber(responseData.user_phone);
        const [firstName, lastName] = responseData.user_name.split(' ');
        setFirstName(firstName);
        setLastName(lastName);
        setSelectedCity(responseData.user_City);
        setGender(responseData.user_Gender);
        setSelectedState(responseData.user_State);

        ToastAndroid.show(`User found !`, ToastAndroid.SHORT);
      } else {
        ToastAndroid.show(
          responseData.error || 'User not found',
          ToastAndroid.SHORT,
        );
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Network request failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const [onn, setonn] = useState(true);
  const [isLoadingOtp, setIsLoadingOtp] = useState(false);
  const [isOptReceived, setIsOptReceived] = useState(false);
  const handleConfirmOpt = () => {
    // Handle confirming OTP received
    setPhoneNumber('');
    setAdharcard('');
    setLicense('');
    setLastName('');
    setUserName('');
    setIsOptReceived(false); // Reset state for next verification
  };

  const [User, setUser] = useState([]);
  const [EmergencyCOntact, setEmergencyCOntact] = useState([]);
  const fetchData = async () => {
    try {
      const response = await fetch(
        `https://${DOMAIN}/Bike/usercount/${phoneNumber}/`,
      );
      const data = await response.json();
      setUserCount(data);
      const response2 = await fetch(
        `https://${DOMAIN}/User/Profile/${phoneNumber}/`,
      );
      const data2 = await response2.json();

      setUser(data2.data);
      setEmergencyCOntact(data2.emergency);

      //  else {
      //   // otp logic
      //   // const response = await fetch(
      //   //   `https://${DOMAIN}/Bike/sendotp/${phoneNumber}/`,
      //   // );
      // }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const handleVerify2 = () => {
    // Simulate sending OTP to user
    if (User) {
      // Trim any leading or trailing whitespace from the name
      const trimmedName = User.name.trim();

      // Split the name into parts based on space
      const nameParts = trimmedName.split(' ');

      // Extract first name and last name, assuming there is at least one space
      const fname = nameParts[0] || '';
      const lname = nameParts[1] || '';

      // Set the state with first name and last name
      setFirstName(fname);
      setLastName(lname);
    }

    // setIsLoadingOtp(true);
    // setTimeout(() => {
    //   setIsLoadingOtp(false);
    //   setIsOptReceived(true);
    // }, 3000); // Simulating a delay of 3 seconds for receiving OTP
  };

  useEffect(() => {
    if (phoneNumber.length >= 10) {
      setIsLoading(true);
      fetchData();
    }
    setIsLoading(false);
  }, [IGotTheuser, phoneNumber]);

  return (
    <View style={styles.background}>
      {UserNotFound ? (
        <View className="flex-1 h-full w-full justify-center bg-[#feb101] p-2 ">
          <ScrollView contentContainerStyle={styles.contentContainer2}>
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
                <Text style={{color: 'green'}}>Count - {UserCount || 0}</Text>
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
                  }}
                  onPress={() => setUpdate(prev => !prev)}>
                  <Text style={{color: '#000'}}>Update Doc.</Text>
                </TouchableOpacity>
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
                  onChangeText={phone => {
                    setPhoneNumber(phone);
                  }}
                  style={styles.input}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
                {phoneError ? (
                  <Text style={styles.errorText}>{phoneError}</Text>
                ) : null}
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleVerifyUser(phoneNumber)}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Verify</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      ) : (
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
              <Text style={{color: 'green'}}>Count - {UserCount || 0}</Text>
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
                }}
                onPress={() => setUpdate(prev => !prev)}>
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
            {IGotTheuser ? (
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
                  editable={false} // Make the field not editable
                />
                {phoneError ? (
                  <Text style={styles.errorText}>{phoneError}</Text>
                ) : null}
              </View>
            ) : (
              <View style={styles.inputContainer1}>
                <TextInput
                  placeholder="Phone Number"
                  placeholderTextColor="#000"
                  value={phoneNumber}
                  onChangeText={text => {
                    if (text.length < 10) {
                      setonn(false);
                    }
                    setPhoneNumber(text);
                  }}
                  style={styles.input2}
                  keyboardType="phone-pad"
                />
                {onn ? (
                  <View>
                    {isLoadingOtp ? (
                      <ActivityIndicator
                        style={{
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginLeft: 15,
                          paddingHorizontal: 10,
                          paddingVertical: 10,

                          marginBottom: 10,
                          fontWeight: '800',

                          borderRadius: 5,
                          borderWidth: 1,
                          borderColor: 'gray',
                        }}
                        size="small"
                        color="#000"
                      />
                    ) : isOptReceived ? (
                      <TouchableOpacity
                        style={{
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginLeft: 15,
                          paddingHorizontal: 10,
                          paddingVertical: 10,
                          elevation: 2,
                          marginBottom: 10,

                          backgroundColor: '#22c55e',
                          borderRadius: 5,
                        }}
                        onPress={handleConfirmOpt}>
                        <Text
                          style={{
                            color: '#FFF',
                            fontWeight: '500',
                            letterSpacing: 1,
                          }}>
                          ✔
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={{
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginLeft: 15,
                          paddingHorizontal: 10,
                          paddingVertical: 10,
                          elevation: 2,
                          marginBottom: 10,
                          backgroundColor: '#fef08a',
                          borderRadius: 5,
                        }}
                        onPress={handleVerify2}>
                        <Text
                          style={{
                            color: '#000',
                            fontWeight: '500',
                            letterSpacing: 1,
                          }}>
                          Verify
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : null}
                {phoneError ? (
                  <Text style={styles.errorText}>{phoneError}</Text>
                ) : null}
              </View>
            )}

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

            {IGotTheuser ? (
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  if (EmergencyCOntact) {
                    navigation.navigate('VehicleDetails', {
                      phoneNumber: phoneNumber,
                    });
                  } else {
                    navigation.navigate('Emergency', {
                      phoneNumber: phoneNumber,
                    });
                  }
                }}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Navigate</Text>
                )}
              </TouchableOpacity>
            ) : (
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
            )}
          </View>
        </ScrollView>
      )}
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
    justifyContent: 'center',
    marginTop: -20,
    paddingBottom: 20,
  },
  contentContainer2: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
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
  inputContainer1: {
    flexDirection: 'row',
    alignItems: 'center',
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
  input2: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    height: 40,
    backgroundColor: '#fff',
    color: '#000',
    marginBottom: 10,
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
