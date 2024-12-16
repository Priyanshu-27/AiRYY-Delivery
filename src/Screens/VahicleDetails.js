import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
  Alert,
  FlatList,
  Animated,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import opencamera from '../components/opencamera';
import {Dropdown} from 'react-native-element-dropdown';
import {launchCamera} from 'react-native-image-picker';
import {DOMAIN} from '@env';
import {useNavigation} from '@react-navigation/native';
import {useRoute} from '@react-navigation/core';
import LottieView from 'lottie-react-native';
import RNFS from 'react-native-fs';
import {useSelector} from 'react-redux';
const Checkbox = ({text, value, onPress}) => {
  return (
    <TouchableOpacity
      style={[styles.checkboxContainer, {marginRight: 10}]}
      onPress={onPress}>
      <View
        style={[
          styles.checkbox,
          {backgroundColor: value ? '#feb101' : 'transparent'},
        ]}>
        {value && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={styles.label2}>{text}</Text>
    </TouchableOpacity>
  );
};

const VehicleDetails = () => {
  const [KM, setKM] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  const [Bikeid, setBikeid] = useState('');
  const [Bikeiderror, setBikeiderror] = useState('');
  const [selectedBike, setSelectedBike] = useState([]);
  const [Persnal, setPersnal] = useState(0);
  const [calculatedValue] = useState(new Animated.Value(0));
  const [BikePicture, setBikePicture] = useState(null);
  const [Amount, setAmount] = useState(0);
  const phone = useSelector(state => state.counter.phone);
  const route = useRoute();

  const [AdvancePay, setAdvancePay] = useState('NO');
  const [AdvancePayUPI, setAdvancePayUPI] = useState(0);
  const [AdvancePayCash, setAdvancePayCash] = useState(0);

  const [ReturnAmount, setReturnAmount] = useState('NO');
  const [ReturnAmountUPI, setReturnAmountUPI] = useState(0);
  const [ReturnAmountCash, setReturnAmountCash] = useState(0);

  const [selectedImageBikeReading, setSelectedImageBikeReading] =
    useState(null);

  const {phoneNumber, EV} = route.params;
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [TimeTaken, setTimeTaken] = useState(null);
  const [TimeTakenUnit, setTimeTakenUnit] = useState('hours');
  const timeUnitOptions = [
    {label: 'Hours', value: 'hours'},
    {label: 'Days', value: 'days'},
    {label: 'Months', value: 'months'},
  ];
  const [TimeTakenerror, setTimeTakenerror] = useState('');
  const [KMError, setKMError] = useState('');
  const [BikePictureError, setBikePictureError] = useState('');
  const [BikeReadingError, setBikeReadingError] = useState('');

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);
 
  const handalAmount = () => {
    if (EV) {
      const days = Math.floor(TimeTaken / 24);
      const remainingHours = TimeTaken % 24;
      const cost =
        days * 700 +
        Math.floor(remainingHours / 12) * 400 +
        (remainingHours % 12) * 30;

      setAmount(cost);
    } else {
      const days = Math.floor(TimeTaken / 24);
      const remainingHours = TimeTaken % 24;
      const cost =
        days * 700 +
        Math.floor(remainingHours / 12) * 400 +
        (remainingHours % 12) * 40;

      setAmount(cost);
    }
  };
  const handleSubmit = () => {
    if (!validateFields()) {
      Alert.alert('Error', 'Please fill all the required fields.');
      return;
    }
  
    // Convert TimeTaken into hours based on the selected unit (hours, days, or months)
    let timeInHours = parseFloat(TimeTaken);
    if (TimeTakenUnit === 'days') {
      timeInHours *= 24;
    } else if (TimeTakenUnit === 'months') {
      timeInHours *= 24 * 30; // Assuming 1 month = 30 days
    }
  
    // Create FormData object
    const formData = new FormData();
  
    // Add image data (if available)
    if (selectedImageBikeReading) {
      const bikeReadingImageData = {
        uri: selectedImageBikeReading,
        type: 'image/jpeg',
        name: `${phoneNumber}_Kilometer_Reading.jpg`,
      };
      formData.append('KM_Reading', bikeReadingImageData);
    }
  
    if (BikePicture) {
      const bikePictureData = {
        uri: BikePicture,
        type: 'image/jpeg',
        name: `${phoneNumber}_Previous_Pic.jpg`,
      };
      formData.append('Pic_before', bikePictureData);
    }
  
    // Append the rest of the form fields
    formData.append('Estimated_Amount', Amount || 0); 
    formData.append('KM_Previous', KM || '');         
    formData.append('EV', EV ? 'true' : 'false');          
    formData.append('Bikeid', Bikeid || '');           
    formData.append('AdvancePay', parseInt(AdvancePayCash) + parseInt(AdvancePayUPI));
    formData.append('AdvancePayUPI', AdvancePayUPI || 0); 
    formData.append('AdvancePayCash', AdvancePayCash || 0); 
    formData.append('Persnal', Persnal);
    formData.append('staff', phone);
  
    // Add return amount details
    const totalReturnAmount = parseInt(ReturnAmountCash) + parseInt(ReturnAmountUPI);
    formData.append(
      'return',
      `cash = ${parseInt(ReturnAmountCash)} upi = ${parseInt(ReturnAmountUPI)} total = ${totalReturnAmount}`
    );
  
    // Append the calculated time thought in hours
    formData.append('TimeThought', timeInHours || 0);
    console.log(formData)
    setIsLoading(true);

    fetch(`https://${DOMAIN}/Bike/assign_bike_to_bike/${phoneNumber}/`, {
      method: 'PUT',
      body: formData,
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(responseJson => {
        if (responseJson.bike && responseJson.bike.license_plate) {
          Alert.alert(
            'Done',
            `Give this Bike ${responseJson.bike.license_plate}`,
            [
              {
                text: 'OK',
                onPress: () => {
                  // Navigate to the 'DrawerNavigator' screen after the user presses "OK"
                  navigation.navigate('DrawerNavigator');
                },
              },
            ],
          );
        } else if (responseJson.Error) {
          Alert.alert(`Error`, `Try again! Error: ${responseJson.Error}`, [
            {
              text: 'OK',
            },
          ]);
        } else {
          Alert.alert(
            'Unexpected Response',
            'The API response does not contain the expected data structure.',
            [
              {
                text: 'OK',
              },
            ],
          );
        }

        setIsLoading(false);
      })
      .catch(error => {
        console.error('API Error:', error);
        Alert.alert('Error', `Try again!`, [
          {
            text: 'OK',
          },
        ]);
        setIsLoading(false);
      });

      const pattern = /\/([\w-]+)\.jpg$/;

    const newUrl = selectedImageBikeReading.replace(pattern, '');
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
  
    const validateFields = () => {
      let isValid = true;
  
      if (!TimeTaken) {
        setTimeTakenerror(`Please enter expected ${TimeTakenUnit}`);
        
        isValid = false;
      } else {
        setTimeTakenerror('');
      }
  
      if (!KM) {
        setKMError('Please enter Current Kilometer');
        isValid = false;
      } else {
        setKMError('');
      }
  
      if (!selectedImageBikeReading) {
        setBikeReadingError('Please upload Bike Reading Picture');
        isValid = false;
      } else {
        setBikeReadingError('');
      }
  
      if (!BikePicture) {
        setBikePictureError('Please upload Bike Condition Picture');
        isValid = false;
      } else {
        setBikePictureError('');
      }
      if (!Bikeid) {
        setBikeiderror('Please choose BikeID');
        isValid = false;
      } else {
        setBikeiderror('');
      }
  
      return isValid;
    };
  const handleBikePicturePicker = async () => {
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
          setBikePicture(response.assets[0].uri);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };
  const handleBikeReadingPicturePicker = async () => {
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
          setSelectedImageBikeReading(response.assets[0].uri);
          handalAmount();
        }
      });
    } catch (error) {
      console.log(error);
    }
  };
  const handleBikePicturePicker2 = async () => {
    const result = await opencamera(phoneNumber, '_Adhar_Card.jpg');
    if (result) {
      // console.log(result.path,result.name)
      setBikePicture(result.path);
    } else {
      Alert.alert('Error', 'Failed to capture Image');
    }
  };
  const handleBikeReadingPicturePicker2 = async () => {
    const result = await opencamera(phoneNumber, '_Adhar_Card.jpg');
    if (result) {
      // console.log(result.path,result.name)
      setSelectedImageBikeReading(result.path);
      handalAmount();
    } else {
      Alert.alert('Error', 'Failed to capture Image');
    }
  };
  const calculateValue = () => {
    let timeInHours = parseFloat(TimeTaken); // Ensure TimeTaken is a valid number
  
    // Handle case where TimeTaken is invalid or not a number
    if (isNaN(timeInHours)) {
      return 0; // Default to 0 or some other valid number
    }
  
    // Convert days or months to hours
    if (TimeTakenUnit === 'days') {
      timeInHours *= 24;
    } else if (TimeTakenUnit === 'months') {
      timeInHours *= 24 * 30; // Assuming 1 month = 30 days
    }
  
    if (EV) {
      const days = Math.floor(timeInHours / 24);
      const remainingHours = timeInHours % 24;
      const cost = days * 700 + Math.floor(remainingHours / 12) * 400 + (remainingHours % 12) * 30;
  
      return cost;
    } else {
      const days = Math.floor(timeInHours / 24);
      const remainingHours = timeInHours % 24;
      const cost = days * 700 + Math.floor(remainingHours / 12) * 400 + (remainingHours % 12) * 40;
  
      return cost;
    }
  };
  
  
  useEffect(() => {
    const newValue = calculateValue();
  
    if (!isNaN(newValue)) {
      Animated.timing(calculatedValue, {
        toValue: newValue,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [KM, TimeTaken, TimeTakenUnit]);
  
  
  const handlechange = method => {
    if (method === 'AdvancePay') {
      setAdvancePay(AdvancePay === 'AdvancePay' ? 'NO' : 'AdvancePay');
    }
  };

  const handlechange2 = method => {
    if (method === 'ReturnAmount') {
      setReturnAmount(ReturnAmount === 'ReturnAmount' ? 'NO' : 'ReturnAmount');
    }
  };
  const [value, setValue] = useState(null);
  const [BikeData, setBikeData] = useState([]);

  useEffect(() => {
    const focusHandler = navigation.addListener('focus', () => {
      fetch(`https://${DOMAIN}/Bike/Bikeids/`, {
        method: 'GET',
      })
        .then(response => response.json())
        .then(responseJson => {
          setBikeData(responseJson);
        })
        .catch(error => {
          console.log(error);
        });
    });
    if (EV) {
      // Filter for 'value' equal to true when EV is true
      const filteredData = BikeData.filter(item => item.value === true);

      setSelectedBike(filteredData);
      if (filteredData.length > 0) {
        setValue(filteredData[0].value);
      }
    } else {
      // Filter for 'value' equal to false when EV is false

      const filteredData = BikeData.filter(item => item.value === false);

      setSelectedBike(filteredData);
      if (filteredData.length > 0) {
        setValue(filteredData[0].value);
      }
    }
    return focusHandler;
  }, [BikeData, navigation, refreshing]);

  return (
    <View style={styles.container}>
      <View style={styles.Vcontainer}>
        <LottieView
          style={styles.video}
          source={require('../assets/animation_ljzoxvdm.json')} // Replace with your animation file path
          autoPlay
          loop
        />
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={styles.Scrollcontainer}>
        <View style={styles.box}>
          {Bikeiderror ? (
            <Text style={styles.errorText}>{Bikeiderror}</Text>
          ) : null}
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            data={selectedBike}
            itemTextStyle={{color: '#000'}}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select Bike ID"
            placeholderTextColor="#000"
            value={value}
            onChange={item => {
              setValue(item.value);
              const selectedBikeId2 = item.label.split(' -   ')[0]; // Extract the B_id
              setBikeid(selectedBikeId2);
            }}
          />

          {TimeTakenerror ? (
            <Text style={styles.errorText}>{TimeTakenerror}</Text>
          ) : null}
          
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              data={timeUnitOptions}
              maxHeight={300}
              labelField="label"
              valueField="value"
              itemTextStyle={{color: '#000'}}
              placeholderTextColor="#000"
              placeholder="Select Time Unit"
              value={TimeTakenUnit}
              onChange={item => setTimeTakenUnit(item.value)} // Update the unit based on the selection
            />

            {/* Input for time */}
            <TextInput
              placeholder={`Enter ${TimeTakenUnit}`}
              value={TimeTaken}
              placeholderTextColor="#000"
              onChangeText={text => setTimeTaken(text)}
              keyboardType="numeric"
              style={styles.inputKm}
            />
          
          {KMError ? <Text style={styles.errorText}>{KMError}</Text> : null}
          <TextInput
            placeholder="Enter Current Kilometer"
            value={KM}
            placeholderTextColor="#000"
            onChangeText={text => setKM(text)}
            keyboardType="numeric"
            style={styles.inputKm}></TextInput>
          {BikeReadingError ? (
            <Text style={styles.errorText}>{BikeReadingError}</Text>
          ) : null}
          <TouchableOpacity
            style={[styles.inputContainer, styles.documentPicker]}
            onPress={handleBikeReadingPicturePicker}>
            <Text style={styles.uploadText}>Click to Upload Bike Reading.</Text>
          </TouchableOpacity>
          {selectedImageBikeReading && (
            <View style={styles.imageContainer}>
              <Image
                source={{uri: selectedImageBikeReading}}
                style={styles.image}
              />
              <Text style={styles.imageText}>Bike Reading pic</Text>
            </View>
          )}
          {BikePictureError ? (
            <Text style={styles.errorText}>{BikePictureError}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.inputContainer, styles.documentPicker]}
            onPress={handleBikePicturePicker}>
            <Text style={styles.uploadText}>
              Click to Upload Bike Condition.
            </Text>
          </TouchableOpacity>
          {BikePicture && (
            <View style={styles.imageContainer}>
              <Image source={{uri: BikePicture}} style={styles.image} />
              <Text style={styles.imageText}>Bike Condition pic</Text>
            </View>
          )}
          <View style={styles.animatedContainer}>
            <Animated.Text
              style={[styles.calculatedValue, {opacity: calculatedValue}]}>
              <Text>₹</Text> {calculateValue()}
            </Animated.Text>
          </View>
          <Checkbox
            text="Advance Payment (Optional)"
            value={AdvancePay === 'AdvancePay'}
            onPress={() => handlechange('AdvancePay')}
          />

          {AdvancePay == 'AdvancePay' ? (
            <>
              <TextInput
                placeholder="UPI"
                value={AdvancePayUPI}
                placeholderTextColor="#000"
                onChangeText={text => setAdvancePayUPI(text)}
                keyboardType="numeric"
                style={styles.inputKm}></TextInput>
              <TextInput
                placeholder="Cash"
                value={AdvancePayCash}
                placeholderTextColor="#000"
                onChangeText={text => setAdvancePayCash(text)}
                keyboardType="numeric"
                style={styles.inputKm}></TextInput>
            </>
          ) : null}

          <Checkbox
            text="Deposite Payment (Optional)"
            value={ReturnAmount === 'ReturnAmount'}
            onPress={() => handlechange2('ReturnAmount')}
          />

          {ReturnAmount == 'ReturnAmount' ? (
            <>
              <TextInput
                placeholder="UPI"
                value={ReturnAmountUPI}
                placeholderTextColor="#000"
                onChangeText={text => setReturnAmountUPI(text)}
                keyboardType="numeric"
                style={styles.inputKm}></TextInput>
              <TextInput
                placeholder="Cash"
                value={ReturnAmountCash}
                placeholderTextColor="#000"
                onChangeText={text => setReturnAmountCash(text)}
                keyboardType="numeric"
                style={styles.inputKm}></TextInput>
            </>
          ) : null}

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
          {isLoading && (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color="#000000" />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    height: 50,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    marginBottom: 20,
    color: '#000',
    paddingLeft: 7,
    paddingRight: 15,
  },

  checkboxContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 30,
  },
  checkmark: {
    color: '#000',
  },

  placeholderStyle: {
    fontSize: 15,
    color: '#000',
  },
  selectedTextStyle: {
    fontSize: 15,
    color: '#000',
  },
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
    marginTop: 150,
  },

  video: {
    width: 350,
    height: 350,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#feb101',
  },
  Scrollcontainer: {
    width: '100%',
  },
  box: {
    backgroundColor: '#fff',
    padding: 20,
    shadowColor: 'black',
    shadowOpacity: 0.5,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 6,
    marginTop: 210,
    width: '100%',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  inputKm: {
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    marginBottom: 20,
    color: '#000',
  },
  label2: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#000',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
    color: '#000',
  },
  selectedDate: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    padding: 10,
    backgroundColor: 'blue',
    color: '#fff',
    borderRadius: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    width: '110%',
    padding: 20,
  },
  inputContainer: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 20,
    width: '100%',
  },
  uploadText: {
    color: '#000',
    alignSelf: 'center',
    fontWeight: 'bold',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 360,
    height: 180,
    borderRadius: 10,
  },
  imageText: {
    color: '#228B22',
    fontWeight: 'bold',
    letterSpacing: 1,
    marginTop: 10,
  },
  button: {
    backgroundColor: '#feb101',
    width: '80%',
    height: 40,
    justifyContent: 'center',
    alignSelf: 'center',
    borderRadius: 5,
    marginTop: 30,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    alignSelf: 'center',
    fontSize: 17,
    letterSpacing: 1,
  },
  documentPicker: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    color: 'black',
  },
  calculatedValue: {
    fontSize: 20,
    color: 'green',
    alignSelf: 'center',
  },
  animatedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    width: '100%',
    marginTop: 12,
    marginBottom: 12,
    backgroundColor: '#ffffff',
    shadowColor: 'black',
    shadowOpacity: 0.5,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 6,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
    fontWeight: 'bold',
  },
});

export default VehicleDetails;
