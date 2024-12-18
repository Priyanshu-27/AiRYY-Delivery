import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Dimensions,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {DOMAIN} from '@env';
import {useFocusEffect} from '@react-navigation/native';
import {Dropdown} from 'react-native-element-dropdown';
import DatePicker from 'react-native-date-picker';

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
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const MiddlePayment = () => {
  const [phone, setPhone] = useState('');
  const [Bikeid, setBikeid] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [BikeData, setBikeData] = useState([]);
  const [amount, setAmount] = useState(0);
  const [UPIMethod, setUPIMethod] = useState('QR Code');
  const [upi, setupi] = useState(false);
  const [upiChecked, setUpiChecked] = useState(false);
  const [cash, setcash] = useState(false);
  const [cashChecked, setCashChecked] = useState(false);
  const [cheque, setcheque] = useState(false);
  const [chequeChecked, setChequeChecked] = useState(false);
  const [mixChecked, setmixChecked] = useState(false);

  const resetPaymentMethods = () => {
    setUpiChecked(false);
    setCashChecked(false);
    setChequeChecked(false);
    setmixChecked(false);
    setupi(''); 
    setcash(''); 
    setcheque('');

  };

  const handleCheckboxPress = type => {
    resetPaymentMethods();
    switch (type) {
      case 'UPI':
        setUpiChecked(true);
        break;
      case 'Cash':
        setCashChecked(true);
        break;
      case 'Cheque':
        setChequeChecked(true);
        break;
      case 'mix':
        setmixChecked(true);
        break;
      default:
        break;
    }
  };
  const [selectedDate, setSelectedDate] = useState(new Date());
  const handleSubmit = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;
    const day = selectedDate.getDate();
    const formattedToday = `${year}-${month}-${day}`;
    const data = {
      phone: phone,
      license_plate: Bikeid,
      Amount: amount,
      UPIMethod: UPIMethod,
      upi: upi || 0,
      cash: cash || 0,
      cheque: cheque || 0,
      date: formattedToday,
      status: 'Paid in Full',
    };
    console.log(data);
  };
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    focusHandler();
    setPhone('');
    setRefreshing(false);
  }, []);
  const focusHandler = () => {
    console.log('Fetching bike data...');
    fetch(`https://${DOMAIN}/Delivery/delivery-rental-list/`, {
      method: 'GET',
    })
      .then(response => response.json())
      .then(responseJson => {
        const formattedData = responseJson.map(item => ({
          label: item.bike.license_plate + ' - ' + item.bike.type,
          value: item.bike.license_plate,
          phone: item.user.user.phone,
        }));

        setBikeData(formattedData);
      })
      .catch(error => {
        console.error('Error fetching bike data:', error);
      });
  };

  useEffect(() => {
    const numericUPI = Number(upi) || 0;
    const numericCash = Number(cash) || 0;

    setAmount(numericUPI + numericCash);
  }, [upi, cash]);

  useFocusEffect(
    React.useCallback(() => {
      focusHandler();
    }, []),
  );

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={styles.Scroll}>
        {/* Phone Input */}
        <Text style={styles.label}>Phone:</Text>

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
            setPhone(item.phone);
          }}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter Phone Number"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        {/* Date Input */}
        <Text style={styles.label}>Select Date</Text>
        <View style={styles.DatePickerContainer}>
          <DatePicker
            mode="date"
            date={selectedDate}
            onDateChange={setSelectedDate}
            androidVariant="nativeAndroid"
            textColor="#000"
          />
        </View>

        {/* Total Amount Input */}

        {/* Payment Methods */}
        <Text style={styles.label}>Payment Methods:</Text>
        <View style={styles.row}>
          {/* UPI */}

          <Checkbox
            text="UPI"
            value={upiChecked}
            onPress={() => handleCheckboxPress('UPI')}
          />

          <Checkbox
            text="Cash"
            value={cashChecked}
            onPress={() => handleCheckboxPress('Cash')}
          />

          <Checkbox
            text="Cheque"
            value={chequeChecked}
            onPress={() => handleCheckboxPress('Cheque')}
          />

          <Checkbox
            text="UPI + Cash"
            value={mixChecked}
            onPress={() => handleCheckboxPress('mix')}
          />
        </View>
        <View>
          {upiChecked && (
            <View className="mt-10 mb-[-30]" style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter UPI Amount"
                keyboardType="numeric"
                value={upi}
                onChangeText={text => {
                  setupi(text);
                }}
              />
            </View>
          )}
          {cashChecked && (
            <View className="mt-10 mb-[-30]" style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter Cash Amount"
                keyboardType="numeric"
                value={cash}
                onChangeText={text => {
                  setcash(text);
                }}
              />
            </View>
          )}
          {chequeChecked && (
            <View className="mt-10 mb-[-30]" style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter Cheque Amount"
                keyboardType="numeric"
                value={cheque}
                onChangeText={text => {
                  setcheque(text);
                }}
              />
            </View>
          )}
          {mixChecked && (
            <View className="mt-10 mb-[-30]" style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter UPI Amount"
                keyboardType="numeric"
                value={upi}
                onChangeText={text => {
                  setupi(text);
                }}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter Cash Amount"
                keyboardType="numeric"
                value={cash}
                onChangeText={text => {
                  setcash(text);
                }}
              />
            </View>
          )}
        </View>

        <Text className="mt-10" style={styles.label}>
          Total Amount:
        </Text>
        <TextInput
          className="mt-1"
          style={styles.input}
          placeholder="Enter Total Amount"
          keyboardType="numeric"
          value={amount.toString()}
          onChangeText={(text)=>{setAmount(text)}}
        />
        {/* Submit Button */}
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default MiddlePayment;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
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
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000',
  },
  label2: {
    fontSize: 16,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
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
  button: {
    backgroundColor: '#f1b700',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  DatePickerContainer: {
    marginLeft: '8%',
    borderRadius: 50,
  },
});
