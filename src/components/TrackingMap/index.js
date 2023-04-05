import React, {useEffect, useState, useRef} from 'react';
const geolib = require('geolib');
import {
  Alert,
  AsyncStorage,
  View,
  Text,
  PermissionsAndroid,
  Platform,
  Button,
  StyleSheet,
  Pressable,
} from 'react-native';
import RNLocation from 'react-native-location';
import ReactNativeForegroundService from '@supersami/rn-foreground-service';

import Geolocation from '@react-native-community/geolocation';

import MapView, {Marker, Polyline} from 'react-native-maps';

const TrackingMap = () => {
  let initialRegion = {
    latitude: 22.302711,
    longitude: 114.177216,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const map = useRef();

  const [initalLocation, setinitalLocation] = useState();
  const [initLatLng, addLatLng] = useState([]);
  const [initLocation, updateLocation] = useState();
  const [initButton, setButton] = useState(false);
  const [initLockView, setLockView] = useState(false);
  const [watchId, setWatchId] = useState();
  const BSArray = [
    {alerted: false, name: 'Tai Shing Stream, Shing Mun',latitude: 22.39894963177416,longitude:114.14740932339873},
    {alerted: false, name: 'Lion Rock Peak',latitude: 22.35232973265008,longitude:114.18703856731156},
    {alerted: false, name: 'Sharp Peak', latitude: 22.433357844093003, longitude: 114.36681898694634 },
    {alerted: false, name: 'Quadruplex Pool, Sai Kung East', latitude: 22.40273134367112, longitude: 114.36746100742158 },
    {alerted: false, name: 'Yin Tsz Ngam, Sai Kung East', latitude: 22.3874958, longitude: 114.3905916 },
    {alerted: false, name: 'Kim Chu Wan, Sai Kung East', latitude: 22.357652, longitude: 114.374810 },
    {alerted: false, name: 'Bride’s Pool Waterfall, Plover Cove', latitude: 22.503327918257988, longitude: 114.23921076237822 },
    {alerted: false, name: 'Kau Nga Ling Area, Lantau South', latitude: 22.242066994655392, longitude: 113.9173329529261 },
    {alerted: false, name: 'Shui Lo Cho, Lantau South', latitude: 22.231340044380264, longitude: 113.85624283490502 },
    {alerted: false, name: 'Lo Hon Tower, Lantau South', latitude: 22.253347790857546, longitude: 113.92329645861722 },
    {alerted: false, name: 'Inverted Wrist Cliff, Lantau South', latitude: 22.250452545788352, longitude: 113.91629723992438 },
    {alerted: false, name: 'Wong Lung Stream, Lantau North', latitude: 22.26465488102063, longitude: 113.9535242487145 },
    {alerted: false, name: 'Nei San Stream, Lantau North', latitude: 22.2818196527751, longitude: 113.91646473063562 },
    {alerted: false, name: 'Monkey Cliff, Pat Sin Leng', latitude: 22.484221804631954, longitude: 114.23491901363708 },
    {alerted: false, name: 'Ping Nam Stream, Pat Sin Leng', latitude: 22.513972065567152, longitude: 114.209409224866 },
    {alerted: false, name: 'Tai Shek Stream, Tai Mo Shan', latitude: 22.421293455981985, longitude: 114.12170725593903 },
    {alerted: false, name: 'Tiu Shau Ngam, Ma On Shan', latitude: 22.41624550800231, longitude: 114.24487709882355 },
    {alerted: false, name: 'Fei Ngo Shan, Ma On Shan', latitude: 22.338247825060193, longitude: 114.22350691452257},
  ]
  const checkNearBlackSpot = (currentPosition) => {
    for(let j=0; j<BSArray.length; j++){
      const point = {latitude: BSArray[j].latitude, longitude: BSArray[j].longitude};
      //console.log(point);
      //console.log(currentPosition);
      const distance = geolib.getDistance(currentPosition, point);
      //console.log(BSArray[j].name);
      if(distance < 100 && !BSArray[j].alerted){
        //alert
        Alert.alert(
          'Warning',
          `You are near ${BSArray[j].name}!`,
          [{ text: 'OK' }]
        );
        BSArray[j].alerted = true;//Alerted = true;
      }
    }
  }

  const foregroundServiceStart = () => {
    //Alerted = false;
    addLatLng([]);
    let watchId = Geolocation.watchPosition(
      position => {
        const tempPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        // Set all alerted properties to false initially
        for(let j=0; j<BSArray.length; j++){
          BSArray[j].alerted = false;
        }
        checkNearBlackSpot(tempPosition)
        updateLocation(tempPosition);
        addLatLng(initLatLng => [...initLatLng, tempPosition]);
        // updateLocation(previousPosition => (previousPosition,position));
      },
      error => {
        // See error code charts below.
        console.log(error.code, error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        distanceFilter: 5,
      },
    );
    setWatchId(watchId)
  };

  const foregroundServiceStop = async () => {
    Geolocation.clearWatch(watchId)
    let value = await AsyncStorage.getItem('routesId');
    if (value === null) {
      value = "0"
    }
    await AsyncStorage.setItem(value, JSON.stringify(initLatLng))
    await AsyncStorage.setItem("routesId", (parseInt(value) + 1).toString())
  };

  useEffect(() => {
    Geolocation.getCurrentPosition(
      position => {
        // console.log(position);
        const setStartRegion = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.0322,
          longitudeDelta: 0.0421,
        };
        setinitalLocation(setStartRegion);
        map.current.animateToRegion(setStartRegion);
      },
      error => {
        // See error code charts below.
        console.log(error.code, error.message);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  }, []);

  useEffect(() => {
    if (!initLocation) {
      return;
    }
    if (initLockView) {
      const trackRegion = {
        latitude: initLocation.latitude,
        longitude: initLocation.longitude,
        latitudeDelta: 0.0121,
        longitudeDelta: 0.00821,
      };
      // console.log(trackRegion);
      map.current.animateToRegion(trackRegion);
    }
  }, [initLocation]);

  
  return (
    <View>
      <MapView
        ref={map}
        style={{width: '100%', height: '100%'}}
        showsUserLocation={true}
        initialRegion={initialRegion}>
        <Polyline
          coordinates={initLatLng}
          strokeColor="red" // fallback for when `strokeColors` is not supported by the map-provider
          strokeWidth={3}
        />
        <Marker icon={require('./alert.png')} //Tai Shing Stream, Shing Mun
        coordinate={{ latitude: 22.39894963177416, longitude: 114.14740932339873 }}/>
        <Marker icon={require('./alert.png')} //Lion Rock Peak
        coordinate={{ latitude: 22.35232973265008, longitude: 114.18703856731156 }}/>
        <Marker icon={require('./alert.png')} //Sharp Peak, Sai Kung East
        coordinate={{ latitude: 22.433357844093003, longitude: 114.36681898694634 }}/>
        <Marker icon={require('./alert.png')} //Quadruplex Pool, Sai Kung East
        coordinate={{ latitude: 22.40273134367112, longitude: 114.36746100742158 }}/>
        <Marker icon={require('./alert.png')} //Yin Tsz Ngam, Sai Kung East
        coordinate={{ latitude: 22.3874958, longitude: 114.3905916 }}/>
        <Marker icon={require('./alert.png')} //Kim Chu Wan, Sai Kung East
        coordinate={{ latitude: 22.357652, longitude: 114.374810 }}/>
        <Marker icon={require('./alert.png')} //Bride’s Pool Waterfall, Plover Cove
        coordinate={{ latitude: 22.503327918257988, longitude: 114.23921076237822 }}/>
        <Marker icon={require('./alert.png')} //Kau Nga Ling Area, Lantau South
        coordinate={{ latitude: 22.242066994655392, longitude: 113.9173329529261 }}/>
        <Marker icon={require('./alert.png')} //Shui Lo Cho, Lantau South
        coordinate={{ latitude: 22.231340044380264, longitude: 113.85624283490502 }}/>
        <Marker icon={require('./alert.png')} //Lo Hon Tower, Lantau South
        coordinate={{ latitude: 22.253347790857546, longitude: 113.92329645861722 }}/>
        <Marker icon={require('./alert.png')} //Inverted Wrist Cliff, Lantau South
        coordinate={{ latitude: 22.250452545788352, longitude: 113.91629723992438 }}/>
        <Marker icon={require('./alert.png')} //Wong Lung Stream, Lantau North
        coordinate={{ latitude: 22.26465488102063, longitude: 113.9535242487145 }}/>
        <Marker icon={require('./alert.png')} //Nei San Stream, Lantau North
        coordinate={{ latitude: 22.2818196527751, longitude: 113.91646473063562 }}/>
        <Marker icon={require('./alert.png')} //Monkey Cliff, Pat Sin Leng
        coordinate={{ latitude: 22.484221804631954, longitude: 114.23491901363708 }}/>
        <Marker icon={require('./alert.png')} //Ping Nam Stream, Pat Sin Leng
        coordinate={{ latitude: 22.513972065567152, longitude: 114.209409224866 }}/>
        <Marker icon={require('./alert.png')} //Tai Shek Stream, Tai Mo Shan
        coordinate={{ latitude: 22.421293455981985, longitude: 114.12170725593903 }}/>
        <Marker icon={require('./alert.png')} //Tiu Shau Ngam, Ma On Shan
        coordinate={{ latitude: 22.41624550800231, longitude: 114.24487709882355 }}/>
        <Marker icon={require('./alert.png')} //Fei Ngo Shan, Ma On Shan
        coordinate={{ latitude: 22.338247825060193, longitude: 114.22350691452257 }}/>


      </MapView>
      {initButton ? (
        <View style={styles.tracktButton}>
          <Button
            color="red"
            title="Stop"
            onPress={async () => {
              await foregroundServiceStop();
              setButton(false);
            }}
          />
        </View>
      ) : (
        <View style={styles.tracktButton}>
          <Button
            title="Start"
            onPress={() => {
              foregroundServiceStart();
              setButton(true);
            }}
          />
        </View>
      )}

      {initLockView ? (
        <View style={styles.lockButton}>
          <Button color='red' title="LockView" onPress={() => setLockView(false)} />
        </View>
      ) : (
        <View style={styles.lockButton}>
          <Button title="LockView" onPress={() => setLockView(true)} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tracktButton: {
    position: 'absolute',
    justifyContent: 'center',
    width: '70%',
    borderRadius: 5,
    bottom: '3%',
    alignSelf: 'center',
  },
  lockButton: {
    position: 'absolute',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
});

export default TrackingMap;

// import React, {useEffect, useRef, useState} from 'react';
// import {
//   Text,
//   View,
//   Button,
//   Image,
//   Pressable,
//   StyleSheet,
//   Dimensions,
// } from 'react-native';

// import MapView, {Polyline} from 'react-native-maps';
// import Geolocation from 'react-native-geolocation-service';
// import ReactNativeForegroundService from '@supersami/rn-foreground-service';
// import {transform} from '@babel/core';
// // import WeatherDisplay from '../weather';
// import {
//   getWeather,
//   dailyForecast,
//   showWeather,
//   getLocation,
// } from 'react-native-weather-api';
// import * as geolib from 'geolib';
// import BackgroundTimer from 'react-native-background-timer';
// // autocomplete place search
// //import PlacesAutoComplete from '../PlaceAutoComplete';

// //set marker of  destination
// // import DestinationMarker from '../Markers/DestinationMarker';
// // import MapViewDirections from 'react-native-maps-directions';

// // import ToiletMarker from '../Markers/ToiletMarker';
// // import BlackSpotsMarker from '../Markers/BlackSpotsMarker';
// //use navigation
// import {useNavigation} from '@react-navigation/native';
// //import icon
// import AntDesign from 'react-native-vector-icons/AntDesign';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// //import data
// //import toilets from '../../Assets/data/toilets';

// //import {back} from 'react-native/Libraries/Animated/Easing';
// //import {DataStore} from 'aws-amplify';
// //import {Toilet, BlackSpot} from '../../models';

// //import AsyncStorage from '@react-native-async-storage/async-storage';
// import { LogBox } from 'react-native';

// const TrackingMap = props => {
//   LogBox.ignoreLogs(['new NativeEventEmitter']); // Ignore log notification by message
// LogBox.ignoreAllLogs(); //Ignore all log notifications
//   const navigation = useNavigation();
//   const [des, setDes] = useState(null);
//   const [Toilets, setToilets] = useState(null);
//   const [BlackSpots, setBlackSpots] = useState(null);
  
//   const updateDestination = savedData => {
//     console.log('success!');
//     setDes(savedData);
//   };

//   // useEffect(() => {
//   //   DataStore.query(Toilet).then(results => {
//   //     setToilets(results);
//   //   });
//   // }, []);

//   // useEffect(() => {
//   //   DataStore.query(BlackSpot).then(results => {
//   //     setBlackSpots(results);
//   //   });
//   // }, []);

//   useEffect(() => {
//     if (initLocation)
//       console.log(initLocation.coords.latitude, initLocation.coords.longitude);
//     if (des) console.log(des.name);
//     return;
//   }, [des]);

//   //console.log(temp);
//   let initialRegion = {
//     latitude: 22.41707,
//     longitude: 114.22714,
//     latitudeDelta: 0.0922,
//     longitudeDelta: 0.0421,
//   };

 

//   const map = useRef();

//   const [initalLocation, setinitalLocation] = useState();
//   const [initLatLng, addLatLng] = useState([]);
//   const [initLocation, updateLocation] = useState();
//   const [speed, setspeed] = useState('0');
//   const [distance, setDistance] = useState(0);
//   //timer
//   const [timerOn, setTimerOn] = useState(false);
//   const [secondsLeft, setSecondsLeft] = useState(0);
//  // const [weatherData, setWeatherData] = useState(null);

//   const [calories, setCalories] = useState(0);
//   const [tCalories, setTCalories] = useState([]);
//   const [showTCalories, setShowTCalories] = useState(0);

//   //flag indicate start button pressed
//   const [started, setStarted] = useState(false);
//   const [pasue, setPasue] = useState(false);
//   //flag indicate dashBoard button pressed
//   const [DashBoardShow, setDashBoardShow] = useState(false);

//   const foregroundServiceStart = () => {
//     setStarted(true);
//     setPasue(false);
//     startTimer();
//     ReactNativeForegroundService.start({
//       id: 1,
//       title: 'Foreground Service',
//       message: 'you are geolocation!',
//     });

//     ReactNativeForegroundService.add_task(
//       () => {
//         Geolocation.watchPosition(
//           position => {
//             updateLocation(position);
//             const tempPosition = {
//               latitude: position.coords.latitude,
//               longitude: position.coords.longitude,
//             };
//             // console.log(tempPosition);
//             //speed
//             const speedStr = position.coords.speed.toString();
//             setspeed(
//               speedStr.substring(0, speedStr.length - (speedStr.length - 5)),
//             );

//             addLatLng(initLatLng => [...initLatLng, tempPosition]);
//           },
//           error => {
//             // See error code charts below.
//             console.log(error.code, error.message);
//           },
//           {
//             enableHighAccuracy: true,
//             timeout: 10000,
//             maximumAge: 0,
//             distanceFilter: 5,
//           },
//         );
//       },
//       {
//         delay: 1500,
//         onLoop: false,
//         taskId: 'taskid',
//         onError: e => console.log('Error logging:', e),
//       },
//     );
//   };

//   const foregroundServiceStop = command => {
//     // console.log(command);

//     if (command === 'stop') {
//       setDes(null);
//       stopTimer(command);
//       Geolocation.stopObserving();
//       addLatLng([]);
//       setspeed('0');
//       setDistance(0);
//       setCalories(0);
//       setTCalories([]);
//       setShowTCalories(0);
//       ReactNativeForegroundService.remove_all_tasks();
//       ReactNativeForegroundService.stop();
//       setStarted(false);
//       setPasue(false);
//       // update result
//       uploadResult();
//     }
//     if (command === 'pause') {
//       // console.log('pasue the tracking!');
//       setPasue(true);
//       stopTimer(command);
//       Geolocation.stopObserving();
//       ReactNativeForegroundService.remove_all_tasks();
//       ReactNativeForegroundService.stop();
//     }
//   };

//   //Timer
//   const startTimer = () => {
//     BackgroundTimer.runBackgroundTimer(() => {
//       setSecondsLeft(secs => secs + 1);
//     }, 1000);
//   };
//   const stopTimer = command => {
//     if (command === 'stop') {
//       setSecondsLeft(0);
//       BackgroundTimer.stopBackgroundTimer();
//     }
//     if (command === 'pause') {
//       BackgroundTimer.stopBackgroundTimer();
//     }
//   };

//   //calories calculator
//   const caloryCal = (speed, bw) => {
//     var speed = speed * 2.237; // mps to mph
//     var met = 0;
//     switch (true) {
//       case speed < 3.5:
//         met = 3.5;
//         break;
//       case speed < 10:
//         met = 4;
//         break;
//       case speed < 9.4:
//         met = 5.8;
//         break;
//       case speed < 11.9:
//         met = 6.8;
//         break;
//       case speed < 13.9:
//         met = 8;
//         break;
//       case speed < 15.9:
//         met = 10;
//         break;
//       case speed < 19:
//         met = 12;
//         break;
//       case speed > 20:
//         met = 16;
//         break;
//       default:
//         met = 0;
//     }

//     var result = (met * bw * 3.5) / 200 / 60;
//     return result.toFixed(3);
//   };

//   //total calories
//   const totalCalory = tCalories => {
//     if (tCalories) {
//       var sum = 0;
//       for (var i = 0; i < tCalories.length; i++) {
//         sum += parseFloat(tCalories[i]);
//       }
//       return sum.toFixed(2);
//     }
//     return 0;
//   };
//   //get current location initially
//   useEffect(() => {
//     Geolocation.getCurrentPosition(
//       position => {
//         // console.log(position);
//         const setStartRegion = {
//           latitude: position.coords.latitude,
//           longitude: position.coords.longitude,
//           latitudeDelta: 0.0322,
//           longitudeDelta: 0.0421,
//         };
//         setinitalLocation(setStartRegion);
//         updateLocation(position);
//         map.current.animateToRegion(setStartRegion);
//         console.log('initLocation is set ' + initLocation);
//        // getWeatherdata(position.coords.latitude, position.coords.longitude);
//       },
//       error => {
//         // See error code charts below  .
//         console.log(error.code, error.message);
//       },
//       {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
//     );
//   }, []);

//   //location change
//   useEffect(() => {
//     if (!initLocation) {
//       return;
//     }
//     setDistance(geolib.getPathLength(initLatLng) / 1000);
//     setCalories(caloryCal(parseFloat(speed), 60));
//     setTCalories(tCalories => [...tCalories, calories]);
//     setShowTCalories(totalCalory(tCalories));

//     const trackRegion = {
//       latitude: initLocation.coords.latitude,
//       longitude: initLocation.coords.longitude,
//       latitudeDelta: 0.0121,
//       longitudeDelta: 0.00821,
//     };
//     // console.log(trackRegion);
//     map.current.animateToRegion(trackRegion);
//     console.log('done');
//    // getWeatherdata(initLocation.coords.latitude, initLocation.coords.longitude);
//     //console.log(weatherData);
//   }, [initLocation]);

//   //timmer change
//   useEffect(() => {
//     if (timerOn) startTimer();
//     else BackgroundTimer.stopBackgroundTimer();
//     return () => {
//       BackgroundTimer.stopBackgroundTimer();
//     };
//   }, [timerOn]);

//   // Checks if secondsLeft = 0 and stop timer if so
//   useEffect(() => {
//     if (secondsLeft === 0) BackgroundTimer.stopBackgroundTimer();
//   }, [secondsLeft]);
//   const clockify = () => {
//     let hours = Math.floor(secondsLeft / 60 / 60);
//     let mins = Math.floor((secondsLeft / 60) % 60);
//     let seconds = Math.floor(secondsLeft % 60);
//     let displayHours = hours < 10 ? `0${hours}` : hours;
//     let displayMins = mins < 10 ? `0${mins}` : mins;
//     let displaySecs = seconds < 10 ? `0${seconds}` : seconds;
//     return {
//       displayHours,
//       displayMins,
//       displaySecs,
//     };
//   };

//   // update the result (number of routes finished) after finished
//   const uploadResult = async () => {
//     try {
//       let tRide = await AsyncStorage.getItem('@tRide'); //number of ride
//       let totalComplete = await AsyncStorage.getItem('@routeCompleted');
//       let rideDetails = await AsyncStorage.getItem('@detailsRide');
//       if (tRide !== null) {
//         parseFloat(tRide);
//         tRide = (parseFloat(tRide) + distance).toFixed(3);
//       } else {
//         tRide = distance;
//       }

//       if (totalComplete !== null) {
//         totalComplete++;
//       } else {
//         totalComplete = 1;
//       }

//       let yourDate = new Date();
//       const offset = yourDate.getTimezoneOffset();
//       yourDate = new Date(yourDate.getTime() - offset * 60 * 1000);
//       const date = yourDate.toISOString().split('T')[0];
//       const time = yourDate.toISOString().split('T')[1].split('.')[0];

//       if (rideDetails !== null) {
//         let objects = JSON.parse(rideDetails);
//         let tempDetail = {
//           id: totalComplete - 1,
//           dis: distance,
//           spe: speed,
//           cal: showTCalories,
//           date: date,
//           time: time,
//         };

//         let objectArray = objects;
//         // objectArray.push(objects)
//         objectArray.push(tempDetail);

//         rideDetails = JSON.stringify(objectArray);
//       } else {
//         let object = [];
//         let tempDetail = {
//           id: 0,
//           dis: distance,
//           spe: speed,
//           cal: showTCalories,
//           date: date,
//           time: time,
//         };
//         object.push(tempDetail);
//         rideDetails = JSON.stringify(object);
//       }

//       await AsyncStorage.setItem('@tRide', tRide.toString());
//       await AsyncStorage.setItem('@routeCompleted', totalComplete.toString());
//       await AsyncStorage.setItem('@detailsRide', rideDetails);
//     } catch (e) {
//       console.log(e);
//     }
//   };

//   return (
//     <View>
//       <MapView
//         ref={map}
//         style={{width: '100%', height: '100%'}}
//         showsUserLocation={true}
//         initialRegion={initialRegion}>
//         <Polyline
//           coordinates={initLatLng}
//           strokeColor="red" // fallback for when `strokeColors` is not supported by the map-provider
//           strokeWidth={3}
//         />
//         {/* {toilets.map((toilet)=>(
//           <ToiletMarker key={toilet.id}
//           coordinate={toilet.coordinate}
//           />
//         ))} */}

//         {Toilets &&
//           Toilets.map(Toilet => (
//             <ToiletMarker key={Toilet.id} coordinate={Toilet.coordinate} />
//           ))}
        
//         {BlackSpots &&
//           BlackSpots.map(blackSpot => (
//             <BlackSpotsMarker key={blackSpot.id} coordinate={blackSpot.coordinate} />
//           ))}

//         {des && <DestinationMarker destination={des} />}
//         {des && initLocation && (
//           <MapViewDirections
//             origin={{
//               latitude: initLocation.coords.latitude,
//               longitude: initLocation.coords.longitude,
//             }}
//             destination={{
//               latitude: des.location.lat,
//               longitude: des.location.lng,
//             }}
//             strokeWidth={10}
//             strokeColor="#3FC060"
//             apikey="AIzaSyANR3h2G1QwhlFCTlyEvR_gDeQNOJcLeCU"
//           />
//         )}
//       </MapView>

//       {/* <PlacesAutoComplete/> */}
//       {/* <WeatherDisplay/> */}

//       {/* <View
//         id="weather container"
//         style={{
//           position: 'absolute',
//           top: '25%',
//           right: '5%',
//           // transform: [{translateX: 320}, {translateY: 100}],
//         }}> */}
//         {/* <Text style={{color: "aqua"}}>{icon}</Text> */}
//         {/* {weatherData && (
//           <Image
//             style={{width: 50, height: 50}}
//             source={{uri: `${weatherData.icon}`}}
//           />
//         )} */}
//         {/* <Text style={{marginLeft: 'auto'}}>
//           {weatherData ? Math.floor(weatherData.temp) + 'ºC' : 0}
//         </Text> */}
//         {/* {props&& <Text style={{marginLeft: 'auto'}}>{weatherData?weatherData.temp: 0}</Text>} */}

//         {/* <Text>ProfileScreen</Text> */}
//       {/* </View> */}

//       {/* <View style={styles.searchButtonContainer}>
//         <Pressable
//           style={styles.searchButton}
//           onPress={() => {
//             if (started) {
//               console.log(
//                 'Please press the stop button to change the destination',
//               );
//               return;
//             }
//             navigation.navigate('Destination Search', {
//               someData: 1234,
//               updateParent: updateDestination,
//             });
//             //navigation.navigate('Destination Search');
//           }}> */}
//           {/* <Fontisto name="search" size={25} color={'#f15454'} /> */}
//           {/* <Text style={styles.searchButtonText}>Set Your Destination</Text>
//         </Pressable>
//       </View> */}

//       <View
//         style={{
//           bottom:'5%',
//           position:'absolute',
//           flex:1,
//           flexDirection:'row',
//           justifyContent:'center',
//           alignSelf:'center'
          
//         }}>
//         {(!started || pasue) && (
//           <View style={{marginHorizontal:30}}>
//             <Button
//               title="Start"
//               onPress={() => {
//                 foregroundServiceStart();
//               }}
//             />
//           </View>
//         )}

//         {(started && !pasue) && (
//           <View style={{marginHorizontal:30}}>
//             <Button
//               title="Pasue"
//               onPress={() => {
//                 foregroundServiceStop('pause');

//               }}
//             />
//           </View>
//         )}

//         {started && (
//           <View style={{marginHorizontal:30}}>
//             <Button
//               title="Stop"
//               onPress={() => {
//                 foregroundServiceStop('stop');
//               }}
//             />
//           </View>
//         )}
//       </View>

//       <Pressable
//         style={({pressed}) => [
//           {
//             backgroundColor: pressed ? 'grey' : 'white',
//           },
//           styles.dashBoardButtonContainer,
//         ]}
//         onPress={() => {
//           setDashBoardShow(!DashBoardShow);
//         }}>
//         <View>
//           <AntDesign name="dashboard" size={50} color="black" />
//         </View>
//       </Pressable>

//       {DashBoardShow && (
//         <View style={styles.dashBoardContainer}>
//           <View style={{flexDirection: 'row'}}>
//             <Text
//               style={{
//                 marginHorizontal: 10,
//                 borderRightWidth: 1,
//                 paddingRight: 10,
//               }}>
//               Speed: {speed} m/s
//             </Text>
//             <Text>Distance: {distance} km</Text>
//           </View>
//           <Text style={{marginHorizontal: 10}}>
//             Time:{clockify().displayHours}:{clockify().displayMins}:
//             {clockify().displaySecs}
//           </Text>
//           <View style={{flexDirection: 'row'}}>
//             <Text
//               style={{
//                 marginHorizontal: 10,
//                 borderRightWidth: 1,
//                 paddingRight: 10,
//               }}>
//               Calories per second:{calories} KJ
//             </Text>
//             <Text>Total Calory:{showTCalories} KJ</Text>
//           </View>
//         </View>
//       )}
//     </View>
//   );
// };

// export default TrackingMap;

// const styles = StyleSheet.create({
//   searchButton: {
//     backgroundColor: '#fff',
//     height: 60,
//     width: Dimensions.get('screen').width - 100,
//     borderRadius: 30,
//     marginHorizontal: 10,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 100,
//     marginVertical: 0,
//   },
//   searchButtonText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   searchButtonContainer: {
//     position: 'absolute',
//     transform: [{translateX: 0}, {translateY: 0}],
//     flex: 1,
//   },
//   dashBoardButtonContainer: {
//     position: 'absolute',
//     transform: [{translateX: 0}, {translateY: 200}],
//     flex: 1,
//     borderRadius: 10,
//     padding: 5,
//   },

//   dashBoardContainer: {
//     position: 'absolute',
//     top: '15%',
//     // transform: [{translateX: 0}, {translateY: 270}],
//     flex: 1,
//     backgroundColor: 'white',
//     borderRadius: 10,
//     padding: 5,
//   },
// });
