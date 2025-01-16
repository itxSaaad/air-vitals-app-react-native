import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Card, FAB, Title } from 'react-native-paper';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

interface Forecast {
  day: string;
  aqi: number;
  status: string;
}

interface Data {
  location: string;
  aqi: number;
  tips: string[];
  forecast: Forecast[];
}

const dummyData: Data = {
  location: 'Gujrat, Pakistan',
  aqi: 85,
  tips: [
    'Limit prolonged outdoor exertion.',
    'Consider wearing a mask if sensitive to air pollution.',
  ],
  forecast: [
    { day: 'Mon', aqi: 75, status: 'Moderate' },
    { day: 'Tue', aqi: 95, status: 'Unhealthy' },
    { day: 'Wed', aqi: 105, status: 'Unhealthy' },
    { day: 'Thu', aqi: 115, status: 'Unhealthy' },
    { day: 'Fri', aqi: 125, status: 'Unhealthy' },
    { day: 'Sat', aqi: 135, status: 'Unhealthy' },
    { day: 'Sun', aqi: 145, status: 'Unhealthy' },
  ],
};

const HomeScreen: React.FC = () => {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState<Boolean>(true);

  useEffect(() => {
    // Simulate fetching data from an API
    setTimeout(() => {
      setData(dummyData);
      setLoading(false);
    }, 1000);
  }, []);

  const getAQIIcon = (aqi: number) => {
    if (aqi <= 50) return 'air-purifier';
    if (aqi <= 100) return 'face-mask';
    if (aqi <= 150) return 'cloud-alert';
    if (aqi <= 200) return 'smog';
    if (aqi <= 300) return 'exclamation-thick';
    return 'skull';
  };

  const getAQIStyle = (aqi: number) => {
    if (aqi <= 50)
      return { backgroundColor: '#e8f5e9', borderColor: '#66bb6a' };
    if (aqi <= 100)
      return { backgroundColor: '#fff3e0', borderColor: '#ffa726' };
    if (aqi <= 150)
      return { backgroundColor: '#fff8e1', borderColor: '#ffd54f' };
    if (aqi <= 200)
      return { backgroundColor: '#ffebee', borderColor: '#ef5350' };
    if (aqi <= 300)
      return { backgroundColor: '#f3e5f5', borderColor: '#ab47bc' };
    return { backgroundColor: '#fce4ec', borderColor: '#c2185b' };
  };

  const getAQIMessage = (aqi: number) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy';
    if (aqi <= 200) return 'Very Unhealthy';
    if (aqi <= 300) return 'Hazardous';
    return 'Severe';
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
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <LinearGradient colors={['#1976d2', '#64b5f6']} style={styles.header}>
            <MaterialCommunityIcons
              name="weather-windy"
              size={32}
              color="white"
            />
            <Text style={styles.headerTitle}>Air Vitals</Text>
            <Text style={styles.location}>{data.location}</Text>
          </LinearGradient>

          <View style={styles.mainContent}>
            <Card style={styles.aqiCard}>
              <Card.Content style={styles.aqiCardContent}>
                {renderAQIGauge(data.aqi)}
                <Text style={styles.healthStatus}>
                  <MaterialCommunityIcons
                    name={getAQIIcon(data.aqi)}
                    size={32}
                    color={getAQIStyle(data.aqi).borderColor}
                  />
                  {getAQIMessage(data.aqi)}
                </Text>
              </Card.Content>
            </Card>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tipsScroll}
            >
              {data.tips.map((tip, index) => (
                <Card key={index} style={styles.tipCard}>
                  <Card.Content>
                    <MaterialCommunityIcons
                      name={
                        tip.includes('mask')
                          ? 'face-mask'
                          : tip.includes('indoors')
                          ? 'home-variant'
                          : 'air-purifier'
                      }
                      size={24}
                      color="#ffa726"
                    />
                    <Text style={styles.tip}>{tip}</Text>
                  </Card.Content>
                </Card>
              ))}
            </ScrollView>

            <Title style={styles.forecastTitle}>7-Day Forecast</Title>
            <FlatList
              style={styles.forecastList}
              data={data.forecast}
              keyExtractor={(item) => item.day}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <Card style={styles.forecastCard}>
                  <Card.Content style={styles.forecastContent}>
                    <Text style={styles.forecastDay}>{item.day}</Text>
                    <MaterialCommunityIcons
                      name={getAQIIcon(item.aqi)}
                      size={32}
                      color={getAQIStyle(item.aqi).borderColor}
                    />
                    <Text style={styles.forecastAQIValue}>{item.aqi}</Text>
                    <Text style={styles.forecastStatus}>{item.status}</Text>
                  </Card.Content>
                </Card>
              )}
            />
          </View>
        </ScrollView>
      )}

      <FAB
        style={styles.fab}
        icon="refresh"
        onPress={() => {
          /* Add refresh logic */
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#0288d1',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#e3f2fd',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 24,
    alignItems: 'center',
    paddingTop: 48,
  },
  headerTitle: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  location: {
    fontSize: 16,
    color: 'white',
    marginTop: 8,
  },
  mainContent: {
    padding: 16,
  },
  aqiCard: {
    marginTop: -24,
    borderRadius: 16,
    elevation: 4,
  },
  aqiCardContent: {
    alignItems: 'center',
    padding: 16,
  },
  dateText: {
    fontSize: 16,
    color: '#78909c',
  },
  aqiContainer: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 2,
    elevation: 4,
  },
  aqiLabel: {
    fontSize: 16,
    color: '#546e7a',
    marginBottom: 8,
  },
  aqiValue: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#263238',
  },
  healthStatus: {
    fontSize: 20,
    fontWeight: '600',
    color: '#37474f',
    marginTop: 8,
  },
  card: {
    borderRadius: 16,
    marginBottom: 24,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#263238',
    marginBottom: 16,
  },
  tipsScroll: {
    marginVertical: 16,
    padding: 4,
  },
  tipCard: {
    width: 250,
    marginRight: 16,
    borderRadius: 12,
  },

  tip: {
    fontSize: 16,
    color: '#455a64',
    flex: 1,
  },
  forecastList: {
    marginBottom: 24,
    padding: 8,
  },
  forecastTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#263238',
    marginBottom: 16,
  },
  forecastCard: {
    width: 130,
    marginRight: 12,
    borderRadius: 16,
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
  forecastAQI: {
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  forecastAQIValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#263238',
  },
  forecastEmoji: {
    fontSize: 24,
    marginTop: 4,
  },
  forecastStatus: {
    fontSize: 12,
    textAlign: 'center',
    color: '#546e7a',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#1976d2',
  },
});

export default HomeScreen;
