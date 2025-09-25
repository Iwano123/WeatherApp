import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import * as Location from 'expo-location';

const WeatherScreen = () => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCelsius, setIsCelsius] = useState(true);
  const API_KEY = '2eaf4ec3fa4185388f9550092da4c633';

  const getWeatherIcon = (weatherCode) => {
    switch (weatherCode) {
      case '01d': return 'sunny';
      case '01n': return 'moon';
      case '02d': return 'partly-sunny';
      case '02n': return 'cloudy-night';
      case '03d':
      case '03n':
      case '04d':
      case '04n': return 'cloud';
      case '09d':
      case '09n': return 'rainy';
      case '10d': return 'rainy';
      case '10n': return 'rainy';
      case '11d':
      case '11n': return 'thunderstorm';
      case '13d':
      case '13n': return 'snow';
      case '50d':
      case '50n': return 'water';
      default: return 'cloud';
    }
  };

  const convertTemp = (temp) => {
    return isCelsius ? Math.round(temp) : Math.round((temp * 9/5) + 32);
  };

  const fetchWeather = async (city) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
      );
      setWeather(response.data);
      
      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
      );
      setForecast(forecastResponse.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const getLocationWeather = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${location.coords.latitude}&lon=${location.coords.longitude}&units=metric&appid=${API_KEY}`
      );
      setWeather(response.data);
      
      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${location.coords.latitude}&lon=${location.coords.longitude}&units=metric&appid=${API_KEY}`
      );
      setForecast(forecastResponse.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch location weather');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLocationWeather();
  }, []);

  if (loading && !weather) {
    return (
      <View style={{ flex: 1 }}>
        <LinearGradient colors={['#4A90E2', '#357ABD']} style={StyleSheet.absoluteFill}>
          <SafeAreaView style={styles.container}>
            <ActivityIndicator size="large" color="#fff" />
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  const getBackgroundColors = () => {
    if (!weather) return ['#4A90E2', '#357ABD'];
    
    const code = weather.weather[0].icon;
    if (code.includes('01d')) return ['#4A90E2', '#87CEEB']; // clear sky day
    if (code.includes('01n')) return ['#172B4D', '#304878']; // clear sky night
    if (code.includes('02') || code.includes('03') || code.includes('04')) return ['#4A90E2', '#B6B6B6']; // clouds
    if (code.includes('09') || code.includes('10')) return ['#4682B4', '#778899']; // rain
    if (code.includes('11')) return ['#2F4F4F', '#483D8B']; // thunderstorm
    if (code.includes('13')) return ['#B0C4DE', '#E6E6FA']; // snow
    if (code.includes('50')) return ['#B8B8B8', '#A9A9A9']; // mist
    return ['#4A90E2', '#357ABD'];
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={getBackgroundColors()} style={StyleSheet.absoluteFill}>
        <SafeAreaView style={styles.container}>
          <View style={styles.contentContainer}>
            <View style={styles.header}>
              <View style={styles.locationContainer}>
                <Ionicons name="location" size={24} color="#fff" />
                <Text style={styles.cityName}>{weather?.name || 'Loading...'}</Text>
                <TouchableOpacity onPress={getLocationWeather}>
                  <Ionicons name="refresh" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity 
                style={styles.tempToggle}
                onPress={() => setIsCelsius(!isCelsius)}
              >
                <Text style={styles.tempToggleText}>
                  {isCelsius ? '°C' : '°F'}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollViewContent}
              showsVerticalScrollIndicator={false}
            >
              {error && (
                <Text style={styles.error}>{error}</Text>
              )}

              {weather && (
                <View style={styles.weatherContainer}>
                  <Text style={styles.temperature}>
                    {convertTemp(weather.main.temp)}°
                  </Text>
                  <Text style={styles.description}>
                    {weather.weather[0].description}
                  </Text>
                  <View style={styles.details}>
                    <View style={styles.detailItem}>
                      <Ionicons name="water-outline" size={24} color="#fff" />
                      <Text style={styles.detailText}>
                        {weather.main.humidity}%
                      </Text>
                      <Text style={styles.detailLabel}>Humidity</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="speedometer-outline" size={24} color="#fff" />
                      <Text style={styles.detailText}>
                        {weather.wind.speed} m/s
                      </Text>
                      <Text style={styles.detailLabel}>Wind</Text>
                    </View>
                  </View>
                </View>
              )}

              {forecast && (
                <View style={styles.forecastContainer}>
                  <Text style={styles.forecastTitle}>Next 5 Days</Text>
                  <View style={styles.forecastList}>
                    {forecast.list.filter((item, index) => index % 8 === 0).map((item, index) => (
                      <View key={index} style={styles.forecastItem}>
                        <Text style={styles.forecastDay}>
                          {new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                        </Text>
                        <Ionicons 
                          name={getWeatherIcon(item.weather[0].icon)} 
                          size={24} 
                          color="#fff" 
                          style={styles.forecastIcon}
                        />
                        <Text style={styles.forecastTemp}>
                          {convertTemp(item.main.temp)}°
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search city..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={() => fetchWeather(searchQuery)}
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
              />
              <TouchableOpacity 
                style={styles.searchButton}
                onPress={() => fetchWeather(searchQuery)}
              >
                <Ionicons name="search" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginHorizontal: 10,
  },
  tempToggle: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tempToggleText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  weatherContainer: {
    alignItems: 'center',
    padding: 20,
  },
  temperature: {
    fontSize: 96,
    fontWeight: '200',
    color: '#fff',
    marginVertical: 10,
  },
  description: {
    fontSize: 24,
    color: '#fff',
    textTransform: 'capitalize',
    marginBottom: 30,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  detailItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 15,
    minWidth: 120,
  },
  detailText: {
    fontSize: 20,
    color: '#fff',
    marginTop: 5,
  },
  detailLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  error: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    margin: 10,
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    padding: 10,
    borderRadius: 10,
  },
  forecastContainer: {
    padding: 20,
  },
  forecastTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
  },
  forecastList: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
  },
  forecastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  forecastDay: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  forecastIcon: {
    flex: 1,
  },
  forecastTemp: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    textAlign: 'right',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 22,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#fff',
    marginRight: 10,
  },
  searchButton: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default WeatherScreen; 