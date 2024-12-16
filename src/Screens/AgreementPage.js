import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
// import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {useRoute} from '@react-navigation/core';
import {DOMAIN} from '@env';

const Checkbox = ({label, value, onPress}) => {
  return (
    <TouchableOpacity style={styles.checkboxContainer} onPress={onPress}>
      <View
        style={[
          styles.checkbox,
          {backgroundColor: value ? '#feb101' : '#FFF'},
        ]}>
        {value && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={{color: '#000'}}>{label}</Text>
    </TouchableOpacity>
  );
};

const AgreementPage = () => {
  const [userData, setUserData] = useState({});
  const [agreed, setAgreed] = useState(false);
  const route = useRoute();
  const {phoneNumber,ALTphoneNumber, EV, userName,car} = route.params;
  const navigation = useNavigation();

  useEffect(() => {
    // Fetch user data from the API
    // axios.get('API_ENDPOINT')
    //   .then(response => {
    //     setUserData(response.data);
    //   })
    //   .catch(error => {
    //     console.error('Error fetching user data:', error);
    //   });
  }, []);

  const [contentHeight, setContentHeight] = useState(0);

  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.agreementText}>
            <Text>
              Agreement With Renters Agreement between{'\n'}AiRYY Rides And
              ________________________________{'\n'}This agreement is made and
              executed between{'\n'}AiRYY Rides which is having a registered
              office at 160/4 Bholaram Ustad Marg, Bhanwar Kuwa, Indore (M.P.)
              and Mr._______________________________________ son/daughter of
              Mr.______________________________ having an address
              at________________________________________________ on ______day of
              _____________2023. _________________________(Name)_agree to have
              agreed by terms which are stated as below in this document.{'\n'}
              Expression Company means AiRYY Rides (First Party) which is stated
              as We in the document{'\n'}and Dealer means
              _________________________________ who is stated as You and is the
              second party. Second Party agrees to the following terms with the
              first party.
            </Text>
            {'\n\n\n'}1. Bike Condition and Maintenance:
            {'\n\n'}1.1. The Owner agrees to provide the bike in good working
            condition and properly serviced to AiRYY Rides for rental purposes.
            {'\n\n'}1.2. The Owner will ensure that the bike is regularly
            maintained and serviced to ensure safe and reliable operation.
            {'\n\n\n'}2. Defects and Repairs:
            {'\n\n'}2.1. The Owner represents that the bike is free from any
            defects at the time of transfer to AiRYY Rides.
            {'\n\n'}2.2. In the event a defect is discovered after rental, the
            Owner shall not hold AiRYY Rides responsible for any repairs or
            associated costs.
            {'\n\n\n'}3. Damages and Theft:
            {'\n\n'}3.1. AiRYY Rides shall not be held responsible for any
            damages sustained to the bike during the rental period, including
            damages caused by customers or third parties.
            {'\n\n'}3.2. In the unfortunate event of theft, the Owner
            acknowledges that AiRYY Rides is not liable for the replacement or
            compensation of the stolen bike.
            {'\n\n\n'}4. Documentation:
            {'\n\n'}4.1. The Owner agrees to provide all necessary and
            up-to-date documentation for the bike, including but not limited to
            registration, insurance, and ownership proofs.
            {'\n\n'}4.2. AiRYY Rides reserves the right to inspect and verify
            the provided documents at any time during the rental period.
            {'\n\n\n'}5. Rental Terms:
            {'\n\n'}5.1. The duration and terms of each rental shall be
            determined by AiRYY Rides and communicated to the Owner prior to
            renting out the bike.
            {'\n\n'}5.2. The Owner shall receive a portion of the rental fees
            collected by AiRYY Rides, as agreed upon by both parties.
            {'\n\n\n'}6. Indemnification:
            {'\n\n'}6.1. The Owner agrees to indemnify and hold AiRYY Rides
            harmless against any claims, liabilities, costs, and expenses
            arising from the use of the rented bike.
            {'\n\n'}6.2. The Owner agrees to provide adequate insurance coverage
            for the bike during the rental period.
            {'\n\n\n'}7. Termination:
            {'\n\n'}7.1. Either party may terminate this Agreement with prior
            written notice.
            {'\n\n'}7.2. Upon termination, the Owner shall retrieve the bike
            from AiRYY Rides' possession within a reasonable timeframe.
            {'\n\n\n'}8. Governing Law:
            {'\n\n'}8.1. This Agreement shall be governed by and construed in
            accordance with the laws of the jurisdiction where AiRYY Rides
            operates.
            {'\n\n\n'}9. Miscellaneous:
            {'\n\n'}9.1. This Agreement constitutes the entire understanding
            between the parties and supersedes any prior agreements or
            understandings.
            {'\n\n'}9.2. Any amendments to this Agreement must be made in
            writing and signed by both parties. By signing below, the parties
            acknowledge their understanding and agreement to the terms and
            conditions outlined in this Agreement.
            {'\n\n'}
            Owner's Name: ______________________ Date: ____________________
            AiRYY Rides Representative: ______________________ Date:
            ____________________ {'\n'}
            [Signatures]
          </Text>
        </View>
      </ScrollView>
      <View style={styles.bottomContainer}>
        <Checkbox
          label="I agree on these Terms and Conditions"
          value={agreed}
          onPress={() => setAgreed(!agreed)}
        />
        {agreed ? (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() =>
              navigation.navigate('Signature', {
                phoneNumber: phoneNumber,
                ALTphoneNumber: ALTphoneNumber,
                EV: EV,
                userName: userName,
                car:car
              })
            }>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.disabledButtonText}>Next</Text>
        )}
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#feb101',
    // backgroundColor: '#000',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  content: {
    backgroundColor: '#FFF',
    // borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    marginBottom: 26,
    lineHeight: 35,
   
    elevation:8 ,
    overflow: 'scroll', // Enable scrolling if content overflows
  },
  agreementText: {
    color: '#000',
    fontSize: 14, // Adjust the font size as needed
    lineHeight: 20,
    fontWeight:'700' ,// Adjust the line height as needed
  },
    bottomContainer: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: 'lightgray',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 18,
    },
    nextButton: {
        backgroundColor: '#feb101',
        borderRadius: 2,
        paddingVertical: 5,
        paddingHorizontal: 12,
    },
nextButtonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
    disabledButtonText: {
        color: 'gray',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        
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
});

export default AgreementPage;








