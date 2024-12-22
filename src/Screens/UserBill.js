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


const UserBill = ({route, navigation}) => {
  const {rental_id} = route.params;
  
  const [rentalData, setRentalData] = useState(null);

  const [UPIMethod, setUPIMethod] = useState('QR Code');
  const [upi, setupi] = useState(null);
  const [upiChecked, setUpiChecked] = useState(false);
  const [cash, setcash] = useState(null);
  const [cashChecked, setCashChecked] = useState(false);
  const [cheque, setcheque] = useState(null);
  const [chequeChecked, setChequeChecked] = useState(false);
  const [mixChecked, setmixChecked] = useState(null);
  const [amount, setAmount] = useState(0);
  const [rentalDate , setRentalDate] = useState(" ") ; 
  const [depositeDate , setdepositeDate] = useState(" ") ; 
  const [numberofpaymentsAmount, setnumberofpaymentsAmount] = useState(0);
  const [paymentDetails, setpaymentDetails] = useState([]);
  const [lastPaymentDetails, setlastPaymentDetails] = useState({});
  const [depositeDetails, setdepositeDetails] = useState([]);
  const [userDetails, setuserDetails] = useState([]);
  const [bikeDetails, setbikeDetails] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const formatDate = dateString => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

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
  const [dueAmount, setDueAmount] = useState(0);

  const fetchRentalData = async () => {
    setRefreshing(true);
    try {
      const response = await fetch(
        `http://${DOMAIN}/Delivery/lastPayment/?rental_id=${rental_id}`,
      );

    
      const data = await response.json();
     
      setRentalDate(data.rental_date);
      setdepositeDate(data.return_date);
      setRentalData(data);
      setdepositeDetails(data.deposits);
      setpaymentDetails(data.payments);
      setlastPaymentDetails(data.payments[data.payments.length - 1] || {});
      setuserDetails(data.user.user);
      setbikeDetails(data.bike);
      setnumberofpaymentsAmount(data.payments.length);
      setDueAmount(data.payments[data.payments.length - 1]?.due_amount || 0);
    } catch (error) {
      console.error('Error fetching rental data:', error);
    } finally {
      setRefreshing(false);
    }
  };
  useEffect(() => {
    fetchRentalData();
  }, []);
  useEffect(() => {
    const numericUPI = Number(upi) || 0;
    const numericCash = Number(cash) || 0;

    setAmount(numericUPI + numericCash);
  }, [upi, cash]);

  const handleConfirmPayment = async () => {
    if (amount !== dueAmount) {
      Alert.alert(
        'Payment Error',
        'The total payment does not match the due amount.',
      );
      return;
    }

    const paymentPayload = {
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
      booking_status: 'Last Paid',
      rental_id: rental_id,
      date: new Date().toISOString().split('T')[0],
      reason: 'Paid in Full',
    };

    console.log(paymentPayload);

    // try {
    //   const response = await fetch(
    //     `http://${DOMAIN}/Delivery/lastPayment/`,
    //     {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json',
    //       },
    //       body: JSON.stringify(paymentPayload),
    //     },
    //   );

    //   if (response.ok) {
    //     const responseData = await response.json();
    //     Alert.alert('Payment Successful', 'The payment has been recorded.');
    //     navigation.navigate('DrawerNavigator');
    //   } else {
    //     const errorData = await response.json();
    //     Alert.alert(
    //       'Payment Failed',
    //       errorData.message || 'An error occurred during payment submission.',
    //     );
    //   }
    // } catch (error) {
    //   console.error('Error submitting payment:', error);
    //   Alert.alert('Payment Failed', 'An error occurred. Please try again.');
    // }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchRentalData} />
      }>
      <View
        style={{
          backgroundColor: '#FFF',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
          marginBottom: 20,
          borderRadius: 20,
        }}>
        <Text style={styles.header}>Bill Details</Text>
      </View>

      {/* User Details Section */}
      <View
        style={{
          backgroundColor: '#FFF',
          paddingLeft: 20,
          padding: 10,
          borderRadius: 20,
          marginBottom: 10,
        }}>
        <Text
          style={{
            position: 'absolute',
            bottom: 7,
            top: 18,
            right: 6,
            left: 28,
            color: '#000',
            fontWeight: 'bold',
            textDecorationLine: 'underline',
          }}>
          User Detail.
        </Text>
        <View
          style={{
            flexDirection: 'row',
            marginTop: 50,
            alignItems: 'center',
            marginBottom: 20,
          }}>
          <View
            style={{
              position: 'absolute',
              paddingVertical: 10,
              paddingHorizontal: 0,
              borderRadius: 50,
              backgroundColor: '#fefce8',
              height: 40,
              width: 40,
              borderWidth: 1,
              borderColor: '#454545',
            }}>
            <Text
              style={{
                textAlign: 'center',
                fontWeight: 'bold',
                color: '#000',
              }}>
              {userDetails?.name?.charAt(0) || 'U'}
            </Text>
          </View>

          <View style={{flexDirection: 'column', marginLeft: 50}}>
            <Text style={{fontWeight: 'bold', color: '#000'}}>
              {userDetails?.name || 'Loading...'}
            </Text>
            <Text style={{color: '#454545', fontSize: 12}}>
              {userDetails?.phone || 'N/A'}
            </Text>
          </View>
        </View>
      </View>

      {/* Bike Detail  */}

      <View
        style={{
          backgroundColor: '#FFF',

          // padding: 50,
          paddingVertical: 40,
          paddingHorizontal: 20,
          borderRadius: 20,
          marginBottom: 10,
        }}>
        <View>
          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
            <Text
              style={{
                color: '#000',
                textDecorationLine: 'underline',
                fontWeight: 'bold',
              }}>
              Bike Detail .
            </Text>
            <View
              style={{
                marginTop: 30,
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <Text style={{color: '#454545', fontSize: 12, fontWeight: '500'}}>
                Type: {bikeDetails.type}
              </Text>
              <Text style={{color: '#454545', fontSize: 12, fontWeight: '500'}}>
                Licence Plate: {bikeDetails.license_plate}
              </Text>
            </View>
          </View>

          <View>
            <View
              style={{
                position: 'absolute',
                bottom: 40,
                right: 0,
                backgroundColor: '#fefce8',
                paddingHorizontal: 15,
                paddingVertical: 10,
                borderRadius: 30,
              }}>
              <Text style={{color: '#454545', fontSize: 12, fontWeight: '500'}}>
                Free Batteries : 40
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 30,
          }}>
          <Text style={{color: '#454545', fontSize: 13, fontWeight: '500'}}>
            Rental: {formatDate(rentalDate)}
          </Text>
          <Text style={{color: '#454545', fontSize: 13, fontWeight: '500'}}>
            Return: {formatDate(depositeDate)}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Deposite Amount Details</Text>
        {depositeDetails?.map((deposit, index) => (
          <View key={index} style={{}}>
            <Text
              style={{
                position: 'absolute',
                bottom: 35,
                left: 200,
                color: '#454545',
                fontSize: 12,
              }}>
              {formatDate(deposit.date)}
            </Text>
            <View>
              <Text style={{color: 'green', fontWeight: '600'}}>
                ₹{deposit.deposit_amount}
              </Text>
            </View>
          </View>
        ))}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Advance Amount Details</Text>
        {paymentDetails?.[0] && (
          <View key={0} style={{}}>
            <Text
              style={{
                position: 'absolute',
                bottom: 35,
                left: 200,
                color: '#454545',
                fontSize: 12,
              }}>
              {formatDate(paymentDetails[0].date)}
            </Text>
            <View>
              <Text style={{color: 'green', fontWeight: '600'}}>
                ₹{paymentDetails[0].advance_amount}
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Due Amount Details</Text>
        {paymentDetails?.[0] && (
          <View key={0} style={{}}>
            <Text
              style={{
                position: 'absolute',
                bottom: 35,
                left: 200,
                color: '#454545',
                fontSize: 12,
              }}>
              {formatDate(paymentDetails[0].date)}
            </Text>
            <View>
              <Text style={{color: 'green', fontWeight: '600'}}>
                ₹{paymentDetails[0].due_amount}
              </Text>
            </View>
          </View>
        )}
      </View>

      <View
        style={styles.section}
        className="placeholder:text-black text-black">
        {/* Payment Methods */}
        <Text style={styles.sectionHeader}>Payment Methods:</Text>
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

      <View className="mb-24 mt-10 rounded-[20%]">
        <TouchableOpacity style={styles.button} onPress={handleConfirmPayment}>
          <Text style={styles.buttonText}>Confirm Payment</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 40,
    backgroundColor: '#fefce8',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',

    textAlign: 'center',
    color: '#333',
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    // elevation: 3,
  },
  sectionHeader: {
    color: '#000',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    marginBottom: 10,

   
    paddingBottom: 5,
  },
  label: {
    fontSize: 16,
    marginVertical: 5,
    color: '#555',
  },
  value: {
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: '#f8f8f8',
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

export default UserBill;
