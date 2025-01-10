import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <Image
        source={require('../assets/images/icon.png')}
        style={styles.logo}
      />
      <Text style={styles.title}>Coming Soon!</Text>
      <Text style={styles.subtitle}>
        We are working hard to bring you a great experience.
      </Text>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Stay tuned for updates!</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
  },
  footerText: {
    fontSize: 16,
    color: '#6c757d',
  },
});

export default App;
