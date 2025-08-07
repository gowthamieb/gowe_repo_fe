import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { MdFitnessCenter } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon issue in leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper to update map center when region changes
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

// Helper to safely render address info (in case address is an object)
function renderAddress(address) {
  if (!address) return null;
  if (typeof address === 'string') return address;
  // If address is an object, stringify relevant fields
  const { street, city, state, postalCode, country } = address;
  return [street, city, state, postalCode, country]
    .filter(Boolean)
    .join(', ');
}

const MapComponent = ({ gyms = [], onGymSelect }) => {
  const navigate = useNavigate();

  const [region, setRegion] = useState({
    lat: 37.78825,
    lng: -122.4324,
    zoom: 13,
  });
  const [selectedGym, setSelectedGym] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Get user location via browser geolocation API
  useEffect(() => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setRegion((prev) => ({
          ...prev,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }));
      },
      () => {
        setErrorMsg('Unable to retrieve your location');
      }
    );
  }, []);

  const handleGymSelect = (gym) => {
    setSelectedGym(gym);
    setRegion({
      lat: gym.location.latitude,
      lng: gym.location.longitude,
      zoom: 15,
    });
    if (onGymSelect) onGymSelect(gym);
  };

  const navigateToGymDetails = () => {
    if (selectedGym) {
      navigate(`/gym-details/${selectedGym.id}`, { state: { gym: selectedGym } });
    }
  };

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100%' }}>
      <MapContainer
        center={[region.lat, region.lng]}
        zoom={region.zoom}
        style={{ height: '100%', width: '100%' }}
      >
        <RecenterMap center={[region.lat, region.lng]} />
        <TileLayer
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} title="Your Location" />
        )}
        {(gyms ?? []).map((gym) => (
          <Marker
            key={gym.id}
            position={[gym.location.latitude, gym.location.longitude]}
            eventHandlers={{
              click: () => handleGymSelect(gym),
            }}
          >
            <Popup>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MdFitnessCenter
                  size={24}
                  color={selectedGym?.id === gym.id ? '#FF5733' : '#2E86C1'}
                />
                <div>
                  <strong>{gym.name}</strong>
                  <br />
                  {renderAddress(gym.address)}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {selectedGym && (
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            right: 20,
            backgroundColor: 'white',
            borderRadius: 10,
            padding: 15,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            cursor: 'pointer',
          }}
          onClick={navigateToGymDetails}
        >
          <h3 style={{ margin: '0 0 5px 0' }}>{selectedGym.name}</h3>
          <p style={{ margin: '0 0 5px 0', color: '#666' }}>
            {renderAddress(selectedGym.address)}
          </p>
          <p style={{ margin: '0 0 10px 0', color: '#FF5733' }}>
            {selectedGym.distance ? `${selectedGym.distance.toFixed(1)} km away` : ''}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#FF5733' }}>
            <span>See details</span>
            <MdFitnessCenter size={24} />
          </div>
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            right: 20,
            backgroundColor: 'white',
            padding: 10,
            borderRadius: 5,
            borderLeft: '4px solid red',
            color: 'red',
          }}
        >
          {errorMsg}
        </div>
      )}
    </div>
  );
};

export default MapComponent;
