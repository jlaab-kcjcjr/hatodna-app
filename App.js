import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CartProvider } from './src/context/CartContext';
import { COLORS } from './src/theme';
import HomeScreen from './src/screens/HomeScreen';
import StoreScreen from './src/screens/StoreScreen';
import CartScreen from './src/screens/CartScreen';
import TrackOrderScreen from './src/screens/TrackOrderScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <CartProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: COLORS.surface },
              headerTintColor: COLORS.ash,
              headerTitleStyle: { fontWeight: '700' },
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Store" component={StoreScreen} options={{ title: 'Store' }} />
            <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Your cart' }} />
            <Stack.Screen
              name="TrackOrder"
              component={TrackOrderScreen}
              options={{ title: 'Track order', headerBackVisible: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </SafeAreaProvider>
  );
}