import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Trip {
  id: string;
  latitude: number;
  longitude: number;
  photoUri: string;
  date: string;
  name: string;
}

export default function ListScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);

  const loadTrips = async () => {
    const stored = await AsyncStorage.getItem('trips');
    if (stored) {
      const parsedTrips = JSON.parse(stored);
      // Sort by date descending (most recent first)
      parsedTrips.sort((a: Trip, b: Trip) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTrips(parsedTrips);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTrips();
    }, [])
  );

  const renderTrip = ({ item }: { item: Trip }) => (
    <View style={styles.trip}>
      <Text style={styles.tripTitle}>{item.name}</Text>
      <Text style={styles.tripDate}>{new Date(item.date).toLocaleString()}</Text>
      <Text style={styles.tripCoords}>Lat: {item.latitude.toFixed(4)}, Lon: {item.longitude.toFixed(4)}</Text>
      {item.photoUri && <Image source={{ uri: item.photoUri }} style={styles.image} />}
    </View>
  );

  return (
    <View style={styles.container}>
      {trips.length === 0 ? (
        <Text style={styles.noTrips}>Nenhuma viagem registrada ainda.</Text>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          renderItem={renderTrip}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  trip: { 
    marginBottom: 15, 
    padding: 15, 
    borderWidth: 1, 
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  image: { 
    width: 100, 
    height: 100, 
    marginTop: 10,
    borderRadius: 8,
  },
  noTrips: {
    textAlign: 'center',
    fontSize: 18,
    color: '#666',
    marginTop: 50,
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  tripDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  tripCoords: {
    fontSize: 14,
    color: '#666',
  },
});