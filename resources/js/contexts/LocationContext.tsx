import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  delivery_radius: number;
  min_order_amount: number;
  delivery_fee: number;
  distance?: number;
}

interface UserLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

interface LocationContextType {
  userLocation: UserLocation | null;
  nearbyStores: Store[];
  allStores: Store[];
  isLoading: boolean;
  error: string | null;
  setUserLocation: (location: UserLocation) => void;
  refreshStores: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ 
  children, 
  initialLocation, 
  initialNearbyStores, 
  initialAllStores 
}: {
  children: ReactNode;
  initialLocation?: UserLocation;
  initialNearbyStores?: Store[];
  initialAllStores?: Store[];
}) {
  const [userLocation, setUserLocationState] = useState<UserLocation | null>(initialLocation || null);
  const [nearbyStores, setNearbyStores] = useState<Store[]>(initialNearbyStores || []);
  const [allStores, setAllStores] = useState<Store[]>(initialAllStores || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllStores = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/stores', { timeout: 30000 });
      const data = response.data;
      const list = Array.isArray(data) ? data : [];
      const stores = list.map((store: Record<string, unknown>) => ({
        id: String(store.id ?? ''),
        name: String(store.name ?? ''),
        address: String(store.address ?? ''),
        phone: String(store.phone ?? ''),
        latitude: Number(store.latitude) || 0,
        longitude: Number(store.longitude) || 0,
        delivery_radius: Number(store.delivery_radius) || 0,
        min_order_amount: Number(store.min_order_amount) || 0,
        delivery_fee: Number(store.delivery_fee) || 0,
        distance: undefined as number | undefined,
      }));
      setAllStores(stores);
      setNearbyStores(stores.slice(0, 10));
    } catch (err) {
      const errorMsg = axios.isAxiosError(err)
        ? (err.code === 'ECONNABORTED' ? 'Request timed out' : 'Failed to load stores')
        : 'Failed to load stores';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch stores when location changes
  const fetchStores = async (location: UserLocation) => {
    if (!location || !location.latitude || !location.longitude) {
      // console.warn('Invalid location provided to fetchStores');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch nearby stores
      const response = await axios.get('/api/stores/nearby', {
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
          radius: 25
        },
        timeout: 30000 // 30 second timeout
      });

      const stores = response.data.map((store: any) => ({
        id: store.id.toString(),
        name: store.name,
        address: store.address,
        phone: store.phone,
        latitude: parseFloat(store.latitude),
        longitude: parseFloat(store.longitude),
        delivery_radius: store.delivery_radius,
        min_order_amount: store.min_order_amount,
        delivery_fee: store.delivery_fee,
        distance: store.distance
      }));

      setNearbyStores(stores);
      
      // Fetch all stores with distances
      const allResponse = await axios.get('/api/stores', {
        params: {
          latitude: location.latitude,
          longitude: location.longitude
        },
        timeout: 30000 // 30 second timeout
      });

      const allStoresData = allResponse.data.map((store: any) => ({
        id: store.id.toString(),
        name: store.name,
        address: store.address,
        phone: store.phone,
        latitude: parseFloat(store.latitude),
        longitude: parseFloat(store.longitude),
        delivery_radius: store.delivery_radius,
        min_order_amount: store.min_order_amount,
        delivery_fee: store.delivery_fee,
        distance: store.distance
      }));

      setAllStores(allStoresData);
      
      // console.log(`Loaded ${stores.length} nearby stores and ${allStoresData.length} total stores`);
    } catch (err) {
      const errorMsg = axios.isAxiosError(err) 
        ? (err.code === 'ECONNABORTED' ? 'Request timed out' : 'Failed to load stores')
        : 'Failed to load stores';
      
      setError(errorMsg);
      toast.error(errorMsg);
      // console.error('Error fetching stores:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh stores manually — with or without location
  const refreshStores = async () => {
    if (userLocation) {
      await fetchStores(userLocation);
    } else {
      await fetchAllStores();
      toast.info('Showing all stores. Set your location to see nearby results and delivery estimates.');
    }
  };

  // Update location and fetch stores
  const setUserLocation = (location: UserLocation) => {
    // Validate location
    if (!location || typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
      // console.error('Invalid location data:', location);
      toast.error('Invalid location data');
      return;
    }

    if (location.latitude < -90 || location.latitude > 90) {
      // console.error('Invalid latitude:', location.latitude);
      toast.error('Invalid latitude value');
      return;
    }

    if (location.longitude < -180 || location.longitude > 180) {
      // console.error('Invalid longitude:', location.longitude);
      toast.error('Invalid longitude value');
      return;
    }

    setUserLocationState(location);
    
    // Save to localStorage
    localStorage.setItem('barffoods_user_location', JSON.stringify(location));
    
    // Fetch stores for new location
    fetchStores(location);
  };

  // Initialize: use saved location if present; otherwise load all stores so app is usable without location
  useEffect(() => {
    if (!initialLocation) {
      const savedLocation = localStorage.getItem('barffoods_user_location');
      if (savedLocation) {
        try {
          const location = JSON.parse(savedLocation);
          setUserLocationState(location);
          fetchStores(location);
        } catch (err) {
          localStorage.removeItem('barffoods_user_location');
          fetchAllStores();
        }
      } else {
        fetchAllStores();
      }
    }
  }, []);

  return (
    <LocationContext.Provider
      value={{
        userLocation,
        nearbyStores,
        allStores,
        isLoading,
        error,
        setUserLocation,
        refreshStores
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
