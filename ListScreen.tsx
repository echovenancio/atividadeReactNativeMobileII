import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Image, Alert, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';

interface Trip {
  id: string;
  latitude: number;
  longitude: number;
  photoUri: string;
  date: string;
  name: string;
  rating: number;
  description: string;
}

export default function ListScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);

  const loadTrips = async () => {
    const stored = await AsyncStorage.getItem('trips');
    if (stored) {
      const parsedTrips = JSON.parse(stored);
      parsedTrips.sort((a: Trip, b: Trip) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTrips(parsedTrips);
    }
  };

  const deleteTrip = async (id: string) => {
    Alert.alert(
      "Excluir registro",
      "Tem certeza que deseja excluir este local?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: async () => {
            const updated = trips.filter((t) => t.id !== id);
            await AsyncStorage.setItem('trips', JSON.stringify(updated));
            setTrips(updated);
          }
        }
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      loadTrips();
    }, [])
  );

  const renderTrip = ({ item }: { item: Trip }) => (
    <View style={styles.trip}>
      <View style={styles.headerRow}>
        <Text style={styles.tripTitle}>{item.name}</Text>
        <TouchableOpacity onPress={() => deleteTrip(item.id)}>
          <MaterialIcons name="delete" size={26} color="red" />
        </TouchableOpacity>
      </View>

      <Text style={styles.tripDate}>{new Date(item.date).toLocaleString()}</Text>
      <Text style={styles.tripCoords}>Lat: {item.latitude.toFixed(4)}, Lon: {item.longitude.toFixed(4)}</Text>

      {item.rating !== undefined && (
        <Text style={styles.tripRating}>⭐ {item.rating}/5</Text>
      )}

      {item.description ? (
        <Text style={styles.tripDescription}>📝 {item.description}</Text>
      ) : null}

      {item.photoUri && <Image source={{ uri: item.photoUri }} style={styles.image} />}
    </View>
  );

  return (
    <View style={styles.container}>
      {trips.length === 0 ? (
        <Text style={styles.noTrips}>Nenhum local registrado ainda.</Text>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  tripRating: {
    fontSize: 15,
    color: '#444',
    fontWeight: '600',
    marginTop: 6,
  },
  tripDescription: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
    fontStyle: 'italic',
  },
});
