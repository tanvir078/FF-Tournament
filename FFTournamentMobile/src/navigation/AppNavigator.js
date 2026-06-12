import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { usePlatformStore } from '../store/platformStore';
import { colors } from '../theme';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import TournamentsScreen from '../screens/TournamentsScreen';
import WalletScreen from '../screens/WalletScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TournamentDetailsScreen from '../screens/TournamentDetailsScreen';
import TeamsScreen from '../screens/TeamsScreen';
import MatchesScreen from '../screens/MatchesScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SupportScreen from '../screens/SupportScreen';
import ResultClaimScreen from '../screens/ResultClaimScreen';
import GameProfilesScreen from '../screens/GameProfilesScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TournamentsStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="TournamentList" component={TournamentsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TournamentDetails" component={TournamentDetailsScreen} options={{ title: 'Tournament' }} />
    </Stack.Navigator>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={tabIcons[route.name]} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Tournaments" component={TournamentsStack} options={{ headerShown: false }} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="Tabs" component={AppTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Teams" component={TeamsScreen} />
      <Stack.Screen name="Matches" component={MatchesScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="ResultClaim" component={ResultClaimScreen} options={{ title: 'Result claim' }} />
      <Stack.Screen name="GameProfiles" component={GameProfilesScreen} options={{ title: 'Game profiles' }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, hydrated, bootstrap } = useAuthStore();
  const loadPlatform = usePlatformStore((state) => state.load);

  useEffect(() => {
    bootstrap();
    loadPlatform();
  }, [bootstrap, loadPlatform]);

  if (!hydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <MainStack />
      ) : (
        <Stack.Navigator screenOptions={stackOptions}>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create account' }} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

const tabIcons = {
  Home: 'home-outline',
  Tournaments: 'trophy-outline',
  Wallet: 'wallet-outline',
  Profile: 'person-outline',
};

const stackOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.text,
  cardStyle: { backgroundColor: colors.background },
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
