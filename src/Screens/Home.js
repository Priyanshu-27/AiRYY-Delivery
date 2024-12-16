import {
  View,
  Text,
  ScrollView,
  Button,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import {useState, useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {DOMAIN} from '@env';
import {logout} from '../Redux/Counter/counterAction';
import Video from 'react-native-video';
import 'react-native-gesture-handler';

import {useNavigation} from '@react-navigation/native';
import {NavigationContainer} from '@react-navigation/native';
import {useSelector} from 'react-redux';

import Ionicons from 'react-native-vector-icons/Ionicons';
const Home = () => {
  const dispatch = useDispatch();
  const phone = useSelector(state => state.counter.phone);
  if (!phone) {
    console.log('====================================');
    console.log('User Not Found');
    console.log('====================================');
    dispatch(logout());
  }
  const fetchTeamData = () => {
    fetch(`https://${DOMAIN}/Admin/staff-data/`, {
      method: 'GET',
    })
      .then(response => response.json())
      .then(responseJson => {
        // Check if the phone exists in the data
        const phoneExists = responseJson.some(staff => staff.phone === phone);

        if (!phoneExists) {
          // If phone is not found, dispatch logout
          dispatch(logout());
        } else {
          console.log('Phone found, user is logged in.');
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  useEffect(() => {
    if (phone) {
      fetchTeamData();
    }
  }, [phone]);

  const navigation = useNavigation();
  
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  return (
    <View style={{flex: 1, backgroundColor: '#ffff'}}>
      <View>
        <ScrollView>
          <View style={styles.container}>
            <View style={styles.headercontainer}>
              <Text style={styles.title}>Delivery Service</Text>
            </View>
            <View style={styles.Vcontainer}>
              {!isVideoLoaded && (
               null
              )}
              <Video
                source={require('../assets/Airyy.mp4')}
                style={styles.video}
                resizeMode="cover"
                repeat
                onLoad={() => setIsVideoLoaded(true)}
              />
            </View>
            
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                marginTop: 10,
                alignSelf: 'center',
                justifyContent: 'space-around',
                width: '100%',
              }}>
              <View
                style={{
                  width: '30%',
                }}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    navigation.navigate('CustomerDetails');
                  }}>
                  <Text style={styles.buttonText}>Delivery</Text>
                </TouchableOpacity>
              </View>

              {/* <View style={{padding: 50}}></View> */}
              <View
                style={{
                  width: '30%',
                }}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    // navigation.navigate('Login');
                    navigation.navigate('DepositeDetail');
                  }}>
                  <Text style={styles.buttonText}>Deposit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  Vcontainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: 350,
    height: 350,
  },
  headercontainer: {
    backgroundColor: '#feb101',
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'black',
    shadowOpacity: 0.5,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 6,
    marginBottom: 50,

    borderBottomLeftRadius: 45,
    borderBottomRightRadius: 45,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000000',
    alignSelf: 'center',
  },

  button: {
    backgroundColor: '#feb101',
    width: '100%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginTop: 5,
    shadowColor: 'black',
    shadowOpacity: 0.5,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 6,
  },
  buttonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.5,
  },
});

export default Home;
