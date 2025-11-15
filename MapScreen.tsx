import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Button, Alert, TextInput } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Calendar from 'expo-calendar';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Trip {
  id: string;
  latitude: number;
  longitude: number;
  photoUri: string;
  date: string;
  name: string;
}

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [cameraRef, setCameraRef] = useState<any>(null);
  const [currentTrip, setCurrentTrip] = useState<Partial<Trip> | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripName, setTripName] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permissão negada para localização');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      const subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 5 },
        (loc) => setLocation(loc)
      );
      return () => subscription.remove();
    })();
    loadTrips();
  }, []);

  const loadTrips = async () => {
    const stored = await AsyncStorage.getItem('trips');
    if (stored) setTrips(JSON.parse(stored));
  };

  const saveTrip = async (trip: Trip) => {
    const newTrips = [...trips, trip];
    setTrips(newTrips);
    await AsyncStorage.setItem('trips', JSON.stringify(newTrips));
  };

  const takePhoto = async () => {
    if (cameraRef) {
      const photo = await cameraRef.takePictureAsync();
      return photo.uri;
    }
  };

  const addToCalendar = async (name: string, date: string) => {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status === 'granted') {
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(cal => cal.allowsModifications);
      if (defaultCalendar) {
        await Calendar.createEventAsync(defaultCalendar.id, {
          title: name,
          startDate: new Date(date),
          endDate: new Date(date),
          timeZone: 'GMT',
        });
      }
    }
  };

  const registerTrip = async () => {
    if (!location || !tripName.trim()) {
      Alert.alert('Erro', 'Por favor, insira um nome para a viagem.');
      return;
    }
    if (!permission || permission.status !== 'granted') {
      const { status } = await requestPermission();
      if (status !== 'granted') {
        Alert.alert('Erro', 'Permissão para câmera negada.');
        return;
      }
    }
    setCurrentTrip({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      date: new Date().toISOString(),
      name: tripName,
    });
    setShowCamera(true);
  };

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text>{errorMsg}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.container}>
        <Text>Obtendo localização...</Text>
      </View>
    );
  }

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} ref={setCameraRef} />
        <View style={styles.cameraOverlay}>
          <Button title="Tirar Foto" onPress={async () => {
            if (cameraRef) {
              const photo = await cameraRef.takePictureAsync();
              setShowCamera(false);
              if (currentTrip) {
                const trip: Trip = {
                  ...currentTrip,
                  id: Date.now().toString(),
                  photoUri: photo.uri,
                } as Trip;
                await addToCalendar(trip.name, trip.date);
                await saveTrip(trip);
                setCurrentTrip(null);
                setTripName('');
                Alert.alert('Sucesso', 'Viagem registrada!');
              }
            }
          }} />
          <Button title="Cancelar" onPress={() => { setShowCamera(false); setCurrentTrip(null); }} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        showsUserLocation
        followsUserLocation
      >
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="Você está aqui"
        />
        {trips.map(trip => (
          <Marker
            key={trip.id}
            coordinate={{ latitude: trip.latitude, longitude: trip.longitude }}
            title={trip.name}
          />
        ))}
      </MapView>
      <View style={styles.overlay}>
        <Button title="Registrar Local" onPress={registerTrip} />
      </View>
      <View style={styles.tripNameContainer}>
        <TextInput
          style={styles.tripNameInput}
          placeholder="Nome da Viagem"
          value={tripName}
          onChangeText={setTripName}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  overlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  camera: { flex: 1 },
  cameraContainer: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tripNameContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
  },
  tripNameInput: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
});