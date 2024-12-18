import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  ToastAndroid,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import {Dropdown} from 'react-native-element-dropdown';
import {useNavigation} from '@react-navigation/native';

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
  const [Bikeid, setBikeid] = useState('');
  const [BikeidError, setBikeidError] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState(null);
  const [BikeData, setBikeData] = useState([]);
  const navigation = useNavigation();

  const focusHandler = () => {
    console.log('Fetching bike data...');
    fetch(
      'http://airyy-backend-three.vercel.app/Delivery_Bikes/delivery-bikes-list/',
      {
        method: 'GET',
      },
    )
      .then(response => response.json())
      .then(responseJson => {
        const formattedData = responseJson.map(item => ({
          label: item.license_plate,
          value: item.license_plate,
        }));
        setBikeData(formattedData);
        if (formattedData.length > 0) {
          setValue(formattedData[0].value);
        }
      })
      .catch(error => {
        console.error('Error fetching bike data:', error);
      });
  };

  useFocusEffect(
    React.useCallback(() => {
      focusHandler();
    }, []),
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    focusHandler();
    setRefreshing(false);
  }, []);

  const handleBikeConditionChange = condition => {
    setBikeCondition(condition);
  };

  const validateFields = () => {
    let valid = true;

    if (!Bikeid) {
      setBikeidError('Please choose a Bike ID');
      valid = false;
    } else {
      setBikeidError('');
    }

    if (!phoneNumber) {
      setPhoneError('Please enter your phone number');
      valid = false;
    } else if (!/^[0-9]{10}$/.test(phoneNumber)) {
      setPhoneError('Invalid phone number');
      valid = false;
    } else {
      setPhoneError('');
    }

    return valid;
  };

  const showToast = message => {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  };

  const handleDeposit = () => {
    if (!validateFields()) {
      Alert.alert('Error', 'Please fill all the fields');
      return;
    }

    setIsLoading(true);

    const bodyData = {
      phone: phoneNumber,
      license_plate: Bikeid,
      condition: bikeCondition,
    };

    console.log(bodyData);

    fetch(
      'http://airyy-backend-three.vercel.app/Delivery/delivery-rental/deposite/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      },
    )
      .then(response => response.json())
      .then(responseJson => {
        setIsLoading(false);
        if (responseJson.message) {
          showToast('Bike successfully deposited!');
          navigation.navigate('Offers', {
            b_id: Bikeid,
            bikeCondition: bikeCondition,
            car: false,
          });
        } else {
          Alert.alert(
            'Error',
            responseJson.Error || 'An unknown error occurred.',
          );
        }
      })
      .catch(error => {
        console.error('Error during submission:', error);
        Alert.alert('Error', 'Failed to submit, please try again.');
        setIsLoading(false);
      });
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
          <View style={{marginBottom:10 , marginTop:10}}>
            {BikeidError ? (
              <Text style={styles.errorText}>{BikeidError}</Text>
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
                setBikeid(item.value);
              }}
            />
          </View>
          <View style={{marginBottom:20 ,}}>
            <TextInput
              style={[styles.input, phoneError && {borderColor: 'red'}]}
              placeholder="Enter Phone Number"
              placeholderTextColor="#000"
              keyboardType="number-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
            {phoneError ? (
              <Text style={styles.errorText}>{phoneError}</Text>
            ) : null}
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
    flex: 1,
  },
  content: {
    backgroundColor: '#fff',
    // paddingVertical: 80,
    paddingBottom:80 ,
    paddingHorizontal: 20,
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
  input: {
    height: 50,
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 15,
    marginBottom: 10,
    marginTop: 12,
    color: '#000',
  },
});

export default DepositeDetail;
