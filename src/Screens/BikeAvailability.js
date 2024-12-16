import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {DOMAIN} from '@env';
import {TouchableOpacity} from 'react-native-gesture-handler';
const BikeAvailability = ({navigation}) => {
  const [assignedBikes, setAssignedBikes] = useState([]);
  const [FilteredassignedBikes, setFilteredassignedBikes] = useState([]);
  const [availableBikes, setAvailableBikes] = useState([]);
  const [electricalBikesCount, setElectricalBikesCount] = useState(0);
  const [petrolBikesCount, setPetrolBikesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoading2, setIsLoading2] = useState(false);
  const [clickedRentalId, setClickedRentalId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [stopTimes, setStopTimes] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = query => {
    setSearchQuery(query);

    if (query === '') {
      setFilteredassignedBikes(assignedBikes);
    } else {
      const filtered = assignedBikes.filter(bike => {
        const bikeData = bike.bike; // Access the bike data
        const userData = bike.user; // Access the user data

        return (
          bikeData.b_id.toString().includes(query) ||
          bikeData.license_plate.toLowerCase().includes(query.toLowerCase()) ||
          (userData &&
            (userData.name.toLowerCase().includes(query.toLowerCase()) ||
              userData.phone.toString().includes(query)))
        );
      });

      setFilteredassignedBikes(filtered);
    }
  };

  useEffect(() => {
    // Conditionally show/hide the header based on isSearchActive state
    if (isSearchActive) {
      navigation.setOptions({
        headerShown: false,
      });
    } else {
      navigation.setOptions({
        headerShown: true,
        headerLeft: () =>
          isSearchActive ? (
            // Back icon to close search and restore the header
            <TouchableOpacity onPress={() => setIsSearchActive(false)}>
              <Ionicons
                name="arrow-back-outline"
                size={24}
                style={styles.icon}
              />
            </TouchableOpacity>
          ) : (
            // Default drawer toggle button
            <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
              <Ionicons name="menu" size={24} style={styles.icon} />
            </TouchableOpacity>
          ),
        headerRight: () =>
          !isSearchActive && (
            // Search button (visible only when search is inactive)
            <TouchableOpacity onPress={() => setIsSearchActive(true)}>
              <Ionicons name="search-outline" size={24} style={styles.icon} />
            </TouchableOpacity>
          ),
      });
    }
  }, [isSearchActive, navigation]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setIsLoading(true);
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [navigation]);

  const fetchData = async () => {
    try {
      const response = await fetch(`https://${DOMAIN}/Bike/BikeInfo/`);

      const response2 = await fetch(`https://${DOMAIN}/Bike/BikeInfo2/`);

      const response3 = await fetch(`https://${DOMAIN}/Bike/BikeInfo3/`);

      const data = await response.json();
      const data2 = await response2.json();
      const data3 = await response3.json();

      // Filter assigned bikes and available bikes from the data
      const assigned = data2.rental.filter(
        rental => rental.return_date === null,
      );
      const available = data.bike.filter(bike => !bike.is_assigned);

      setAssignedBikes(assigned);
      setFilteredassignedBikes(assigned);
      setAvailableBikes(available);

      const totalElectricalBikes = data.bike.filter(
        bike => bike.Electrical,
      ).length;
      const totalPetrolBikes = data.bike.filter(
        bike => !bike.Electrical,
      ).length;
      // Calculate available electrical and petrol bikes count
      const electricalCount =
        totalElectricalBikes - available.filter(bike => bike.Electrical).length;
      const petrolCount =
        totalPetrolBikes - available.filter(bike => !bike.Electrical).length;
      setElectricalBikesCount(electricalCount);
      setPetrolBikesCount(petrolCount);

      const rentalEventTypes = data3.rental_event_types;

      for (const key in rentalEventTypes) {
        if (rentalEventTypes.hasOwnProperty(key) && !isNaN(parseInt(key))) {
          const rental_id = parseInt(key);
          let newValue = 'Time Started'; // Default value if the key is initially blank
          if (rentalEventTypes[rental_id].length > 0) {
            // If the rental_id has a non-empty array in rentalEventTypes
            if (rentalEventTypes[rental_id][0] === 'start') {
              newValue = 'Time Stoped';
            }
          }
          setStopTimes(prevStopTimes => ({
            ...prevStopTimes,
            [rental_id]: newValue,
          }));
        }
      }
      setIsLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text
          style={{
            color: '#000',
            fontWeight: '600',
            marginTop: 20,
            fontSize: 15,
          }}>
          Fetching Data
        </Text>
      </View>
    );
  }
  const handleStartTimer = async rental_id => {
    setIsLoading2(true);
    try {
      const response = await fetch(
        `https://${DOMAIN}/Bike/start_timer/${rental_id}/`,
        {
          method: 'POST',
        },
      );
      const responseJson = await response.json();
      console.log(responseJson);
      // Update the stop time for this rental ID
      if (responseJson.Error) {
        Alert.alert('Error', responseJson.Error);
        setIsLoading2(false);
      } else {
        if (responseJson !== 'Error') {
          setStopTimes(prevStopTimes => ({
            ...prevStopTimes,
            [rental_id]: 'Time Stoped',
          }));
          setIsLoading2(false);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading2(false);
    }
    setClickedRentalId(rental_id);
  };

  const handleStopTimer = async rental_id => {
    setIsLoading2(true);
    try {
      const response = await fetch(
        `https://${DOMAIN}/Bike/stop_timer/${rental_id}/`,
        {
          method: 'POST',
        },
      );

      const responseJson = await response.json();
      console.log(responseJson);
      // Update the stop time for this rental ID

      if (responseJson.Error) {
        Alert.alert('Error', responseJson.Error);
        setIsLoading2(false);
      } else {
        if (responseJson !== 'Error') {
          setStopTimes(prevStopTimes => ({
            ...prevStopTimes,
            [rental_id]: 'Time Started',
          }));
          Alert.alert('Done', responseJson.message);
          setIsLoading2(false);
        }
      }
    } catch (error) {
      setIsLoading2(false);
      console.error('Error fetching data:', error);
    }
    setClickedRentalId(rental_id);
  };

  const formatDate = dateString => {
    // Convert the string to a JavaScript Date object
    const date = new Date(dateString);

    // Extract day, month, and year
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getUTCFullYear();

    return `${day}-${month}-${year}`;
  };
  function convertHoursToDaysHours(totalHours) {
    const days = Math.floor(totalHours / 24); // Calculate full days
    const hours = totalHours % 24; // Calculate remaining hours

    // Build the result dynamically based on non-zero values
    const parts = [];
    if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);

    // Join the parts with a comma, or return "No time" if both are zero
    return parts.length > 0 ? parts.join(', ') : 'No time';
  }
  return (
    <View style={styles.container}>
      {isSearchActive ? (
        // Search bar at the top of the screen
        <View style={styles.searchContainer}>
          <TouchableOpacity onPress={() => setIsSearchActive(false)}>
            <Ionicons name="arrow-back-outline" size={24} style={styles.icon} />
          </TouchableOpacity>

          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={handleSearch}
            onSubmitEditing={() => {
              setIsSearchActive(false); // Close the search input
              setFilteredassignedBikes(assignedBikes); // Reset the filtered list to all bikes
              setSearchQuery(''); // Clear the search query
            }}
            returnKeyType="done"
            autoFocus
          />
        </View>
      ) : // Default header area with title and search icon
      null}
      <View style={styles.row}>
        <View
          style={{
            flex: 1,
            backgroundColor: '#feb101',
            marginTop: 20,

            padding: 20,
          }}>
          <Text style={styles.heading1}>Available Bikes</Text>
          <View>
            <Text style={styles.info}>
              Electrical Bikes:{' '}
              <Text style={{color: '#000'}}>
                {availableBikes.filter(bike => bike.Electrical).length}
              </Text>
            </Text>
            <Text style={styles.info}>
              Petrol Bikes:{' '}
              <Text style={{color: '#000'}}>
                {availableBikes.filter(bike => !bike.Electrical).length}
              </Text>
            </Text>
          </View>
        </View>
        <View
          style={{
            borderLeftWidth: 1,
            borderLeftColor: 'black',

            marginVertical: 15,

            paddingHorizontal: 20,
          }}
        />

        <View
          style={{
            flex: 1,

            backgroundColor: '#feb101',

            marginTop: 40,
            marginRight: 20,
            padding: 0,
          }}>
          <Text style={styles.heading2}>Assigned Bikes</Text>

          <Text style={styles.info}>
            Electrical Bikes:{' '}
            <Text style={{color: '#000'}}>{electricalBikesCount}</Text>{' '}
          </Text>
          <Text style={styles.info}>
            Petrol Bikes:{' '}
            <Text style={{color: '#000'}}>{petrolBikesCount}</Text>
          </Text>
        </View>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View style={styles.rentalDetailsContainer}>
          <View style={{alignItems: 'center', marginTop: 5, marginBottom: 30}}>
            <Text style={{fontWeight: 'bold', fontSize: 18, color: '#000'}}>
              Rental Bike's Details
            </Text>
          </View>
          {FilteredassignedBikes.map(rental => (
            <View key={rental.id} style={styles.rentalItem}>
              {/* <Text style={styles.rentalText}>{rental.id}</Text> */}

              <Text style={styles.rentalText}>
                Name: <Text style={{color: 'green'}}> {rental.user.name}</Text>
              </Text>
              {/* <Text style={styles.rentalText}>
                UID: <Text style={{color: 'green'}}> {rental.user.uid} </Text>
              </Text> */}
              <Text style={styles.rentalText}>
                Number:
                <Text style={{color: 'green'}}> {rental.user.phone} </Text>
              </Text>
              <Text style={styles.rentalText}>
                Rental Time:
                <Text style={{color: 'green'}}>
                  {new Date(rental.rental_date).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </Text>
              </Text>

              <Text style={styles.rentalText}>
                Return Time:
                <Text style={{color: 'green'}}>
                  {' '}
                  {convertHoursToDaysHours(rental.TimeThought)}{' '}
                </Text>
              </Text>
              <Text style={styles.rentalText}>
                License Plate:{' '}
                <Text style={{color: 'green'}}>{rental.bike.b_id}</Text>
              </Text>
              <Text style={styles.rentalText}>
                Date:
                <Text style={{color: 'green'}}>
                  {' '}
                  {formatDate(rental.rental_date)}{' '}
                </Text>
              </Text>
              {rental.bike.Electrical ? (
                // <View style={{flexDirection:'column',width:'100%',justifyContent:'space-between'}}>
                <View style={styles.buttonContainer}>
                  <Text style={styles.bikeItem}>Bike: {rental.bike.b_id}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      const currentStopTime =
                        stopTimes[rental.id] || 'Time Stoped';
                      if (currentStopTime === 'Time Started') {
                        handleStartTimer(rental.id);
                      } else if (currentStopTime === 'Time Stoped') {
                        handleStopTimer(rental.id);
                      }
                      setClickedRentalId(rental.id);
                    }}
                    style={[
                      styles.startButton,
                      {
                        backgroundColor:
                          stopTimes[rental.id] === 'Time Started'
                            ? 'green'
                            : 'red',
                      },
                    ]}>
                    {isLoading2 && clickedRentalId === rental.id ? (
                      <View style={styles.loading2}>
                        <ActivityIndicator size="small" color="#000" />
                      </View>
                    ) : (
                      <Text style={styles.buttonText}>
                        {stopTimes[rental.id]}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.bikeItem}>Bike: {rental.bike.b_id}</Text>
              )}
              <View style={{width: '100%'}}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('DepositeDetail', {
                      bid: rental.bike.b_id,
                    })
                  }
                  style={[
                    styles.startButton,
                    {
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '100%',
                      fontWeight: 'bold',
                      backgroundColor:
                        stopTimes[rental.id] === 'Time Started'
                          ? 'green'
                          : 'green',
                    },
                  ]}>
                  <Text style={{...styles.buttonText}}>Deposite</Text>
                </TouchableOpacity>
              </View>
              <Text
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: 'black',
                }}></Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: '#feb101',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingVertical: 3,
    borderRadius: 25,
    backgroundColor: '#fff',
    elevation: 1,
    marginTop: 20,
    marginLeft: 20,
    marginRight: 20,
  },
  searchInput: {
    flex: 1,

    borderRadius: 8,
    paddingHorizontal: 10,
    color: '#000',
    marginLeft: 10,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
  },
  // column: {
  //   flex: 1,
  //   backgroundColor: '#feb101',
  //   borderBottomLeftRadius: 20,
  //   borderBottomLeftRadius: 20,
  //   padding: 16,
  // },
  heading1: {
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    fontWeight: 'bold',

    color: 'green',
    backgroundColor: '#fff',
    marginTop: -10,
    marginBottom: 20,
    padding: 8,
    borderRadius: 9,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 6,
  },
  heading2: {
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    fontWeight: 'bold',

    marginTop: -10,
    marginBottom: 20,
    color: 'red',
    backgroundColor: '#fff',
    borderRadius: 9,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 6,
  },
  bikeItem: {
    backgroundColor: '#feb101',
    padding: 8,
    color: '#000',
    width: '40%',
    fontWeight: 'bold',

    borderRadius: 4,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  info: {
    marginBottom: 5,
    color: '#000',
    fontWeight: 'bold',
  },
  rentalDetailsContainer: {
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: 16,
    backgroundColor: '#FFF', // Light yellow color
    // backgroundColor: '#feb101', // Light yellow color
    // Light yellow color
    padding: 20,
  },
  rentalItem: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginBottom: 35,
  },
  rentalText: {
    fontSize: 18,
    color: '#000',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading2: {
    flex: 1,
    paddingHorizontal: 33,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  startButton: {
    backgroundColor: 'green',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  stopButton: {
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  icon: {
    color: '#000',
    marginHorizontal: 15,
  },
});

export default BikeAvailability;
