import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, YoungSerif_400Regular } from '@expo-google-fonts/young-serif';
import { Figtree_400Regular, Figtree_600SemiBold, Figtree_800ExtraBold } from '@expo-google-fonts/figtree';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { COLORS, FONTS } from './src/theme';
import LoginScreen from './src/screens/LoginScreen';
import OtpScreen from './src/screens/OtpScreen';
import HomeScreen from './src/screens/HomeScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import StoreScreen from './src/screens/StoreScreen';
import CartScreen from './src/screens/CartScreen';
import TrackOrderScreen from './src/screens/TrackOrderScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: ['storefront', 'storefront-outline'],
  Orders: ['receipt', 'receipt-outline'],
  Profile: ['person-circle', 'person-circle-outline'],
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.sili,
        tabBarInactiveTintColor: COLORS.inkSoft,
        tabBarLabelStyle: { fontFamily: FONTS.semi, fontSize: 12 },
        tabBarStyle: { borderTopColor: COLORS.line, backgroundColor: COLORS.surface },
        tabBarIcon: ({ color, size, focused }) => {
          const [on, off] = TAB_ICONS[route.name];
          return <Ionicons name={focused ? on : off} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: COLORS.ink,
        headerTitleStyle: { fontFamily: FONTS.semi },
        headerStyle: { backgroundColor: COLORS.page },
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      {user ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen
            name="Store"
            component={StoreScreen}
            options={{ title: '', headerTransparent: true, headerTintColor: '#FFFFFF' }}
          />
          <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Your cart' }} />
          <Stack.Screen name="TrackOrder" component={TrackOrderScreen} options={{ title: 'Track order' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Otp" component={OtpScreen} options={{ title: '' }} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    YoungSerif_400Regular,
    Figtree_400Regular,
    Figtree_600SemiBold,
    Figtree_800ExtraBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.page }}>
        <ActivityIndicator color={COLORS.sili} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <NavigationContainer>
            <StatusBar style="dark" />
            <RootNavigator />
          </NavigationContainer>
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}