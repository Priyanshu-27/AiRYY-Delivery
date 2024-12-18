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
  Image
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Dropdown} from 'react-native-element-dropdown';
import {useNavigation} from '@react-navigation/native';
import {DOMAIN} from '@env';

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
      `https://${DOMAIN}/Delivery/delivery-rental-list/`,
      {
        method: 'GET',
      },
    )
      .then(response => response.json())
      .then(responseJson => {
        const formattedData = responseJson.map(item => ({
          label: item.bike.license_plate + ' - ' + item.bike.type,
          value: item.bike.license_plate,
          phone:  item.user.user.phone
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
    setPhoneNumber("")
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
      `https://${DOMAIN}/Delivery/delivery-rental/deposite/`,
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
          navigation.navigate('UserBill', {
            b_id: Bikeid,
            bikeCondition: bikeCondition,
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
    <LinearGradient colors={['#FFF', '#facc15']} style={styles.container}>
      <View style={styles.Vcontainer}>
        <LottieView
          style={styles.video}
          source={require('../assets/DepositeBikeAnime.json')} 
          autoPlay
          loop
        />
      </View>
      <View
        style={{
          
          position:'absolute' ,
          top:350 ,
          backgroundColor: '#FFF',
          paddingHorizontal: 30,
          paddingVertical: 10,
          borderRadius: 20,
        }}>
        <Text style={{color: '#000', fontWeight: '700' , letterSpacing:1}}>
          Delivery Boy Bike Deposite.
        </Text>
      </View>
     
      <View style={styles.content}>
        <View style={{marginBottom: 10, marginTop: 10}}>
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
        <View style={{marginBottom: 20}}>
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
        <TouchableOpacity style={styles.depositButton} onPress={handleDeposit}>
          <Text style={styles.depositButtonText}>Submit</Text>
        </TouchableOpacity>
        {isLoading && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#000000" />
          </View>
        )}
      </View>
      {/* </ScrollView> */}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  loader: {
    justifyContent: 'center',
    alignItems: 'end',
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
   
    justifyContent: 'center',
    alignItems: 'center',
    height: '20%',
    width: 200,
  },

  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: '#feb101',
  },
  Scroll: {
    marginTop: 30,
    width: '100%',
    height:'100%',
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
    height:400 , 
    shadowColor: 'black',
    shadowOpacity: 0.5,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 6,
    marginTop: 180,
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
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 25,
  },
  depositButtonText: {
    color: '#FFF',
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
