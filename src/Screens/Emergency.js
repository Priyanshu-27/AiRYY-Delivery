import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  ScrollView,
  Alert ,
} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import {useRoute} from '@react-navigation/core';
import {DOMAIN} from '@env';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const {width} = Dimensions.get('window');

const Emergency = () => {
  const [contacts, setContacts] = useState([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [r_phoneNumber, setr_PhoneNumber] = useState('');
  const [relation, setRelation] = useState('');
  const [otherRelation, setOtherRelation] = useState('');
  const [isFocus, setIsFocus] = useState(false);
  const route = useRoute();
  const navigation = useNavigation();
  const {phoneNumber,ALTphoneNumber, EV, userName,car} = route.params;

  const relationshipData = [
    {label: 'Brother', value: 'Brother'},
    {label: 'Sister', value: 'Sister'},
    {label: 'Father', value: 'Father'},
    {label: 'Mother', value: 'Mother'},
    {label: 'Friend', value: 'Friend'},
    {label: 'Spouse', value: 'Spouse'},
    {label: 'Colleague', value: 'Colleague'},
    {label: 'Cousin', value: 'Cousin'},
    {label: 'Uncle', value: 'Uncle'},
    {label: 'Aunt', value: 'Aunt'},
    {label: 'Grandfather', value: 'Grandfather'},
    {label: 'Grandmother', value: 'Grandmother'},
    {label: 'Neighbor', value: 'Neighbor'},
    {label: 'Mentor', value: 'Mentor'},
    {label: 'Close Relative', value: 'Close Relative'},
    {label: 'Other', value: 'Other'},
  ];

  const addContact = () => {
     if (!firstName || !lastName || !r_phoneNumber || !relation) {
       Alert.alert('Validation Error', 'Please fill all the fields.');
       return;
     }
     if (r_phoneNumber.length !== 10) {
       Alert.alert(
         'Validation Error',
         'Please enter a valid 10-digit phone number.',
       );
       return;
     }
     if (relation === 'Other' && !otherRelation) {
       Alert.alert(
         'Validation Error',
         'Please specify the relationship if "Other" is selected.',
       );
       return;
     }
    const newContact = {
      firstName,
      lastName,
      r_phoneNumber,
      relation: relation === 'Other' ? otherRelation : relation,
    };
    setContacts([...contacts, newContact]);
    setFirstName('');
    setLastName('');
    setr_PhoneNumber('');
    setRelation('');
    setOtherRelation('');
  };

  const removeContact = indexToRemove => {
    const updatedContacts = contacts.filter(
      (_, index) => index !== indexToRemove,
    );
    setContacts(updatedContacts);
  };

  const handleSubmit = async () => {
     if (contacts.length === 0) {
       Alert.alert(
         'Validation Error',
         'Please add at least one contact before submitting.',
       );
       return;
     }
    try {
      for (let contact of contacts) {
        const data = {
          fname: contact.firstName,
          lname: contact.lastName,
          phone: phoneNumber,
          relation: contact.relation,
          r_phone: contact.r_phoneNumber,
        };

        const response = await fetch(`https://${DOMAIN}/Bike/emergency_data/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (response.data?.Done) {
          alert('Add another Contact!');
        }

        if (response.ok) {
          if (car){
            navigation.navigate('CarDetail', {
              phoneNumber: phoneNumber,
              AltphoneNumber: ALTphoneNumber,
            });
          }else{
            navigation.navigate('VehicleDetails', {
              phoneNumber: phoneNumber,
              EV: EV,
              userName: userName,
            });
          }
         
          alert('Contacts updated successfully!');
        }

        if (!response.ok) {
          throw new Error(
            `Error with contact ${contact.firstName}: ${response.statusText}`,
          );
        }
      }
    } catch (error) {
      console.error('Error submitting emergency contacts:', error);
      alert('Failed to update contacts.');
    }
  };

  return (
    <ScrollView
      style={styles.parentContainer}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        margin: 20,
      }}>
      <Text
        style={{
          textAlign: 'center',
          fontWeight: 'bold',
          backgroundColor: '#fde68a',
          color: '#000',
          paddingHorizontal: 10,
          paddingVertical: 40,
          // borderWidth: 1,
          elevation:2,
          borderColor: 'gray',
          borderRadius: 90,
          borderBottomRightRadius: 0,
          fontSize: 20,
           letterSpacing:2,
           textTransform:'capitalize',
          marginBottom: 20,
          // borderRadius: 10,
          // elevation: 1,
        }}>
        Emergency Contact Form
      </Text>
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter first name"
            placeholderTextColor="gray"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter last name"
            placeholderTextColor="gray"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={r_phoneNumber}
            onChangeText={setr_PhoneNumber}
            placeholder="Enter Contact number"
            keyboardType="numeric"
            placeholderTextColor="gray"
          />
        </View>

        <View style={styles.inputContainer}>
          <Dropdown
            style={[
              styles.dropdown,
              isFocus && {borderColor: '#FAF9F6', borderWidth: 3},
            ]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            itemTextStyle={{color: '#000'}}
            data={relationshipData}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isFocus ? 'Select Relationship' : '...'}
            placeholderTextColor="#fff"
            value={relation}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={item => {
              setRelation(item.value);
              setIsFocus(false);
            }}
          />
        </View>

        {relation === 'Other' && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={otherRelation}
              onChangeText={setOtherRelation}
              placeholder="Enter relationship"
              placeholderTextColor="gray"
            />
          </View>
        )}
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <TouchableOpacity style={styles.Addbutton} onPress={addContact}>
            <Text style={styles.buttonText}>Add Contact</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.Submitbutton} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Submit All Contacts</Text>
          </TouchableOpacity>
        </View>

        <View>
          <FlatList
            data={contacts}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item, index}) => (
              <View style={styles.contactContainer}>
                <Text style={styles.contactText}>
                  {item.firstName} {item.lastName} - {item.relation} -{' '}
                  {item.r_phoneNumber}
                </Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeContact(index)}>
                  <Icon name="delete" size={24} color="#ef4444" />
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  parentContainer: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  container: {
    padding: 20,
    paddingVertical: 50,
    marginBottom: 50,
    justifyContent: 'center',
    backgroundColor: '#fff', // Ensure background is set to white
    elevation: 0, // Adjust elevation for more shadow
    borderRadius: 20, // Optional: Add rounded corners to enhance shadow visibility
    shadowColor: '#000', // For iOS shadow

    shadowOffset: {width: 0, height: 2}, // For iOS shadow
    zIndex: 1, // Ensure it's above other components
  },

  title: {
    fontSize: width * 0.05,
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    color: '#000',
    fontSize: width * 0.04,
    // marginBottom: 5,
  },
  input: {
    height: 45,
    borderColor: '#FAF9F6',
   
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    color: '#000',
    backgroundColor: '#fff',
    // marginBottom: 15,
    fontSize: 16,
  },
  dropdown: {
    height: 50,
    borderColor: '#FFD700',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    color: '#000',
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#000',
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#000',
  },
  Addbutton: {
    backgroundColor: '#fde047',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
    elevation: 2,
  },

  Submitbutton: {
    backgroundColor: '#86efac',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    elevation: 2,
  },
  buttonText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
  contactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
    paddingHorizontal: 8,
    padding: 10,
    backgroundColor: '#fef9c3',

    borderRadius: 8,
  },
  contactText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  removeButton: {
    marginLeft: 8,
  },
});

export default Emergency;
