import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Screens
import HomeScreen from '../screens/HomeScreen';
import TournamentsScreen from '../screens/TournamentsScreen';
import WalletScreen from '../screens/WalletScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TournamentDetailsScreen from '../screens/TournamentDetailsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TournamentStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="TournamentsList" 
        component={TournamentsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="TournamentDetails" 
        component={TournamentDetailsScreen}
        options={{ title: 'Tournament Details' }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Tournaments') {
              iconName = focused ? 'trophy' : 'trophy-outline';
            } else if (route.name === 'Wallet') {
              iconName = focused ? 'wallet' : 'wallet-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#3b82f6',
          tabBarInactiveTintColor: '#9ca3af',
          tabBarStyle: {
            backgroundColor: '#1f2937',
            borderTopColor: '#374151',
          },
          headerStyle: {
            backgroundColor: '#1f2937',
          },
          headerTintColor: '#fff',
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
        <Tab.Screen name="Tournaments" component={TournamentStack} options={{ headerShown: false }} />
        <Tab.Screen name="Wallet" component={WalletScreen} options={{ title: 'Wallet' }} />
        <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
