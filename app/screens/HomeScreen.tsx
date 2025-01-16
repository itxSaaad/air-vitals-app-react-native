import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as Device from 'expo-device';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Card } from 'react-native-paper';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

import { getAQIIcon, getAQIMessage, getAQIStyle } from '../utils/AQIUtils';

interface Forecast {
  ts: string;
  aqius: number;
  aqicn: number;
  tp: number;
  tp_min: number;
  pr: number;
  hu: number;
  ws: number;
  wd: number;
  ic: string;
}

interface Data {
  city: string;
  state: string;
  country: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  forecasts: Forecast[];
  current: {
    weather: {
      ts: string;
      tp: number;
      pr: number;
      hu: number;
      ws: number;
      wd: number;
      ic: string;
    };
    pollution: {
      ts: string;
      aqius: number;
      mainus: string;
      aqicn: number;
      maincn: string;
    };
  };
}

const HomeScreen: React.FC = () => {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState<Boolean>(true);
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);
  const apiKey = process.env.EXPO_PUBLIC_AIRVISUAL_API_KEY;
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);

  const fadeAnim = useState(new Animated.Value(0))[0]; // Animation for fade in/out

  useEffect(() => {
    async function getCurrentLocation() {
      if (Platform.OS === 'android' && !Device.isDevice) {
        setErrorMsg(
          'Oops, this will not work on Snack in an Android Emulator. Try it on your device!'
        );
        return;
      }
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
    }

    getCurrentLocation();
  }, []);

  const fetchData = async () => {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `http://api.airvisual.com/v2/nearest_city?lat=${latitude}&lon=${longitude}&key=${apiKey}`,
      headers: {},
    };

    try {
      const response = await axios(config);
      setData(response.data.data);
      setLoading(false);
      setErrorMsg(null);
      setLastRefresh(new Date().toLocaleTimeString());
      // Animate the screen once data is loaded
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error(error);
      setErrorMsg('Failed to fetch data. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (latitude !== 0 && longitude !== 0) {
      fetchData();
    }
  }, [latitude, longitude, apiKey]);

  const handleRefresh = () => {
    setLoading(true);
    fetchData();
  };

  const renderAQIGauge = (aqi: number) => {
    const radius = 80;
    const strokeWidth = 15;
    const center = radius + strokeWidth;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min((aqi / 500) * circumference, circumference);

    return (
      <Svg height={center * 2} width={center * 2}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#e0e0e0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={getAQIStyle(aqi).borderColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round"
        />
        <SvgText
          x={center}
          y={center}
          fontSize="40"
          fill="#263238"
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {aqi}
        </SvgText>
      </Svg>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#1976d2"
        translucent
      />
      {!data || loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>Loading air quality data...</Text>
          {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
        </View>
      ) : (
        <Animated.ScrollView style={[styles.scrollView, { opacity: fadeAnim }]}>
          <LinearGradient colors={['#1976d2', '#64b5f6']} style={styles.header}>
            <MaterialCommunityIcons
              name="weather-windy"
              size={32}
              color="white"
            />
            <Text style={styles.headerTitle}>Air Vitals</Text>
            <Text style={styles.location}>
              {data.city}, {data.country}
            </Text>
          </LinearGradient>

          <View style={styles.mainContent}>
            <Card style={styles.aqiCard}>
              <Card.Content style={styles.aqiCardContent}>
                {renderAQIGauge(data.current.pollution.aqius)}
                <Text style={styles.healthStatus}>
                  <MaterialCommunityIcons
                    name={getAQIIcon(data.current.pollution.aqius)}
                    size={32}
                    color={
                      getAQIStyle(data.current.pollution.aqius).borderColor
                    }
                  />
                  {getAQIMessage(data.current.pollution.aqius)}
                </Text>
              </Card.Content>
            </Card>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tipsScroll}
            >
              <Card style={[styles.tipCard, { backgroundColor: '#ffe0b2' }]}>
                <Card.Content style={styles.tipContent}>
                  <View style={styles.tipIconContainer}>
                    <MaterialCommunityIcons
                      name="run-fast"
                      size={32}
                      color="#d84315"
                    />
                  </View>
                  <Text style={styles.tip}>
                    Avoid outdoor activities when air quality is poor.
                  </Text>
                </Card.Content>
              </Card>
              <Card style={[styles.tipCard, { backgroundColor: '#bbdefb' }]}>
                <Card.Content style={styles.tipContent}>
                  <View style={styles.tipIconContainer}>
                    <MaterialCommunityIcons
                      name="air-filter"
                      size={32}
                      color="#0d47a1"
                    />
                  </View>
                  <Text style={styles.tip}>
                    Use air purifiers indoors to improve air quality.
                  </Text>
                </Card.Content>
              </Card>
              <Card style={[styles.tipCard, { backgroundColor: '#e1bee7' }]}>
                <Card.Content style={styles.tipContent}>
                  <View style={styles.tipIconContainer}>
                    <MaterialCommunityIcons
                      name="window-closed"
                      size={32}
                      color="#4a148c"
                    />
                  </View>
                  <Text style={styles.tip}>
                    Keep windows closed during high pollution days.
                  </Text>
                </Card.Content>
              </Card>
            </ScrollView>

            <View style={styles.weatherGrid}>
              <View style={styles.weatherRow}>
                <Card style={[styles.weatherCard, styles.weatherCardGrid]}>
                  <Card.Content style={styles.weatherContent}>
                    <MaterialCommunityIcons
                      name="gauge"
                      size={40}
                      color="#66bb6a" // Green
                    />
                    <Text style={styles.weatherValue}>
                      {data.current.weather.pr}
                    </Text>
                    <Text style={styles.weatherLabel}>Pressure (hPa)</Text>
                  </Card.Content>
                </Card>

                <Card style={[styles.weatherCard, styles.weatherCardGrid]}>
                  <Card.Content style={styles.weatherContent}>
                    <MaterialCommunityIcons
                      name="water-percent"
                      size={40}
                      color="#1e88e5" // Light Blue
                    />
                    <Text style={styles.weatherValue}>
                      {data.current.weather.hu}%
                    </Text>
                    <Text style={styles.weatherLabel}>Humidity</Text>
                  </Card.Content>
                </Card>
              </View>

              <View style={styles.weatherRow}>
                <Card style={[styles.weatherCard, styles.weatherCardGrid]}>
                  <Card.Content style={styles.weatherContent}>
                    <MaterialCommunityIcons
                      name="weather-windy"
                      size={40}
                      color="#ff7043" // Orange
                    />
                    <Text style={styles.weatherValue}>
                      {data.current.weather.ws}
                    </Text>
                    <Text style={styles.weatherLabel}>Wind Speed (m/s)</Text>
                  </Card.Content>
                </Card>

                <Card style={[styles.weatherCard, styles.weatherCardGrid]}>
                  <Card.Content style={styles.weatherContent}>
                    <MaterialCommunityIcons
                      name="compass"
                      size={40}
                      color="#ab47bc" // Purple
                    />
                    <Text style={styles.weatherValue}>
                      {data.current.weather.wd}°
                    </Text>
                    <Text style={styles.weatherLabel}>Wind Direction</Text>
                  </Card.Content>
                </Card>
              </View>
            </View>

            {data.forecasts && data.forecasts.length > 0 && (
              <FlatList
                style={styles.forecastList}
                data={data.forecasts}
                keyExtractor={(item) => item.ts}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <Card style={styles.forecastCard}>
                    <Card.Content style={styles.forecastContent}>
                      <Text style={styles.forecastDay}>
                        {new Date(item.ts).toLocaleDateString('en-US', {
                          weekday: 'short',
                        })}
                      </Text>
                      <MaterialCommunityIcons
                        name={getAQIIcon(item.aqius)}
                        size={32}
                        color={getAQIStyle(item.aqius).borderColor}
                      />
                      <Text style={styles.forecastAQIValue}>{item.aqius}</Text>
                      <Text style={styles.forecastStatus}>
                        {getAQIMessage(item.aqius)}
                      </Text>
                      <Text style={styles.forecastDetail}>
                        Temp: {item.tp}°C
                      </Text>
                      <Text style={styles.forecastDetail}>
                        Min Temp: {item.tp_min}°C
                      </Text>
                      <Text style={styles.forecastDetail}>
                        Pressure: {item.pr} hPa
                      </Text>
                      <Text style={styles.forecastDetail}>
                        Humidity: {item.hu}%
                      </Text>
                      <Text style={styles.forecastDetail}>
                        Wind Speed: {item.ws} m/s
                      </Text>
                      <Text style={styles.forecastDetail}>
                        Wind Direction: {item.wd}°
                      </Text>
                    </Card.Content>
                  </Card>
                )}
              />
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.lastRefreshText}>
              Last refreshed: {lastRefresh || 'N/A'}
            </Text>
          </View>
        </Animated.ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Layout containers
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#e3f2fd',
  },
  mainContent: {
    padding: 16,
  },

  // Header styles
  header: {
    padding: 20,
    paddingTop: 48,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  location: {
    fontSize: 16,
    color: 'white',
    marginTop: 8,
    opacity: 0.9,
  },

  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#0288d1',
    fontWeight: '500',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#d32f2f',
    fontWeight: '500',
  },

  // AQI Card
  aqiCard: {
    marginTop: -24,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  aqiCardContent: {
    alignItems: 'center',
    padding: 20,
  },
  healthStatus: {
    fontSize: 20,
    fontWeight: '600',
    color: '#37474f',
    marginTop: 12,
    textAlign: 'center',
  },

  // Weather Grid
  weatherGrid: {
    marginTop: 16,
    paddingHorizontal: 4,
  },
  weatherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    width: '100%',
  },
  weatherCard: {
    flex: 0.48,
    borderRadius: 12,
    elevation: 2,
  },
  weatherCardGrid: {
    marginHorizontal: 4,
  },
  weatherContent: {
    alignItems: 'center',
    padding: 16,
  },
  weatherValue: {
    fontSize: 24,
    color: '#455a64',
    fontWeight: '600',
    marginTop: 8,
  },
  weatherLabel: {
    fontSize: 14,
    color: '#546e7a',
    marginTop: 4,
  },

  // Tips Section
  tipsScroll: {
    marginTop: 16,
    padding: 4,
  },
  tipCard: {
    width: 240,
    marginRight: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  tipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  tipIconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  tip: {
    flex: 1,
    fontSize: 15,
    color: '#455a64',
    marginLeft: 12,
  },

  // Forecast Section
  forecastList: {
    marginBottom: 16,
    padding: 6,
  },
  forecastCard: {
    width: 140,
    marginRight: 12,
    borderRadius: 12,
    elevation: 2,
  },
  forecastContent: {
    alignItems: 'center',
    padding: 12,
  },
  forecastDay: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  forecastAQIValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#263238',
    marginVertical: 4,
  },
  forecastStatus: {
    fontSize: 12,
    textAlign: 'center',
    color: '#546e7a',
  },
  forecastDetail: {
    fontSize: 12,
    color: '#546e7a',
    marginTop: 4,
  },

  // Footer
  footer: {
    padding: 8,
    alignItems: 'center',
    backgroundColor: '#1976d2',
  },
  lastRefreshText: {
    fontSize: 12,
    color: 'white',
  },
});

export default HomeScreen;
