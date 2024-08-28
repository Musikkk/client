import React, { useState, useRef } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import axios from 'axios';

const containerStyle = {
  width: '100%',
  height: '90vh',
};

const App = () => {
  const [chargers, setChargers] = useState([]); // Stan przechowujący listę ładowarek
  const [center, setCenter] = useState({ lat: 52.2297, lng: 21.0122 }); // Początkowe współrzędne mapy (Warszawa)
  const searchBoxRef = useRef(null); // Referencja do inputu SearchBox
  const mapRef = useRef(null); // Referencja do mapy Google
  const searchBoxInstanceRef = useRef(null); // Referencja do instancji SearchBox

  // Funkcja pobierająca dane o ładowarkach z Open Charge Map
  const fetchChargers = async (latitude, longitude) => {
    try {
      const response = await axios.get('https://api.openchargemap.io/v3/poi/', {
        params: {
          key: 'Open Charge Map API', // Zastąp swoim kluczem API z Open Charge Map
          output: 'json',
          latitude,
          longitude,
          maxresults: 50,
          distance: 20,
        },
      });
      setChargers(response.data); // Ustawienie stanu z pobranymi ładowarkami
      console.log('Chargers fetched:', response.data);
    } catch (error) {
      console.error('Error fetching data from Open Charge Map API:', error);
    }
  };

  // Funkcja obsługująca zmiany miejsc w SearchBoxie
  const onPlacesChanged = () => {
    const places = searchBoxInstanceRef.current.getPlaces();

    if (!places || places.length === 0) {
      console.log('No places found');
      return;
    }

    console.log('Places found:', places);

    // Ustawienie nowego centrum mapy na podstawie wybranego miejsca
    const place = places[0];
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    setCenter({ lat, lng }); // Przesunięcie mapy do nowego centrum
    fetchChargers(lat, lng); // Pobranie ładowarek dla nowego miejsca
  };

  // Funkcja inicjalizująca mapę i SearchBox
  const onMapLoad = (map) => {
    mapRef.current = map; // Przypisanie mapy do referencji

    if (window.google) {
      const input = searchBoxRef.current;
      searchBoxInstanceRef.current = new window.google.maps.places.SearchBox(input); // Inicjalizacja SearchBox
      searchBoxInstanceRef.current.addListener('places_changed', onPlacesChanged); // Dodanie nasłuchu na zmiany miejsc
      console.log('SearchBox initialized');
    } else {
      console.error('Google Maps or SearchBox initialization failed');
    }
  };

  return (
    <div>
      <input
        ref={searchBoxRef}
        type="text"
        placeholder="Wpisz miejscowość"
        style={{ width: '300px', padding: '10px', margin: '10px' }}
      />
      <LoadScript googleMapsApiKey="Google Maps Klucz API" libraries={['places']}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={10}
          onLoad={onMapLoad} // Inicjalizacja mapy i SearchBox po załadowaniu mapy
        >
          {chargers.map((charger) => (
            <Marker
              key={charger.ID}
              position={{
                lat: charger.AddressInfo.Latitude,
                lng: charger.AddressInfo.Longitude,
              }}
              title={charger.AddressInfo.Title}
            />
          ))}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default App;
