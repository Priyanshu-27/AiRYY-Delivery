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
  const [refreshing, setRefreshing] = useState(false);

  const [Bikeid, setBikeid] = useState('');
  const [Bikeiderror, setBikeiderror] = useState('');

  const [Amount, setAmount] = useState(0);
  const [battery_free, setbattery_free] = useState(0);
  const phone = useSelector(state => state.counter.phone);
  const route = useRoute();

  const [AdvancePay, setAdvancePay] = useState('NO');
  const [AdvancePayUPI, setAdvancePayUPI] = useState(0);
  const [AdvancePayCash, setAdvancePayCash] = useState(0);

  const [ReturnAmount, setReturnAmount] = useState('NO');
  const [ReturnAmountUPI, setReturnAmountUPI] = useState(0);
  const [ReturnAmountCash, setReturnAmountCash] = useState(0);
  const [batteryList, setBatteryList] = useState([
    {label: 'Select Battery', value: 'Select Battery'},
  ]);
  const [selectedBattery, setSelectedBattery] = useState('Select Battery');

  const [BikeList, setBikeList] = useState([
    {label: 'Select Bike', value: 'Select Bike'},
  ]);
  const [selectedBike, setSelectedBike] = useState('Select Bike');

  const {phoneNumber} = route.params;
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
    getBatteries();
    getBikes();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const getBatteries = async () => {
    try {
      const response = await fetch(`http://${DOMAIN}/Delivery/batteries/`);
      const data = await response.json();

      if (data && Array.isArray(data)) {
        setBatteryList([
          {label: 'Select Battery', value: 'Select Battery'}, // Default option
          ...data.map(battery => ({
            label: `${battery.battery_id} - ${battery.charging_percentage}%`, // Displaying both battery ID and charging percentage
            value: battery.battery_id, // Using battery_id as value
          })),
        ]);
      } else {
        console.error('Unexpected data format:', data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getBikes = async () => {
    try {
      const response = await fetch(
        `http://${DOMAIN}/Delivery_Bikes/delivery-bikes/`,
      );
      const data = await response.json();

      if (data && Array.isArray(data)) {
        setBikeList([
          {label: 'Select bike', value: 'Select bike'}, // Default option
          ...data.map(bike => ({
            label: `${bike.license_plate} - ${bike.type}`, // Displaying both bike ID and charging percentage
            value: bike.license_plate, // Using bike_id as value
          })),
        ]);
      } else {
        console.error('Unexpected data format:', data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = () => {
    // if (!validateFields()) {
    //   Alert.alert('Error', 'Please fill all the required fields.');
    //   return;
    // }
    if(Number(AdvancePayUPI) + Number(AdvancePayCash) < Amount*(7)){
      return Alert.alert('Error', `Minimum Advance amount is ${Amount*(7)}`);
    }
    if (Number(ReturnAmountUPI) + Number(ReturnAmountCash) < 500) {
      return Alert.alert('Error', 'Minimum deposit amount is 500');
    } 
    let timeInHours = parseFloat(TimeTaken);
    if (TimeTakenUnit === 'days') {
      timeInHours *= 24;
    } else if (TimeTakenUnit === 'months') {
      timeInHours *= 24 * 30; // Assuming 1 month = 30 days
    }

    const data = {
      phone: phoneNumber,
      license_plate: selectedBike,
      duration: timeInHours,
      rate_per_duration: Amount,
      battery_id: selectedBattery,
      mode_of_rental: TimeTakenUnit,
      battery_free: battery_free,
    };

    if (AdvancePay == 'AdvancePay') {
      data.advance_amount = Number(AdvancePayUPI) + Number(AdvancePayCash);
      data.advance_upi_amount = AdvancePayUPI;
      data.advance_cash_amount = AdvancePayCash;
      data.mode_of_payment = ['upi', 'cash', 'mix'].includes(
        AdvancePayUPI > 0 && AdvancePayCash > 0
          ? 'mix'
          : AdvancePayCash > 0
          ? 'cash'
          : 'upi',
      )
        ? AdvancePayUPI > 0 && AdvancePayCash > 0
          ? 'mix'
          : AdvancePayCash > 0
          ? 'cash'
          : 'upi'
        : 'upi';
    } else {
      data.booking_status = 'Start';
      data.total_amount = 0;
      data.advance_upi_amount = 0;
      data.advance_cash_amount = 0;
      data.mode_of_payment = ['upi', 'cash', 'mix'].includes(
        AdvancePayUPI > 0 && AdvancePayCash > 0
          ? 'mix'
          : AdvancePayCash > 0
          ? 'cash'
          : 'upi',
      )
        ? AdvancePayUPI > 0 && AdvancePayCash > 0
          ? 'mix'
          : AdvancePayCash > 0
          ? 'cash'
          : 'upi'
        : 'upi';
    }

    if (ReturnAmount == 'ReturnAmount') {
      (data.date = new Date().toISOString().split('T')[0]),
        (data.reason = 'Have to return'),
        (data.mode_of_deposit = ['upi', 'cash', 'mix'].includes(
          ReturnAmountUPI > 0 && ReturnAmountCash > 0
            ? 'mix'
            : ReturnAmountCash > 0
            ? 'cash'
            : 'upi',
        )
          ? ReturnAmountUPI > 0 && ReturnAmountCash > 0
            ? 'mix'
            : ReturnAmountCash > 0
            ? 'cash'
            : 'upi'
          : 'upi'),
        (data.deposit_amount =
          Number(ReturnAmountUPI) + Number(ReturnAmountCash));
      data.upi_amount = ReturnAmountUPI;
      data.cash_amount = ReturnAmountCash;
    }
    console.log(data);
    setIsLoading(true);

    fetch(`http://${DOMAIN}/Delivery/delivery-rental/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(response => {
        console.log(response);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(responseJson => {
        if (responseJson.rental) {
          Alert.alert('Done', `Give this Bike ${responseJson.rental}`, [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to the 'DrawerNavigator' screen after the user presses "OK"
                navigation.navigate('DrawerNavigator');
              },
            },
          ]);
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
  };

  const validateFields = () => {
    let isValid = true;

    if (!TimeTaken) {
      setTimeTakenerror(`Please enter expected ${TimeTakenUnit}`);

      isValid = false;
    } else {
      setTimeTakenerror('');
    }

    if (!Bikeid) {
      setBikeiderror('Please choose BikeID');
      isValid = false;
    } else {
      setBikeiderror('');
    }

    return isValid;
  };

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
      getBatteries();
      getBikes();
    });

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
            search
            searchField="label"
            searchPlaceholderTextColor="#000"
            inputSearchStyle={{color: '#000'}}
            searchQuery={Bikeid}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            data={BikeList}
            itemTextStyle={{color: '#000'}}
            placeholderTextColor="#000"
            labelField="label"
            valueField="value"
            placeholder="Select Bike"
            searchPlaceholder="Search..."
            onChange={item => {
              setSelectedBike(item.value);
            }}
          />
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            searchField="label"
            searchPlaceholderTextColor="#000"
            inputSearchStyle={{color: '#000'}}
            search
            data={batteryList}
            itemTextStyle={{color: '#000'}}
            placeholderTextColor="#000"
            labelField="label"
            valueField="value"
            placeholder="Select Battery"
            searchPlaceholder="Search..."
            onChange={item => {
              setSelectedBattery(item.value);
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
          <TextInput
            placeholder={`Enter Amount`}
            value={Amount}
            placeholderTextColor="#000"
            onChangeText={text => setAmount(text)}
            keyboardType="numeric"
            style={styles.inputKm}
          />
          <TextInput
            placeholder={`Enter Free Batterys`}
            value={battery_free}
            placeholderTextColor="#000"
            onChangeText={text => setbattery_free(text)}
            keyboardType="numeric"
            style={styles.inputKm}
          />

          <Checkbox
            text="Advance Payment"
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
            text="Deposite Payment"
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
