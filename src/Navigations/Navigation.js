import React from 'react';
import {useSelector} from 'react-redux';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from '../Screens/Login';
import DrawerNavigator from './DrawerNavigator';
import CustomerDetails from '../Screens/CustomerDetails';
import DepositeDetail from '../Screens/DepositeDetail';
import Emergency from '../Screens/Emergency';
import BikeAvailability from '../Screens/BikeAvailability';
import VehicleDetails from '../Screens/VahicleDetails';
const Stack = createNativeStackNavigator();

const Navigation = () => {
  const loggedIn = useSelector(state => state.counter.loggedIn); 

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {loggedIn ? (
          <>
            <Stack.Screen name="DrawerNavigator" component={DrawerNavigator} />
            <Stack.Screen name="CustomerDetails" component={CustomerDetails} />
            <Stack.Screen name="DepositeDetail" component={DepositeDetail} />
            <Stack.Screen name="Emergency" component={Emergency} />
            <Stack.Screen name="BikeAvailibility" component={BikeAvailability} />
            <Stack.Screen name="VehicleDetails" component={VehicleDetails} />
                      
          </>
        ) : (
          <Stack.Screen name="Login" component={Login} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
