import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useRoute} from '@react-navigation/core';
import {DOMAIN} from '@env';
const screenWidth = Dimensions.get('window').width;
const Checkbox = ({label, value, onPress}) => {
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
      <Text style={{fontWeight: 'bold', color: 'green', fontSize: 13}}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};
const UserBill = () => {
  const [modalVisible, setModalVisible] = useState(true);
  const [billData, setBillData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formattedRentalDate, setformattedRentalDate] = useState(null);
  const [formattedreturnDate, setformattedreturnDate] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();
  const {b_id, bikeCondition} = route.params;

  const [paymentMethod, setPaymentMethod] = useState('');
  const [UPIMethod, setUPIMethod] = useState('');

  const [cash, setcash] = useState(0);
  const [upi, setupi] = useState(0);
  const [Cheque, setCheque] = useState(0);
  const [Tip, setTip] = useState(0);
  const [Discount, setDiscount] = useState(0);
  const [Damage, setDamage] = useState(0);
  const [DamageRemark, setDamageRemark] = useState("");

  const [count, setcount] = useState('');

  const [Deposite, setDeposite] = useState(0);
  const [DepositeMethod, setDepositeMethod] = useState('Keep');

  const [r_cash, setr_cash] = useState(0);
  const [r_upi, setr_upi] = useState(0);
  const [r_Cheque, setr_Cheque] = useState(0);
  const [return_amount, setreturn_amount] = useState(0);

  const [return_amountMethod, setreturn_amountMethod] = useState('');

  useEffect(() => {
    if (billData) {
      let finalAmount =
        billData.Amount -
        billData.AdvancePay -
        Discount +
        parseFloat(Tip) -
        Deposite;
      if (finalAmount < 0) {
        finalAmount = -finalAmount;
        setreturn_amount(finalAmount);
      }
    }
  }, [billData, Discount, Tip]);

  const handlePaymentMethodChange = method => {
    setPaymentMethod(method);
  };
  const handlereturn_AMount_Method = method => {
    setreturn_amountMethod(method);
  };
  const handledepositeChange = method => {
    setDepositeMethod(method);
  };
  const handleupiChange = method => {
    setUPIMethod(method);
  };

  // Function to fetch data from the API
  const fetchData = async () => {
    try {
      const response = await fetch(`https://${DOMAIN}/Bike/Bill/${b_id}/`);
      const data = await response.json();
      const originalTimeZone = 'UTC';

      // Format the date in the original time zone
      const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: originalTimeZone,
      };

      // Create a JavaScript Date object for rental_date
      const rentalDate = new Date(data.Data.rental_date);
      const formattedDate = rentalDate.toLocaleString(undefined, options);

      const returnDate = new Date(data.Data.return_date);

      // Adjust the time zone offset to IST (UTC+5:30)
      const formattedDate2 = returnDate.toLocaleString(undefined, options);
      setBillData(data.Data);
      setcount(data.Count);
      setDeposite(data.return);
      setformattedRentalDate(formattedDate);
      setformattedreturnDate(formattedDate2);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    // Simulate loading for 5 seconds

    const loadingTimeout = setTimeout(() => {
      fetchData();
    }, 5000);

    // Cleanup timeout on unmount
    return () => clearTimeout(loadingTimeout);
  }, [navigation]);

  const calculateAmount = (amount, advance, discount, tip) =>
    parseInt(amount - advance - discount + parseFloat(tip));

  const resetAllPaymentMethods = () => {
    setCheque(0);
    setcash(0);
    setupi(0);
  };

  useEffect(() => {
    if (!billData) return;

    const totalAmount = calculateAmount(
      billData.Amount,
      billData.AdvancePay,
      Discount,
      Tip,
    );

    switch (paymentMethod) {
      case 'cash':
        setcash(totalAmount);
        resetAllPaymentMethods();
        setcash(totalAmount); // Reapply cash as it's the selected payment method
        break;
      case 'upi':
        setupi(totalAmount);
        resetAllPaymentMethods();
        setupi(totalAmount); // Reapply UPI as it's the selected payment method
        break;
      case 'cheque':
        setCheque(totalAmount);
        resetAllPaymentMethods();
        setCheque(totalAmount); // Reapply cheque as it's the selected payment method
        break;
      case 'both':
        resetAllPaymentMethods();
        break;
      default:
        resetAllPaymentMethods();
    }
  }, [paymentMethod, billData, UPIMethod, Tip, Damage, Discount]);

  useEffect(() => {
    if (!Deposite) return;

    const handleReturn = amount => {
      switch (return_amountMethod) {
        case 'cash':
          setr_cash(parseInt(amount));
          setr_Cheque(0);
          setr_upi(0);
          break;
        case 'upi':
          setr_upi(parseInt(amount));
          setr_Cheque(0);
          setr_cash(0);
          break;
        case 'cheque':
          setr_Cheque(parseInt(amount));
          setr_cash(0);
          setr_upi(0);
          break;
        case 'both':
          setr_Cheque(0);
          break;
        default:
          setr_Cheque(0);
      }
    };

    if (DepositeMethod === 'Give') {
      handleReturn(Deposite);
    } else if (DepositeMethod === 'keep') {
      handleReturn(return_amount);
    }
  }, [return_amountMethod, DepositeMethod, Deposite]);

  // Function to close the modal and navigate to the next screen
  const handleCloseModal = async () => {
    try {
      // Validation for paymentMethod and amounts
      if (paymentMethod === 'both') {
        const total =
          billData.Amount - billData.AdvancePay - Discount + parseFloat(Tip);
        if (parseInt(upi) + parseInt(cash) !== total) {
          Alert.alert(
            'Invalid UPI and Cash',
            `Please enter the correct UPI and Cash amounts. Now Total is ${total}`,
            [{text: 'OK'}],
          );
          return;
        }
        if (UPIMethod === '') {
          Alert.alert('Invalid UPI', 'Select the UPI Method First', [
            {text: 'OK'},
          ]);
          return;
        }
      } else if (paymentMethod === 'upi' && UPIMethod === '') {
        Alert.alert('Invalid UPI', 'Select the UPI Method First', [
          {text: 'OK'},
        ]);
        return;
      }

      if (return_amountMethod === 'both') {
        const totalReturn =
          DepositeMethod === 'Give' ? Deposite : return_amount;
        if (parseInt(r_upi) + parseInt(r_cash) !== totalReturn) {
          Alert.alert(
            'Invalid UPI and Cash',
            `Please enter the correct UPI and Cash amounts. Now Total is ${totalReturn}`,
            [{text: 'OK'}],
          );
          return;
        }
      }

      // Prepare data for first API request
      const cashValue = cash ? parseInt(cash, 10) : 0;
      const chequeValue = Cheque ? parseInt(Cheque, 10) : 0;
      const upiValue = upi ? parseInt(upi, 10) : 0;
      
      if (cashValue === 0 && chequeValue === 0 && upiValue === 0) {
        Alert.alert('Error', 'At least one payment method must be greater than zero.');
        return; // or handle the error as appropriate
      }
      
      const data = JSON.stringify({
        Discount: Discount ? parseInt(Discount, 10) : 0,
        cheque: chequeValue,
        Damage: Damage ? parseInt(Damage, 10) : 0,
        DamageRemark: DamageRemark ? DamageRemark : '',
        upi: upiValue,
        cash: cashValue,
        Tip: Tip ? parseInt(Tip, 10) : 0,
        UPIMethod,
      });
      
      // Prepare data for second API request
      const final_return_amount =
        DepositeMethod === 'Give' ? Deposite : return_amount;
      const reson =
        DepositeMethod === 'Give'
          ? `Gave all Deposited for Rent id ${billData.id}`
          : `Cut the Deposited and gave rest for Rent id ${billData.id}`;

      const data2 = JSON.stringify({
        Amount: final_return_amount,
        upi: r_upi ? parseInt(r_upi, 10) : 0,
        cash: r_cash ? parseInt(r_cash, 10) : 0,
        cheque: r_Cheque ? parseInt(r_Cheque, 10) : 0,
        Reason: reson,
      });

      setLoading(true);

      // Execute both API requests in parallel
      console.log(data);
      const [response1, response2] = await Promise.all([
        fetch(`https://${DOMAIN}/Bike/Bill/${b_id}/`, {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: data,
        }),
        fetch(`https://${DOMAIN}/User/we_spent/`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: data2,
        }),
      ]);

      const result1 = await response1.json();
      const result2 = await response2.json();

      if (result1.Error || result2.Error) {
        Alert.alert('Error', result1.Error || result2.Error);
      } else {
        setModalVisible(false);
        navigation.navigate('DrawerNavigator');
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Try again!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      {loading ? (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.loadingIndicator}>
              <ActivityIndicator size="large" color="#000" />
              <Text
                style={{
                  color: '#000',
                  fontWeight: '600',
                  marginTop: 20,
                  fontSize: 15,
                }}>
                Generating Bill
              </Text>
            </View>
          </View>
        </Modal>
      ) : (
        <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.modalContainer}>
              {billData && (
                <View style={styles.billContainer}>
                  <View style={styles.labelContainer}>
                    <Text style={styles.billHeader}>Invoice</Text>
                    <Text style={{color: '#000', fontWeight: '700'}}>
                      User Count - {count}
                    </Text>
                  </View>
                  <View style={styles.labelContainer}>
                    <Text style={styles.Lable}>Name:</Text>
                    <Text style={styles.labelValue}>{billData.user.name}</Text>
                  </View>
                  <View style={styles.labelContainer}>
                    <Text style={styles.Lable}>Phone:</Text>
                    <Text style={styles.labelValue}>{billData.user.phone}</Text>
                  </View>
                  <View style={styles.labelContainer}>
                    <Text style={styles.Lable}>License Plate:</Text>
                    <Text style={styles.labelValue}>{billData.bike.b_id}</Text>
                  </View>

                  <View style={styles.labelContainer}>
                    <Text style={styles.Lable}>KM Before:</Text>
                    <Text style={styles.labelValue}>
                      {billData.bike.KM_Now - billData.KM_For}
                    </Text>
                  </View>
                  <View style={styles.labelContainer}>
                    <Text style={styles.Lable}>KM Now:</Text>
                    <Text style={styles.labelValue}>
                      {billData.bike.KM_Now}
                    </Text>
                  </View>
                  <View style={styles.labelContainer}>
                    <Text style={styles.Lable}>Rental Date:</Text>
                    <Text style={styles.labelValue}>{formattedRentalDate}</Text>
                  </View>
                  <View style={styles.labelContainer}>
                    <Text style={styles.Lable}>Return Date:</Text>
                    <Text style={styles.labelValue}>{formattedreturnDate}</Text>
                  </View>
                  <View style={styles.labelContainer}>
                    <Text style={styles.Lable}>Discount:</Text>
                    <TextInput
                      style={styles.inputDiscount}
                      onChangeText={text => setDiscount(text)}
                      value={Discount}
                      keyboardType="numeric"
                      placeholder="Enter Discount"
                      placeholderTextColor={'red'}
                    />
                  </View>
                  <View style={styles.labelContainer}>
                    <Text style={styles.Lable}>Tip If User Wants:</Text>
                    <TextInput
                      style={styles.inputDiscount}
                      onChangeText={text => setTip(text)}
                      value={Tip.toString()}
                      keyboardType="numeric"
                      placeholder="Enter Tip"
                      placeholderTextColor={'red'}
                    />
                  </View>
                  <Text style={styles.label}>Payment Method:</Text>
                  <View
                    style={[
                      styles.checkboxContainer,
                      {marginTop: 20, marginBottom: 20},
                    ]}>
                    <Checkbox
                      label="Cash"
                      value={paymentMethod === 'cash'}
                      onPress={() => {
                        handlePaymentMethodChange('cash');
                        handleupiChange('');
                      }}
                    />
                    <Checkbox
                      label="UPI"
                      value={paymentMethod === 'upi'}
                      onPress={() => handlePaymentMethodChange('upi')}
                    />
                    <Checkbox
                      label="both"
                      value={paymentMethod === 'both'}
                      onPress={() => handlePaymentMethodChange('both')}
                    />
                    <Checkbox
                      label="cheque"
                      value={paymentMethod === 'cheque'}
                      onPress={() => {
                        handlePaymentMethodChange('cheque');
                        handleupiChange('');
                      }}
                    />
                  </View>

                  {paymentMethod == 'both' ? (
                    <>
                      <View style={styles.checkboxContainer}>
                        <Text style={styles.label}>UPI Type:</Text>
                        <View
                          style={{flexDirection: 'row', paddingHorizontal: 2}}>
                          <Checkbox
                            label="QR Code"
                            value={UPIMethod === 'QR Code'}
                            onPress={() => handleupiChange('QR Code')}
                          />
                          <Checkbox
                            label="Number"
                            value={UPIMethod === 'Number'}
                            onPress={() => handleupiChange('Number')}
                          />
                        </View>
                      </View>

                      <View style={styles.labelContainer}>
                        <Text style={styles.Lable}>Cash:</Text>

                        <TextInput
                          style={styles.inputDiscount}
                          onChangeText={text => {
                            setcash(text);
                          }}
                          value={cash}
                          keyboardType="numeric"
                          placeholder="Enter Cash"
                          placeholderTextColor={'red'}
                        />
                      </View>

                      <View style={styles.labelContainer}>
                        <Text style={styles.Lable}>UPI:</Text>
                        <TextInput
                          style={styles.inputDiscount}
                          onChangeText={text => {
                            setupi(text);
                          }}
                          value={upi}
                          keyboardType="numeric"
                          placeholder="Enter UPI"
                          placeholderTextColor={'red'}
                        />
                      </View>
                    </>
                  ) : null}

                  {paymentMethod == 'upi' ? (
                    <>
                      <View style={styles.checkboxContainer}>
                        <Text style={styles.label}>UPI Type:</Text>
                        <View
                          style={{flexDirection: 'row', paddingHorizontal: 2}}>
                          <Checkbox
                            label="QR Code"
                            value={UPIMethod === 'QR Code'}
                            onPress={() => handleupiChange('QR Code')}
                          />
                          <Checkbox
                            label="Number"
                            value={UPIMethod === 'Number'}
                            onPress={() => handleupiChange('Number')}
                          />
                        </View>
                      </View>
                    </>
                  ) : null}

                  {bikeCondition == 'notgood' ? (
                    <>
                      <View style={styles.labelContainer}>
                        <Text style={styles.Lable}>Damage Pay:</Text>
                        <TextInput
                          style={styles.inputDiscount}
                          onChangeText={text => setDamage(text)}
                          value={Damage}
                          keyboardType="numeric"
                          placeholder="Enter Damage"
                          placeholderTextColor={'red'}
                        />
                      </View>
                      <View style={{...styles.labelContainer,marginTop:-15,marginBottom:30}}>
                        <Text style={styles.Lable}>Damage Remark:</Text>
                        <TextInput
                          style={styles.inputDiscount}
                          onChangeText={text => setDamageRemark(text)}
                          value={DamageRemark}
                          keyboardType="text"
                          placeholder="Enter Remark"
                          placeholderTextColor={'red'}
                        />
                      </View>
                    </>
                  ) : null}

                  <View style={styles.labelContainer}>
                    <Text style={styles.Lable}>Advanced Payed:</Text>
                    <Text style={styles.labelValue}>{billData.AdvancePay}</Text>
                  </View>
                  {Deposite > 0 ? (
                    <>
                      <View style={styles.labelContainer}>
                        <Text style={styles.Lable}>Deposite Amount:</Text>
                        <Text style={styles.labelValue}>{Deposite}</Text>
                        <View
                          style={[
                            styles.checkboxContainer2,
                            {marginTop: 10, marginBottom: 10},
                          ]}>
                          <Checkbox
                            label="Give"
                            value={DepositeMethod === 'Give'}
                            onPress={() => handledepositeChange('Give')}
                          />
                          <Checkbox
                            label="Keep"
                            value={DepositeMethod === 'keep'}
                            onPress={() => {
                              handledepositeChange('keep');
                            }}
                          />
                        </View>
                      </View>

                      {DepositeMethod === 'Give' ? (
                        <>
                          <Text style={styles.label}>
                            Deposite Return Method:
                          </Text>
                          <View
                            style={[
                              styles.checkboxContainer,
                              {marginTop: 20, marginBottom: 20},
                            ]}>
                            <Checkbox
                              label="Cash"
                              value={return_amountMethod === 'cash'}
                              onPress={() => {
                                handlereturn_AMount_Method('cash');
                              }}
                            />
                            <Checkbox
                              label="UPI"
                              value={return_amountMethod === 'upi'}
                              onPress={() => handlereturn_AMount_Method('upi')}
                            />
                            <Checkbox
                              label="both"
                              value={return_amountMethod === 'both'}
                              onPress={() => handlereturn_AMount_Method('both')}
                            />
                            <Checkbox
                              label="cheque"
                              value={return_amountMethod === 'cheque'}
                              onPress={() => {
                                handlereturn_AMount_Method('cheque');
                              }}
                            />
                          </View>

                          {return_amountMethod == 'both' ? (
                            <>
                              <View style={styles.labelContainer}>
                                <Text style={styles.Lable}>Cash:</Text>

                                <TextInput
                                  style={styles.inputDiscount}
                                  onChangeText={text => {
                                    setr_cash(text);
                                  }}
                                  value={r_cash}
                                  keyboardType="numeric"
                                  placeholder="Enter Cash"
                                  placeholderTextColor={'red'}
                                />
                              </View>

                              <View style={styles.labelContainer}>
                                <Text style={styles.Lable}>UPI:</Text>
                                <TextInput
                                  style={styles.inputDiscount}
                                  onChangeText={text => {
                                    setr_upi(text);
                                  }}
                                  value={r_upi}
                                  keyboardType="numeric"
                                  placeholder="Enter UPI"
                                  placeholderTextColor={'red'}
                                />
                              </View>
                            </>
                          ) : null}
                        </>
                      ) : null}

                      {DepositeMethod === 'keep' &&
                      billData.Amount -
                        billData.AdvancePay -
                        Discount +
                        parseFloat(Tip) -
                        Deposite <
                        0 ? (
                        <>
                          <Text style={styles.label}>Rest Return Method:</Text>
                          <View
                            style={[
                              styles.checkboxContainer,
                              {marginTop: 20, marginBottom: 20},
                            ]}>
                            <Checkbox
                              label="Cash"
                              value={return_amountMethod === 'cash'}
                              onPress={() => {
                                handlereturn_AMount_Method('cash');
                              }}
                            />
                            <Checkbox
                              label="UPI"
                              value={return_amountMethod === 'upi'}
                              onPress={() => handlereturn_AMount_Method('upi')}
                            />
                            <Checkbox
                              label="both"
                              value={return_amountMethod === 'both'}
                              onPress={() => handlereturn_AMount_Method('both')}
                            />
                            <Checkbox
                              label="cheque"
                              value={return_amountMethod === 'cheque'}
                              onPress={() => {
                                handlereturn_AMount_Method('cheque');
                              }}
                            />
                          </View>

                          {return_amountMethod == 'both' ? (
                            <>
                              <View style={styles.labelContainer}>
                                <Text style={styles.Lable}>Cash:</Text>

                                <TextInput
                                  style={styles.inputDiscount}
                                  onChangeText={text => {
                                    setr_cash(text);
                                  }}
                                  value={r_cash}
                                  keyboardType="numeric"
                                  placeholder="Enter Cash"
                                  placeholderTextColor={'red'}
                                />
                              </View>

                              <View style={styles.labelContainer}>
                                <Text style={styles.Lable}>UPI:</Text>
                                <TextInput
                                  style={styles.inputDiscount}
                                  onChangeText={text => {
                                    setr_upi(text);
                                  }}
                                  value={r_upi}
                                  keyboardType="numeric"
                                  placeholder="Enter UPI"
                                  placeholderTextColor={'red'}
                                />
                              </View>
                            </>
                          ) : null}
                        </>
                      ) : null}
                    </>
                  ) : null}

                  <View style={styles.labelContainer}>
                    <Text style={styles.Lable}>Exact Amount:</Text>
                    <Text style={styles.labelValue}>{billData.Amount}</Text>
                  </View>

                  <View style={styles.labelContainer}>
                    <Text style={styles.Lable2}>Total Amount:</Text>
                    {DepositeMethod === 'Give' ? (
                      <Text style={styles.labelValue2}>
                        {billData.Amount -
                          billData.AdvancePay -
                          Discount +
                          parseFloat(Tip)}
                      </Text>
                    ) : (
                      <Text style={styles.labelValue2}>
                        {billData.Amount -
                          billData.AdvancePay -
                          Discount +
                          parseFloat(Tip) -
                          Deposite}
                      </Text>
                    )}
                  </View>
                  {/* <Button style={styles.Button} title="Close" onPress={handleCloseModal} /> */}
                  <View
                    style={{justifyContent: 'center', alignItems: 'center'}}>
                    <TouchableOpacity
                      style={styles.CloseButton}
                      onPress={handleCloseModal}>
                      <Text
                        style={{
                          color: '#feb101',
                          fontWeight: '500',
                          fontSize: 18,
                          letterSpacing: 2,
                        }}>
                        Close
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        </Modal>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },

  ModalParentConainer: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'rgba(0, 0, 0, 0.3)',
    backgroundColor: '#feb101',
  },

  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10, // Optional: Add margin between label-value pairs
  },
  Lable: {
    color: '#000',
    fontSize: 14,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  labelValue: {
    color: 'green',
    fontSize: 14,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  Lable2: {
    color: '#000',
    fontSize: 22,
    marginBottom: 10,
    fontWeight: 'bold',
    borderBottomWidth: 1,
  },
  labelValue2: {
    color: 'green',
    fontSize: 22,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  inputDiscount: {
    fontWeight: 'bold',
    justifyContent: 'flex-end',
    fontSize: 14,
    color: 'green',
    textAlign: 'right',
  },
  billContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 50,
    marginTop: 50,
    borderRadius: 10,
    elevation: 5, // Android shadow
    shadowColor: 'black', // iOS shadow
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    width: '90%',
  },
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  checkboxContainer2: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  billHeader: {
    fontSize: screenWidth * 0.03,
    textTransform: 'capitalize',
    borderBottomWidth: 1,
    width: screenWidth * 0.25,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  CloseButton: {
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#feb101',
    backgroundColor: '#000',
    paddingHorizontal: 1,
    paddingVertical: 9,
    borderRadius: 9,
    width: '100%',
  },

  // Add more styles as needed
});
export default UserBill;
