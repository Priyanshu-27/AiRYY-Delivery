import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import {DOMAIN} from '@env';
import {Dropdown} from 'react-native-element-dropdown';
// import opencamera from '../components/opencamera';
import {useNavigation} from '@react-navigation/native';
import {useRoute} from '@react-navigation/core';
import { useSelector } from 'react-redux';

// import {launchCamera} from 'react-native-image-picker';
import RNFS from 'react-native-fs';

const Checkbox = ({label, value, onPress}) => (
  <TouchableOpacity style={styles.checkboxContainer} onPress={onPress}>
    <View
      style={[
        styles.checkbox,
        {backgroundColor: value ? '#feb101' : 'transparent'},
      ]}>
      {value && <Text style={styles.checkmark}>✓</Text>}
    </View>
    <Text style={{color: 'black'}}>{label}</Text>
  </TouchableOpacity>
);

const DepositeDetail = () => {
  const [bikeCondition, setBikeCondition] = useState('good');
  const [refreshing, setRefreshing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [Kilometer, setKilometer] = useState('');
  const route = useRoute();
    

  useEffect(() => {
    if (route.params && route.params.bid) {
      setBikeid(route.params.bid);
    } else {
      setBikeid('');
    }
  }, [route.params, BikeData, navigation]);
  const [Bikeid, setBikeid] = useState('');
  const phone = useSelector(state => state.counter.phone);
  const [Bikeiderror, setBikeiderror] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const navigation = useNavigation();
  const [kilometerError, setKilometerError] = useState('');
  const [imageError, setImageError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState(null);
  const [BikeData, setBikeData] = useState([]);
  const focusHandler = () => {
    console.log("API called");
    fetch(`https://${DOMAIN}/Bike/Bikeidsreturn/`, {
      method: 'GET',
    })
      .then(response => response.json())
      .then(responseJson => {
        setBikeData(responseJson);
        if (responseJson.length > 0) {
          setValue(responseJson[0].value);
        }
      })
      .catch(error => {
        console.log(error);
      });
  };
  
  useFocusEffect(
    React.useCallback(() => {
      focusHandler();
    }, [])
  );
  
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    focusHandler(); 
    setRefreshing(false); 
  }, []);


  const handleBikeConditionChange = condition => {
    setBikeCondition(condition);
  };


  const handleImageSelect2 = async () => {
    try {
      const result = await opencamera(phoneNumber, '_Adhar_Card.jpg');
      if (result) {
        setSelectedImage(result.path);
        setImageError('');
      } else {
        Alert.alert('Error', 'Failed to capture Image');
      }
    } catch (error) {
      console.log('Camera error: ', error);
      Alert.alert('Error', 'An unexpected error occurred while capturing the image.');
    }
  };

  // Function to create FormData object
  const createImageFormData = (imagePath, phoneNumber) => {
    const formData = new FormData();
    formData.append('Condition', bikeCondition);
    formData.append('KM_Now', Kilometer);

    formData.append('Bikeid', Bikeid);
    formData.append('staff', phone);

    if (imagePath) {
      formData.append('Pic_after', {
        uri: imagePath,
        type: 'image/jpeg',
        name: `${phoneNumber}_After_Pic.jpg`,
      });
    }

    return formData;
  };

  const handleDeposit = () => {
    if (!validateFields()) {
      Alert.alert('Error', 'Fill All The Fields Again');
      setSelectedImage(null);
      return;
    }

    setIsLoading(true);

    const formData = createImageFormData(selectedImage, phoneNumber);

    fetch(`https://${DOMAIN}/Bike/deassign_bike/`, {
      method: 'PUT',
      body: formData,
    })
      .then(response => response.json())
      .then(responseJson => {
        setIsLoading(false);
        if (responseJson.message) {
          Alert.alert('Done', `${responseJson.message}`, [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('Offers', {
                  b_id: Bikeid,
                  bikeCondition: bikeCondition,
                  car:false
                });
              },
            },
          ]);
        } else {
          handleResponseErrors(responseJson);
        }
      })
      .catch(error => {
        console.error('Submission error: ', error);
        Alert.alert('Error', 'Failed to submit, please try again.');
        setIsLoading(false);
      });
  };

  const handleResponseErrors = (responseJson) => {
    if (responseJson.Error) {
      Alert.alert('Error', responseJson.Error);
    } else if (responseJson.Error2) {
      Alert.alert('Error', responseJson.Error2);
      setSelectedImage(null);
    } else {
      Alert.alert('Error', 'An unknown error occurred.');
    }
  };

  const validateFields = () => {
    let isValid = true;

    if (!Kilometer) {
      setKilometerError('Please enter kilometers');
      isValid = false;
    } else {
      setKilometerError('');
    }

    if (!selectedImage) {
      setImageError('Please upload bike reading image');
      isValid = false;
    } else {
      setImageError('');
    }

    if (!Bikeid) {
      setBikeiderror('Please choose BikeID');
      isValid = false;
    } else {
      setBikeiderror('');
    }

    return isValid;
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.Vcontainer}>
        <LottieView
          style={styles.video}
          source={require('../assets/DepositeBikeAnime.json')} // Replace with your animation file path
          autoPlay
          loop
        />
      </View>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={styles.Scroll}>
        <View style={styles.content}>
          <View style={styles.inputContainer}>
            {Bikeiderror ? (
              <Text style={styles.errorText}>{Bikeiderror}</Text>
            ) : null}
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              data={BikeData}
              itemTextStyle={{color: '#000'}}
              maxHeight={300}
              labelField="label"
              placeholder="Select Bike ID"
              placeholderTextColor="#000"
              onChange={item => {
                const selectedBikeId = item.label.split(' -   ')[0];
                setBikeid(selectedBikeId);
              }}
            />
          </View>
          <View style={styles.checkboxContainer}>
            <Text style={styles.label}>Bike Condition:</Text>
            <Checkbox
              label="Good"
              value={bikeCondition === 'good'}
              onPress={() => handleBikeConditionChange('good')}
            />
            <Checkbox
              label="Not Good"
              value={bikeCondition === 'notgood'}
              onPress={() => handleBikeConditionChange('notgood')}
            />
          </View>
          {imageError ? (
            <Text style={styles.errorText}>{imageError}</Text>
          ) : null}
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={handleImageSelect2}>
            <Text style={styles.cameraButtonText}>
              Upload Bike Reading Image
            </Text>
          </TouchableOpacity>

          {selectedImage && (
            <View style={styles.imageContainer}>
              <Image source={{uri: selectedImage}} style={styles.image} />
              <Text style={{color: 'green', marginTop: 5, fontWeight: '600'}}>
                Bike Reading Deposit time
              </Text>
            </View>
          )}

          <Text style={styles.label}>Kilometers Now:</Text>
          <TextInput
            style={styles.input2}
            placeholder="Enter Kilometer"
            placeholderTextColor="#000"
            value={Kilometer}
            onChangeText={text => setKilometer(text)}
            keyboardType="numeric"
          />
          {kilometerError ? (
            <Text style={styles.errorText}>{kilometerError}</Text>
          ) : null}

          <TouchableOpacity
            style={styles.depositButton}
            onPress={handleDeposit}>
            <Text style={styles.depositButtonText}>Submit</Text>
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
  dropdown: {
    height: 50,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    marginBottom: 10,
    marginTop: 12,
    color: '#000',
    paddingLeft: 7,
    paddingRight: 15,
  },

  placeholderStyle: {
    fontSize: 15,
    color: '#000',
  },
  selectedTextStyle: {
    fontSize: 15,
    color: '#000',
  },
  Vcontainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
    width: 200,
    marginTop: 170,
    marginBottom: 30,
  },
  video: {
    width: 250,
    height: 230,
  },
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#feb101',
  },
  Scroll: {
    marginTop: 30,
    width: '100%',
  },
  content: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    width: '100%',
    shadowColor: 'black',
    shadowOpacity: 0.5,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 6,
    marginTop: 120,
    justifyContent: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 5,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkmark: {
    color: '#000',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    color: 'black',
  },
  cameraButton: {
    backgroundColor: '#feb101',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  cameraButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 300,
    height: 190,
    borderRadius: 5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    color: '#000',
    borderRadius: 5,
    paddingHorizontal: 10,
    height: 40,
    marginTop: 20,
  },
  input2: {
    borderWidth: 1,
    borderColor: 'gray',
    marginBottom: 15,
    color: '#000',
    borderRadius: 5,
    paddingHorizontal: 10,
    height: 40,
    marginTop: 20,
  },
  depositButton: {
    backgroundColor: '#feb101',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 25,
  },
  depositButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
});

export default DepositeDetail;
