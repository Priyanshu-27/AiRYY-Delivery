import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
  StyleSheet,
  Image,
} from 'react-native';
import MuiIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MuiIcons from 'react-native-vector-icons/MaterialIcons';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';

import {useNavigation} from '@react-navigation/native';
import BikeAvailability from '../Screens/BikeAvailability';
import Home from '../Screens/Home';

import {useDispatch} from 'react-redux';
import {logout} from '../Redux/Counter/counterAction';
import Ionicons from 'react-native-vector-icons/Ionicons';



const DrawerContent = props => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    setIsLoading(true);

    // Perform the logout functionality here
    dispatch(logout(false));

    // Simulating logout delay
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('Login');
      BackHandler.exitApp();
    }, 3000);
  };

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props} style={styles.lables}>
        <View>
          <Image
            source={require('../assets/AiryyLogo.png')} // Replace with your logo path
            style={styles.logo}
          />
          <DrawerItemList {...props} />
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons
              name="log-out-outline"
              size={24}
              color="#000"
              style={styles.logoutIcon}
            />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>
      <View style={styles.copyrightContainer}>
        <Text style={styles.copyrightText}>© 2024 AiRYY Rides</Text>
      </View>
    </View>
  );
};

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: true,
        headerStyle: {backgroundColor: '#feb101'},
        headerTintColor: '#000000',
        drawerLabelStyle: {
          fontWeight: 'bold',
          color: '#000',
          textAlign: 'center',
        },
        drawerActiveTintColor: '#feb101',
        headerTitleStyle: {fontWeight: 'bold'},
      }}
      drawerContent={props => <DrawerContent {...props} />}>
      <Drawer.Screen
        name="Home"
        component={Home}
        options={({navigation}) => ({
          drawerLabel: 'Home',
          title: '',
          drawerIcon: ({focused}) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={focused ? '#feb101' : '#000000'}
            />
          ),
          drawerItemStyle: {textAlign: 'left'}, // Align text to the left
          headerStyle: {
            backgroundColor: '#feb101',
            elevation: 0, // For Android (removes shadow)
            shadowOpacity: 0, // For iOS (removes shadow opacity)
            shadowColor: 'transparent', // For iOS (makes shadow color transparent)
            shadowOffset: {height: 0, width: 0}, // Removes shadow offset
            shadowRadius: 0, // Removes shadow radius
          },
          // headerRight: () => (
          //   <TouchableOpacity
          //     style={styles.rentCarButton}
          //     onPress={() => navigation.navigate('CarDrawerNavigator')}>
          //     <Ionicons name={'car-sport'} size={24} color={'#000'} />
          //   </TouchableOpacity>
          // ),
        })}
      />

      <Drawer.Screen
        name="BikeAvailability"
        component={BikeAvailability}
        options={{
          drawerLabel: 'Bike Availability',
          title: 'Bike Availability',
          drawerIcon: ({focused}) => (
            <MuiIcon
              name={focused ? 'motorbike' : 'motorbike'} // Use your preferred icon names
              size={26}
              color={focused ? '#feb101' : '#000000'}
            />
          ),
          drawerItemStyle: {textAlign: 'left'}, // Align text to the left
        }}
      />

   
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
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
  container: {
    height: '100%',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',

    backgroundColor: '#fff',
  },
  lables: {
    backgroundColor: '#fff',
    paddingTop: 30,
    paddingHorizontal: 16,
    flex: 1,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#feb101',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  logoutIcon: {
    marginLeft: 10,
    color: '#000', // Add space between icon and text
  },
  logoutButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    textAlign: 'center',
    marginRight: 80,
  },
  copyrightContainer: {
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  copyrightText: {
    color: '#000',
    textAlign: 'center',
    fontSize: 18,
    marginTop: 20,
  },

  rentCarButton: {
    marginRight: 16, // Adjust for spacing

    paddingHorizontal: 8,

    // borderWidth:1 ,

    elevation: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 25,
  },
  rentCarButtonText: {
    color: '#feb101',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default DrawerNavigator;
