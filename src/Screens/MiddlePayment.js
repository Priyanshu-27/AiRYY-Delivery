import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Dimensions,
  ScrollView,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {DOMAIN} from '@env';

import {useFocusEffect, useNavigation} from '@react-navigation/native';
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
  const [phone, setPhone] = useState(null);
  const [Bikeid, setBikeid] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [BikeData, setBikeData] = useState([]);
  const [amount, setAmount] = useState(0);
  const navigation = useNavigation();
  const [DueAmount, setDueAmount] = useState(0);
  const [UPIMethod, setUPIMethod] = useState('QR Code');
  const [upi, setupi] = useState(null);
  const [upiChecked, setUpiChecked] = useState(false);
  const [cash, setcash] = useState(null);
  const [cashChecked, setCashChecked] = useState(false);
  const [cheque, setcheque] = useState(null);
  const [chequeChecked, setChequeChecked] = useState(false);
  const [mixChecked, setmixChecked] = useState(null);

  const resetPaymentMethods = () => {
    setUpiChecked(false);
    setCashChecked(false);
    setChequeChecked(false);
    setmixChecked(false);
    setupi(null);
    setcash(null);
    setcheque(null);
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
      total_amount: amount,
      UPIMethod: UPIMethod,
      upi_amount: upi || 0,
      cash_amount: cash || 0,
      cheque_amount: cheque || 0,
      mode_of_payment: mixChecked
        ? 'mix'
        : upiChecked
        ? 'upi'
        : cashChecked
        ? 'cash'
        : 'upi',
      date: formattedToday,
      booking_status: 'Paid',
    };

    fetch(`http://${DOMAIN}/Delivery/middlePayment/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        Alert.alert(
          'Success',
          `Payment added successfully! And Due is ${data.due_amount}`,
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('DrawerNavigator'),
            },
          ],
        );
        onRefresh();
      })
      .catch(error => {
        console.error('Error:', error);
        Alert.alert('Error', 'Something went wrong!');
      });
  };
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    focusHandler();
    setPhone(null);
    setRefreshing(false);
  }, []);
  const focusHandler = () => {
    fetch(`http://${DOMAIN}/Delivery/delivery-rental-list/`, {
      method: 'GET',
    })
      .then(response => response.json())
      .then(responseJson => {
        const formattedData = responseJson.map(item => ({
          label: item.bike.license_plate + ' - ' + item.bike.type,
          value: item.bike.license_plate,
          phone: item.user.user.phone,
          last_due_amount: item.last_due_amount,
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
        showsVerticalScrollIndicator={false} // Hides vertical scrollbar
        showsHorizontalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={styles.Scroll}>
        {/* Date Input */}

        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#FFF',
            padding: 20,
            marginTop: 20,
            borderWidth: 1,
            borderColor: '#f1f5f9',
            borderRadius: 30,
          }}>
          <Text style={styles.label}>Select Date</Text>
          <View className="text-black" style={{color: '#000'}}>
            <DatePicker
              theme="light"
              mode="date"
              dividerColor={'#F7DC6F'}
              date={selectedDate}
              onDateChange={setSelectedDate}
            />
          </View>
        </View>

        {/* Phone Input */}
        <View
          style={{
            backgroundColor: '#FFF',
            padding: 30,
            borderWidth: 1,
            borderColor: '#f1f5f9',
            borderRadius: 30,
          }}>
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
              setDueAmount(item.last_due_amount);
            }}
          />
          <Text className="mt-5" style={styles.label}>
            Phone:
          </Text>
          <TextInput
            className="placeholder:text-black text-black"
            style={styles.input}
            placeholderTextColor={'#000'}
            editable={false}
            placeholder="Phone Number Will Appere Here"
            keyboardType="phone-pad"
            value={
              phone
                ? phone + '   ---   Rs ' + DueAmount + ' Due Amount'
                : 'Phone Number Will Appere Here'
            }
          />
        </View>

        {/* Total Amount Input */}
        <View
          className="placeholder:text-black text-black"
          style={{
            backgroundColor: '#FFF',
            padding: 20,
            marginTop: 20,
            borderWidth: 1,
            borderColor: '#f1f5f9',
            borderRadius: 30,
          }}>
          {/* Payment Methods */}
          <Text style={styles.label}>Payment Methods:</Text>
          <View>
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
              <View
                className="mt-10 mb-[-30] text-black placeholder:text-black"
                style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholderTextColor="#000"
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
                  placeholderTextColor="#000"
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
                  placeholderTextColor="#000"
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
                  placeholderTextColor="#000"
                  placeholder="Enter UPI Amount"
                  keyboardType="numeric"
                  value={upi}
                  onChangeText={text => {
                    setupi(text);
                  }}
                />
                <TextInput
                  style={styles.input}
                  placeholderTextColor="#000"
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
            onChangeText={text => {
              setAmount(text);
            }}
          />
        </View>
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
    padding: 40,
    backgroundColor: '#FFF',
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
    color: 'black',
    placeholderColor: 'black',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
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
    backgroundColor: '#000',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: '#feb101',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
