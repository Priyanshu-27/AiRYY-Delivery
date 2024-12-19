import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

const UserBill = ({ route, navigation }) => {
  const { rental_id } = route.params;
  const [rentalData, setRentalData] = useState(null);

  const [upiAmount, setUpiAmount] = useState(0);
  const [cashAmount, setCashAmount] = useState(0);
  const [chequeAmount, setChequeAmount] = useState(0);
  const [paymentDetails, setpaymentDetails] = useState([]);
  const [depositeDetails, setdepositeDetails] = useState([]);

  const [dueAmount, setDueAmount] = useState(rentalData?.payments[0]?.due_amount || 0);


  
  const fetchRentalData = async () => {
    try {
      const response = await fetch(`http://${DOMAIN}/Delivery/lastPayment/?rental_id=${rental_id}`);
      const data = await response.json();
      setRentalData(data);
      setdepositeDetails(data.deposit);
      setpaymentDetails(data.payments);
      setDueAmount(data.payments[data.payments.length - 1].due_amount);
    } catch (error) {
      console.error('Error fetching rental data:', error);
    }
  };

  useEffect(() => {
    fetchRentalData();
  }, []);
  const handleConfirmPayment = () => {
    const totalPayment = parseInt(upiAmount) + parseInt(cashAmount) + parseInt(chequeAmount);
    if (totalPayment !== dueAmount) {
      Alert.alert("Payment Error", "The total payment does not match the due amount.");
      return;
    }

    // Prepare payload for API submission
    const paymentPayload = {
      rental_id: rentalData.id,
      upi_amount: upiAmount,
      cash_amount: cashAmount,
      cheque_amount: chequeAmount,
    };

    // Submit payment to the backend
    // Replace with your API call
    console.log("Payment submitted: ", paymentPayload);
    Alert.alert("Payment Successful", "The payment has been recorded.");
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Bill Details</Text>

      {/* Rental Details */}
      <Text style={styles.label}>Rental Date: {new Date(rentalData.rental_date).toLocaleDateString()}</Text>
      <Text style={styles.label}>Due Amount: ₹{dueAmount}</Text>
      <Text style={styles.label}>Bike: {rentalData.bike}</Text>
      
      {/* Deposit Details */}
      <Text style={styles.header}>Deposit Details</Text>
      {rentalData.deposits.map((deposit, index) => (
        <Text key={index} style={styles.label}>
          {deposit.date}: ₹{deposit.deposit_amount} ({deposit.reason})
        </Text>
      ))}

      {/* Payment Input */}
      <Text style={styles.header}>Payment Breakdown</Text>
      <TextInput
        style={styles.input}
        placeholder="UPI Amount"
        keyboardType="numeric"
        onChangeText={(text) => setUpiAmount(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Cash Amount"
        keyboardType="numeric"
        onChangeText={(text) => setCashAmount(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Cheque Amount"
        keyboardType="numeric"
        onChangeText={(text) => setChequeAmount(text)}
      />

      {/* Confirm Button */}
      <Button title="Confirm Payment" onPress={handleConfirmPayment} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    marginVertical: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
    fontSize: 16,
  },
});

export default UserBill;
