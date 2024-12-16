import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  FlatList,
  Image,
  Text,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Alert,
  Animated,
  ImageBackground,
} from 'react-native';
import LottieView from 'lottie-react-native';
import {DOMAIN} from '@env';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {TouchableOpacity} from 'react-native-gesture-handler';
const Scheduled = () => {
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const moveUpDown = useRef(new Animated.Value(0)).current;

  const animateUpDown = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(moveUpDown, {
          toValue: 10,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(moveUpDown, {
          toValue: -10,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]),
    ).start();
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setLoading(true);
    fetchData();
  }, []);
  const handleDelete = async itemId => {
    try {
      // Display confirmation dialog
      Alert.alert(
        'Confirmation!',
        'Are you sure you want to delete this item?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            onPress: async () => {
              try {
                const response = await fetch(
                  `https://${DOMAIN}/User/TeamSchedule/`,
                  {
                    method: 'DELETE',
                    headers: {
                      'Content-Type': 'application/json',
                      'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({id: itemId}),
                  },
                );

                onRefresh();

                if (response.status === 204) {
                  console.log('Schedule deleted successfully');
                } else {
                  console.error('Unexpected response:', response);
                }
              } catch (error) {
                fetchData();
                console.error('Error during fetch:', error);
              }
            },
          },
        ],
        {cancelable: false},
      );
    } catch (error) {
      console.error('Error displaying confirmation dialog:', error);
    }
  };

  const fetchData = async () => {
    try {
      const response = await fetch(`http://${DOMAIN}/User/TeamSchedule/`);
      const data = await response.json();
      setScheduleData(data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    animateUpDown();
  }, []);

  const renderItem = ({item}) => (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fefce8',
      }}>
      <View
        style={{
          flex: 1,
          width: '85%',
          marginBottom: 10,
          borderRadius: 10,
          padding: 10,
          marginTop: 20,

          borderBottomWidth: 1,

          borderTopColor: '#E2E2DF',
          borderBottomColor: '#E2E2DF',

          backgroundColor: '#fafaf9',
        }}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <View
            style={{
              flexDirection: 'column',
              gap: 4,
              justifyContent: 'center',
              marginRight: 10,
            }}>
            <View style={{alignItems: 'center', flexDirection: 'row'}}>
              <Ionicons name="person" size={20} color="#8BCDF9" />
              <Text style={{fontWeight: '400', marginLeft: 12, color: 'black'}}>
                {' '}
                {item.user.name}
              </Text>
              <Text style={{fontWeight: '400', marginLeft: 5, color: 'black'}}>
                - {item.user.count}
              </Text>
              {item.user.is_staff && (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    gap: 10,
                    borderRadius: 4,
                    backgroundColor: 'green',
                    marginBottom: 10,
                  }}></View>
              )}
            </View>

            <View style={{alignItems: 'center', flexDirection: 'row'}}>
              <Ionicons name="call" size={20} color="#8B96F9" />
              <Text style={{fontWeight: '400', marginLeft: 12, color: 'black'}}>
                {item.user.phone}
              </Text>
            </View>
            <View style={{alignItems: 'center', flexDirection: 'row'}}>
              <Ionicons name="calendar" size={20} color="#B78BF9" />
              <Text style={{fontWeight: '400', marginLeft: 12, color: 'black'}}>
                {new Date(item.Date).toLocaleDateString('en-GB')}
              </Text>
            </View>

            <View style={{alignItems: 'center', flexDirection: 'row'}}>
              <Ionicons name="time" size={20} color="#F98BCD" />
              <Text style={{fontWeight: '400', color: 'black', marginLeft: 12}}>
                {item.Time}
              </Text>
            </View>
          </View>

          <View style={{width: 90, height: 120, backgroundColor: 'white'}}>
            <Image
              source={{uri: item.bike.Image}}
              style={{
                width: 90,
                height: 90,
              }}
            />

            <TouchableOpacity
              onPress={() => handleDelete(item.id)}
              style={{
                justifyContent: 'center',
                alignItems: 'center',

                backgroundColor: 'red',
                padding: 5,
                marginTop: 8,
                borderRadius: 5,
                marginLeft: 10,
              }}>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: 'bold',
                  color: 'white',
                  alignItems: 'center',
                }}>
                {item.bike.license_plate}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{backgroundColor: '#fefce8', flex: 1}}>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="black"
          style={{
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />
      ) : scheduleData && scheduleData.length === 0 ? (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{
            marginTop: 50,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <LottieView
            style={{width: 350, marginBottom: -20, marginLeft: 14, height: 350}}
            source={require('../assets/noschedule.json')}
            autoPlay
            loop
          />

          <Text style={{color: 'black', fontWeight: 'bold'}}>
            No Scheduled bikes
          </Text>
        </ScrollView>
      ) : (
        <FlatList
          data={scheduleData}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

export default Scheduled;
