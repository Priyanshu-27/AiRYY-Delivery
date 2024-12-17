import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {Dropdown} from 'react-native-element-dropdown';
import {DOMAIN} from '@env';

const BikeAvailability = ({navigation}) => {
  const [AssignedDetails, setAssignedDetails] = useState([]);
  const [AssignedBikesNumber, setAssignedBikesNumber] = useState(0);
  const [FilteredassignedDetails, setFilteredassignedDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDropDown, setopenDropDown] = useState(false);
  const [batteryList, setBatteryList] = useState([
    {label: 'Select Battery', value: 'Select Battery'},
  ]);
  const [selectedBattery, setSelectedBattery] = useState('Select Battery');

  const getBatteries = async () => {
    try {
      const response = await fetch(`https://${DOMAIN}/Delivery/batteries/`);
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

  const [refreshing, setRefreshing] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    navigation.setOptions({
      headerShown: !isSearchActive,
      title: isSearchActive ? 'Search Bikes' : 'Bike Availability',

      headerTitleStyle: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 18,
      },
      headerStyle: {
        backgroundColor: '#fff',
      },
      headerLeft: () =>
        isSearchActive ? (
          <TouchableOpacity onPress={() => setIsSearchActive(false)}>
            <Ionicons name="arrow-back-outline" size={24} style={styles.icon} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
            <Ionicons
              name="menu"
              size={24}
              style={[
                styles.icon,
                {marginRight: 20, marginLeft: 12, color: '#facc15'},
              ]}
            />
          </TouchableOpacity>
        ),
      headerRight: () =>
        !isSearchActive && (
          <TouchableOpacity onPress={() => setIsSearchActive(true)}>
            <Ionicons name="search-outline" size={24} style={styles.icon} />
          </TouchableOpacity>
        ),
    });
  }, [isSearchActive, navigation]);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `https://${DOMAIN}/Delivery/delivery-bikeInfo/`,
      );
      const data = await response.json();

      if (Array.isArray(data.rentals)) {
        setAssignedDetails(data.rentals);
        setFilteredassignedDetails(data.rentals);

        setAssignedBikesNumber(data.rentals.length);
      } else {
        console.error('Unexpected data format:', data);
        setAssignedDetails([]);
        setFilteredassignedDetails([]);
      }
      setIsLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = query => {
    setSearchQuery(query);

    if (!query) {
      setFilteredassignedDetails(AssignedDetails);
    } else {
      const filtered = AssignedDetails.filter(rentalItem => {
        const rentalData = rentalItem.rental;
        const batteryData = rentalItem.battery;

        // Extract nested data
        const userData = rentalData?.user?.user;
        const bikeData = rentalData?.bike;

        // Perform case-insensitive matching for relevant fields
        return (
          // Search in user details
          (userData &&
            (userData.uid.toLowerCase().includes(query.toLowerCase()) ||
              userData.name.toLowerCase().includes(query.toLowerCase()) ||
              userData.phone.toString().includes(query))) ||
          // Search in bike details
          (bikeData &&
            (bikeData.license_plate
              .toLowerCase()
              .includes(query.toLowerCase()) ||
              bikeData.type.toLowerCase().includes(query.toLowerCase()))) ||
          // Search in rental details

          rentalData.rental_date.toLowerCase().includes(query.toLowerCase()) ||
          rentalData.duration.toString().includes(query) ||
          rentalData.battery_free.toString().includes(query) ||
          // Search in battery details
          (batteryData &&
            batteryData.battery_id
              .toLowerCase()
              .includes(query.toLowerCase())) ||
          // Search in swapped_at field
          rentalItem.swapped_at.toLowerCase().includes(query.toLowerCase())
        );
      });

      setFilteredassignedDetails(filtered);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setIsLoading(true);
    fetchData();
  }, []);

  const formatDate = dateString => {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}-${month}-${year}`;
  };

  const convertHoursToDaysHours = totalHours => {
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    const parts = [];
    if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
    return parts.length > 0 ? parts.join(', ') : 'No time';
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Fetching Data...</Text>
      </View>
    );
  }
  const handleswap = (phone, license_plate, battery) => {
    console.log(phone, license_plate, battery);
    // Make API request for battery swap
    fetch(`https://${DOMAIN}/Delivery/delivery-battery-swap/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: phone,
        license_plate: license_plate,
        battery_id: battery,
      }),
    })
      .then(response => {
        if (!response.ok) {
          // Handle HTTP error codes (e.g., 404, 500) with custom error messages
          return response.json().then(data => {
            throw new Error(data?.error || `HTTP error! Status: ${response.status}`);
          });
        }
        return response.json();  // Only parse JSON if the response is successful
      })
      .then(data => {
        if (data?.message) {
          alert(data.message);  // Show success message from response
        } else {
          alert('Battery swap was successful but no message was returned.');
        }
      })
      .catch(error => {
        console.error('Error swapping battery:', error);
        alert(`An error occurred while swapping the battery: ${error.message}`);
      });
  
    setTimeout(() => {
      onRefresh();  
    }, 2000);
  };
  

  return (
    <View style={styles.container}>
      {isSearchActive && (
        <View style={styles.searchContainer}>
          <TouchableOpacity onPress={() => setIsSearchActive(false)}>
            <Ionicons name="arrow-back-outline" size={24} style={styles.icon} />
          </TouchableOpacity>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      )}

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.contentContainer}>
        <View style={styles.summary}>
          <View style={[styles.summaryCard, styles.availableCard]}>
            <View
              style={{
                backgroundColor: '#f0fdf4',
                paddingHorizontal: 8,
                paddingVertical: 8,
                borderRadius: 12,
                position: 'absolute',
                top: 0,
                left: 0,
                alignItems: 'center',
              }}>
              <Text style={styles.summaryText}>Available Bikes.</Text>
            </View>

            <View
              style={{
                flexDirection: 'Column',
                justifyContent: 'space-evenly',
                marginTop: 20,
              }}>
              <Text>{15 - AssignedBikesNumber}</Text>
            </View>
          </View>
          <View style={[styles.summaryCard, styles.AssignedDetailsd]}>
            <View
              style={{
                backgroundColor: '#fef2f2',
                paddingHorizontal: 8,
                paddingVertical: 8,
                borderRadius: 12,
                position: 'absolute',
                top: 0,
                left: 0,
                alignItems: 'center',
              }}>
              <Text style={styles.summaryText}>Assigned Bikes.</Text>
            </View>

            <View
              style={{
                flexDirection: 'Column',
                justifyContent: 'space-evenly',
                marginTop: 20,
              }}>
              <Text>{AssignedBikesNumber}</Text>
            </View>
          </View>
        </View>
        <View style={{margin: 10}}>
          <Text style={styles.sectionTitle}>Assigned Bikes</Text>
          {FilteredassignedDetails.map((rentalItem, index) => {
            const rental = rentalItem.rental;
            const user = rental?.user?.user;
            const bike = rental?.bike;
            const battery = rentalItem.battery;

            return (
              <View key={index} style={styles.card}>
                <View
                  style={{
                    backgroundColor: '#fefce8',
                    paddingHorizontal: 10,
                    paddingVertical: 10,
                  }}>
                  {/* User Details */}
                  <InfoRow
                    iconName="person-circle-outline"
                    iconLib="Ionicons"
                    label="Name"
                    value={user?.name}
                  />
                  <InfoRow
                    iconName="call-outline"
                    iconLib="Ionicons"
                    label="Phone"
                    value={user?.phone}
                  />
                  <InfoRow
                    iconName="mail-open-outline"
                    iconLib="Ionicons"
                    label="Secondary Phone"
                    value={rental?.user?.secondary_phone}
                  />

                  {/* Bike Details */}
                  <InfoRow
                    iconName="motorcycle"
                    iconLib="FontAwesome"
                    label="License Plate"
                    value={bike?.license_plate}
                  />
                  <InfoRow
                    iconName="flag-checkered"
                    iconLib="FontAwesome"
                    label="Bike Type"
                    value={bike?.type}
                  />

                  {/* Rental Details */}
                  <InfoRow
                    iconName="time-outline"
                    iconLib="Ionicons"
                    label="Rental Time"
                    value={new Date(rental?.rental_date).toLocaleTimeString(
                      'en-US',
                      {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      },
                    )}
                  />
                  <InfoRow
                    iconName="battery-charging-outline"
                    iconLib="Ionicons"
                    label="Battery ID"
                    value={battery?.battery_id}
                  />
                  <InfoRow
                    iconName="hourglass-outline"
                    iconLib="Ionicons"
                    label="Duration"
                    value={`${rental?.duration || 'N/A'} hours`}
                  />
                  <InfoRow
                    iconName="swap-horizontal-outline"
                    iconLib="Ionicons"
                    label="Last Swapped"
                    value={new Date(rentalItem?.swapped_at).toLocaleString()}
                  />
                  <InfoRow
                    iconName="swap-horizontal-outline"
                    iconLib="Ionicons"
                    label="Battery Swap Left"
                    value={rental?.battery_free}
                  />
                </View>
                <View
                  className="flex flex-row justify-between"
                  style={{marginTop: 20}}>
                  <TouchableOpacity
                    className="p-5"
                    style={[styles.button, {marginRight: 10}]} // Adding margin to the right for spacing
                    onPress={() => navigation.navigate('DepositeDetail')}>
                    <Text style={styles.buttonText}>Go to Deposite</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="p-5"
                    style={[styles.button, {marginLeft: 10}]} // Adding margin to the left for spacing
                    onPress={() => {
                      getBatteries(); // Fetch batteries
                      setopenDropDown(prev => !prev); // Toggle the dropdown state
                    }}>
                    <Text style={styles.buttonText}>Swap A Battery</Text>
                  </TouchableOpacity>
                </View>
                {openDropDown && (
                  <View>
                    <Dropdown
                      style={styles.dropdown}
                      placeholderStyle={styles.placeholderStyle}
                      selectedTextStyle={styles.selectedTextStyle}
                      data={batteryList}
                      search
                      searchField='label'
                      itemTextStyle={{color: '#000'}}
                      placeholderTextColor="#000"
                      labelField="label"
                      valueField="value"
                      placeholder="Select Battery"
                      searchPlaceholder="Search..."
                      onChange={item => {
                        setopenDropDown(false);
                        setSelectedBattery(item.value);
                        handleswap(
                          user?.phone,
                          bike?.license_plate,
                          item.value,
                        );
                      }}
                    />
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const InfoRow = ({iconName, iconLib, label, value, style}) => {
  const IconComponent = iconLib === 'Ionicons' ? Ionicons : FontAwesome;

  return (
    <View style={[styles.rowContainer, style]}>
      <View style={styles.iconLabelContainer}>
        <IconComponent name={iconName} size={18} style={styles.iconStyle} />
        <Text style={styles.labelText}>{label}</Text>
      </View>
      <Text style={styles.valueText}>{value || 'N/A'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    marginLeft: 8,
    marginRigth: 8,
  },

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 8,
    margin: 25,
    borderRadius: 30,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 40,
  },
  summaryCard: {
    flex: 1,
    // alignItems: 'center',
    // justifyContent: 'center',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 5,
  },
  availableCard: {
    backgroundColor: '#d4edda',
  },
  AssignedDetailsd: {
    backgroundColor: '#f8d7da',
  },
  summaryText: {
    fontSize: 12,
    color: '#000',
    fontWeight: 'bold',
    marginBottom: 0,
    letterSpacing: 1,
  },
  count: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#000',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
  iconLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  iconStyle: {
    color: '#000',
    marginRight: 5,
  },
  labelText: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  valueText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'right',
    flexShrink: 1,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#000',
    paddingVertical: 10,
    borderRadius: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#facc15',
    fontSize: 16,
    fontWeight: 'bold',
  },
  icon: {
    marginRight: 20,
    color: '#eab308',
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
});

export default BikeAvailability;
