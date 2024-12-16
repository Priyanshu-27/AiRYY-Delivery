import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Button,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import LottieView from 'lottie-react-native';
import {useNavigation} from '@react-navigation/native';
import opencamera from '../components/opencamera';
import {DOMAIN} from '@env';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import RNFS from 'react-native-fs';

import {launchCamera} from 'react-native-image-picker';
import {useRoute} from '@react-navigation/core';
import {useSelector} from 'react-redux';

const Checkbox = ({label, value, onPress}) => {
  return (
    <TouchableOpacity style={styles.checkboxContainer} onPress={onPress}>
      <View
        style={[
          styles.checkbox,
          {backgroundColor: value ? '#feb101' : 'transparent'},
        ]}>
        {value && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={{color: 'black', marginHorizontal: 20}}>{label}</Text>
    </TouchableOpacity>
  );
};

const CustomerDetails = () => {
  const [userName, setUserName] = useState('');
  const [User, setUser] = useState([]);
  const [EmergencyCOntact, setEmergencyCOntact] = useState([]);

  const [LastName, setLastName] = useState('');
  const [bikeType, setBikeType] = useState('EV');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [EV, setEV] = useState(true);
  const [Adharcard, setAdharcard] = useState('');
  const [Adharcardname, setAdharcardname] = useState('');
  const [Licensename, setLicensename] = useState('');
  const [License, setLicense] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isActive, setisActive] = useState(true);

  const [OTP, setOTP] = useState(false);
  const [isDocument, setisDocument] = useState(false);
  const [isChanged, setisChanged] = useState(false);

  const [count, setcount] = useState('');
  const [onn, setonn] = useState(false);
  const [userNameError, setuserNameError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [adharCardError, setAdharCardError] = useState('');
  const [licenseError, setLicenseError] = useState('');
  const navigation = useNavigation();

  const [isLoadingOtp, setIsLoadingOtp] = useState(false);
  const [isOptReceived, setIsOptReceived] = useState(false);

  const handleVerify = () => {
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
      setUserName(fname);
      setLastName(lname);
      setAdharcard(User.Adhar_Card);
      setAdharcardname(phoneNumber + '_Adhar_Card.jpg');
      setLicense(User.license_id);
      setLicensename(phoneNumber + '_License.jpg');
    } else {
      setisActive(false);
    }

    setIsLoadingOtp(true);
    setTimeout(() => {
      setIsLoadingOtp(false);
      setIsOptReceived(true);
    }, 3000); // Simulating a delay of 3 seconds for receiving OTP
  };

  const handleConfirmOpt = () => {
    // Handle confirming OTP received
    setPhoneNumber("")
    setAdharcard("")
    setLicense("")
    setLastName("")
    setUserName("")
    setIsOptReceived(false); // Reset state for next verification
  };

  const handleBikeTypeChange = condition => {
    setBikeType(condition);
  };
  const fetchData = async () => {
    try {
      const response = await fetch(
        `https://${DOMAIN}/Bike/usercount/${phoneNumber}/`,
      );
      const data = await response.json();
      setcount(data);
      setonn(true);

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

  useEffect(() => {
    // Only fetch data if phoneNumber has at least 10 characters

    if (phoneNumber.length >= 10) {
      setIsLoading(true);
      fetchData();
    }
    setIsLoading(false);
  }, [phoneNumber]);

  const validateFields = () => {
    let isValid = true;

    if (EV) {
      if (!Adharcard || !Adharcardname) {
        setAdharCardError('Please upload Adhar Card for EV');
        isValid = false;
      } else {
        setAdharCardError('');
      }
    } else {
      if (!License || !Licensename) {
        setLicenseError('Please upload License for Petrol Bikes');
        isValid = false;
      } else {
        setLicenseError('');
      }

      if (!Adharcard || !Adharcardname) {
        setAdharCardError('Please upload Adhar Card for Petrol Bikes');
        isValid = false;
      } else {
        setAdharCardError('');
      }
    }

    if (!phoneNumber || phoneNumber.length < 10 || phoneNumber.length > 10) {
      setPhoneNumberError('Please enter correct Phone Number');
      isValid = false;
    } else {
      setPhoneNumberError('');
    }
    if (!userName) {
      setuserNameError('Please enter The User Name');
      isValid = false;
    } else {
      setuserNameError('');
    }
    if (!LastName) {
      setuserNameError('Please enter The User Name');
      isValid = false;
    } else {
      setuserNameError('');
    }

    return isValid;
  };
  const data = new FormData();

  if (EV) {
    const AdharData = {
      uri: Adharcard,
      type: 'image/jpeg',
      name: Adharcardname,
    };
    data.append('Adhar_Card', AdharData);
  } else {
    const licenseData = {
      uri: License,
      type: 'image/jpeg',
      name: Licensename,
    };
    const AdharData = {
      uri: Adharcard,
      type: 'image/jpeg',
      name: Adharcardname,
    };
    data.append('Adhar_Card', AdharData);
    data.append('license_id', licenseData);
  }
  data.append('EV', EV);
  data.append('fname', userName);
  data.append('lname', LastName);

  const handleSubmit = async () => {
    if (!validateFields()) {
      setisActive(false);
      Alert.alert('Error', 'Fill All The Fields Again');
      // Fields are not valid, show error or perform necessary actions
      return;
    }
    setIsLoading(true);

    await fetch(`https://${DOMAIN}/Bike/assign_bike_to_user/${phoneNumber}/`, {
      method: 'PUT',
      body: data,
    })
      .then(response => response.json())
      .then(responseJson => {
        setTimeout(() => {
          if (responseJson.Error) {
            Alert.alert('Error', responseJson.Error);
          } else if (User && User.Signature && !EmergencyCOntact) {
            navigation.navigate('Emergency', {
              phoneNumber: phoneNumber,
              EV: EV,
              userName: userName,
              car: false,
            });
          } else if (User && User.Signature && EmergencyCOntact) {
            navigation.navigate('VehicleDetails', {
              phoneNumber: phoneNumber,
              EV: EV,
              userName: userName,
            });
          } else {
            navigation.navigate('AgreementPage', {
              phoneNumber: phoneNumber,
              EV: EV,
              userName: userName,
              car: false,
            });
          }

          setIsLoading(false);
        }, 500);
      })
      .catch(error => {
        setTimeout(() => {
          Alert.alert(`${error}`, `Try again! `);
          setIsLoading(false);
        }, 500);
      });

    // setPhoneNumber('');
    // setLicense(null);
    // setAdharcard(null);

    const pattern = /\/([\w-]+)\.jpg$/;

    const newUrl = Adharcard.replace(pattern, '');
    console.log(newUrl);
    RNFS.readdir(newUrl)
      .then(files => {
        // Filter files with .jpg extension
        const jpgFiles = files.filter(file => file.endsWith('.jpg'));

        // Delete each .jpg file
        jpgFiles.forEach(file => {
          const filePath = `${newUrl}/${file}`;

          // Delete the file
          RNFS.unlink(filePath)
            .then(() => {
              console.log(`File ${file} deleted successfully`);
            })
            .catch(error => {
              console.log(`Error deleting file ${file}:`, error);
            });
        });

        if (jpgFiles.length === 0) {
          console.log('No .jpg files found to delete');
          Alert.alert(`Error`, `Try Capture the Image`);
        }
      })
      .catch(error => {
        console.log('Error reading directory:', error);
      });
  };

  const options = {
    mediaType: 'photo',
    quality: 0.4,
    storageOptions: {
      skipBackup: true,
    },
  };
  const AdharcardPicker = () => {
    try {
      launchCamera(options, response => {
        console.log('Response = ', response);
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
        } else if (response.customButton) {
          console.log('User tapped custom button: ', response.customButton);
        } else {
          setAdharcard(response.assets[0].uri);
          setAdharcardname(phoneNumber + '_Adhar_Card.jpg');
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  const LicensePicker = async () => {
    try {
      await launchCamera(options, response => {
        console.log('Response = ', response);
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
        } else if (response.customButton) {
          console.log('User tapped custom button: ', response.customButton);
        } else {
          setLicense(response.assets[0].uri);
          setLicensename(phoneNumber + '_License.jpg');
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleAdharCardCapture = async () => {
    const result = await opencamera(phoneNumber, '_Adhar_Card.jpg');
    if (result) {
      // console.log(result.path,result.name)
      setAdharcard(result.path);
      setAdharcardname(result.name);
    } else {
      Alert.alert('Error', 'Failed to capture Adhar Card');
    }
  };

  const handleLicenseCapture = async () => {
    const result = await opencamera(phoneNumber, '_License.jpg');
    if (result) {
      // console.log(result.path,result.name)

      setLicense(result.path);
      setLicensename(result.name);
    } else {
      Alert.alert('Error', 'Failed to capture Adhar Card');
    }
  };

  const SendOTP = () => {};
  // const renderOTPInput = () => {
  //   return (
  //     <View style={styles.checkboxContainer}>
  //       <Text style={styles.label}>OTP:</Text>
  //       <TextInput
  //         placeholder="Enter OTP"
  //         placeholderTextColor="#000"
  //         value={OTP}
  //         onChangeText={text => setOTP(text)}
  //         style={styles.input2}
  //         keyboardType="phone-pad"
  //       />
  //       <TouchableOpacity
  //         style={{marginBottom: 10, paddingLeft: 20}}
  //         onPress={() => fetchData()}>
  //         <FontAwesome
  //           name="arrow-right"
  //           size={18}
  //           color="black"
  //           style={styles.icon}
  //         />
  //       </TouchableOpacity>
  //     </View>
  //   );
  // };

  return (
    <View style={styles.background}>
      <View style={styles.Vcontainer}>
        <LottieView
          style={styles.video}
          source={require('../assets/animation_ljzoxvdm.json')}
          autoPlay
          loop
        />
      </View>

      <View style={styles.container}>
        <ScrollView>
          <View style={{padding: 16}}>
            <View>
              {phoneNumber.length >= 10 ? (
                <Text style={{color: 'green', fontSize: 16, fontWeight: '900'}}>
                  User Count - {count}
                </Text>
              ) : null}
              <View style={{marginLeft: 20, marginBottom: 10}}>
                {phoneNumberError ? (
                  <Text style={styles.errorText}>{phoneNumberError}</Text>
                ) : null}
              </View>
              <View style={styles.inputContainer1}>
                <FontAwesome
                  name="phone"
                  size={18}
                  color="black"
                  style={styles.icon}
                />
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
                  style={styles.input}
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
                        onPress={handleVerify}>
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
              </View>
              <View style={{marginLeft: 20, marginBottom: 10}}>
                {userNameError ? (
                  <Text style={styles.errorText}>{userNameError}</Text>
                ) : null}
              </View>

              <View style={styles.inputContainer2}>
                <FontAwesome
                  name="user"
                  size={18}
                  color="black"
                  style={styles.icon}
                />
                <TextInput
                  placeholder="First Name"
                  placeholderTextColor="#000"
                  value={userName}
                  onChangeText={text => setUserName(text)}
                  style={[styles.input, styles.halfInput]} // Apply halfInput style for each TextInput
                />
                <TextInput
                  placeholder="Last Name"
                  placeholderTextColor="#000"
                  value={LastName}
                  onChangeText={text => setLastName(text)}
                  style={[styles.input, styles.halfInput]} // Apply halfInput style for each TextInput
                />
              </View>
            </View>
            {/* {!isActive ? renderOTPInput() : null} */}
            <View style={styles.checkboxContainer}>
              <Text style={styles.label}>Bike Type:</Text>
              <Checkbox
                label="EV"
                value={bikeType === 'EV'}
                onPress={() => {
                  handleBikeTypeChange('EV');
                  setEV(true);
                }}
              />
              <Checkbox
                label="Petrol"
                value={bikeType === 'Petrol'}
                onPress={() => {
                  handleBikeTypeChange('Petrol');
                  setEV(false);
                }}
              />
            </View>
            {!isActive && (
              <View>
                {EV ? (
                  <View style={styles.inputContainer3}>
                    <View style={{width: '100%'}}>
                      <View style={{marginBottom: 10}}>
                        {adharCardError ? (
                          <Text style={styles.errorText}>{adharCardError}</Text>
                        ) : null}
                      </View>
                      <TouchableOpacity
                        onPress={handleAdharCardCapture}
                        style={[styles.input, styles.documentPicker]}>
                        <Text style={{color: '#000'}}>
                          {Adharcard
                            ? `Adhar Card: ${Adharcardname}`
                            : 'Upload Adhar Card for EV'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View>
                    <View style={{marginBottom: 10}}>
                      {licenseError ? (
                        <Text style={styles.errorText}>{licenseError}</Text>
                      ) : null}
                    </View>
                    <View style={styles.inputContainer4}>
                      <TouchableOpacity
                        onPress={handleLicenseCapture}
                        style={[styles.input, styles.documentPicker]}>
                        <Text style={{color: '#000'}}>
                          {License
                            ? `License: ${Licensename}`
                            : 'Upload License for Petrol Bikes'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View style={{marginBottom: 10}}>
                      {adharCardError ? (
                        <Text style={styles.errorText}>{adharCardError}</Text>
                      ) : null}
                    </View>
                    <View style={styles.inputContainer5}>
                      <TouchableOpacity
                        onPress={handleAdharCardCapture}
                        style={[styles.input, styles.documentPicker]}>
                        <Text style={{color: '#000'}}>
                          {Adharcard
                            ? `Adhar Card: ${Adharcardname}`
                            : 'Upload Adhar Card for Petrol Bikes'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            )}

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
            <View
              style={{
                flex: 1,
                justifyContent: 'flex-start',
                alignItems: 'flex-center',
                position: 'absolute',
                top: 0,
                right: 15,
              }}>
              <TouchableOpacity
                style={{
                  backgroundColor: 'white',
                  paddingHorizontal: 10,
                  elevation: 3,
                  paddingVertical: 8,
                  borderRadius: 8,
                }}
                onPress={() => setisActive(!isActive)}>
                <Text style={{color: '#000', fontWeight: '600'}}>
                  Update Docs.
                </Text>
              </TouchableOpacity>
            </View>

            {isLoading && (
              <View style={styles.loader}>
                <ActivityIndicator size="large" color="#000000" />
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
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
  Vcontainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
    width: 300,
  },
  video: {
    width: 350,
    height: 350,
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    backgroundColor: '#feb101',
  },

  label: {
    fontSize: 16,
    paddingRight: 50,
    marginBottom: 7,
    fontWeight: 'bold',
    marginLeft: 5,
    color: 'black',
  },

  container: {
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 0,
    borderTopRightRadius: 40,
    borderTopLeftRadius: 40,
    margin: 0,
    shadowColor: 'black',
    shadowOpacity: 0.5,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 0,
    height: 450,
  },

  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 8,
    marginTop: 5,
  },
  label: {
    fontSize: 16,
    marginLeft: -10,
    fontWeight: 'bold',
    color: 'black',
    marginRight: 5,
    marginTop: -4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
  },
  checkmark: {
    color: '#000',
    marginLeft: 3,
  },
  inputContainer1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 30,
  },
  inputContainer2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  inputContainer3: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  inputContainer4: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  inputContainer5: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    color: 'black',
  },
  halfInput: {
    flex: 1,
    marginLeft: 2,
  },
  icon: {
    marginRight: 10,
  },
  button: {
    backgroundColor: '#feb101',
    width: '100%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  documentPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default CustomerDetails;
