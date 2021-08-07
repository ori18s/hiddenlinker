import * as React from 'react';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NativeBaseProvider, extendTheme } from "native-base";

import HomePage from './src/pages/HomePage/index';
import SettingPage from './src/pages/SettingPage/index';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const theme = extendTheme({
  components: {
    // Toast: {
    //   baseStyle: {},
    //   defaultProps: {},
    //   variants: {},
    // }
  } 
});

function HomeStack() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        // headerStyle: { backgroundColor: '#42f44b' },
        // headerTintColor: '#fff',
        // headerTitleStyle: { fontWeight: 'bold' },
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomePage}
        options={{ title: 'Home Page' }}
      />
    </Stack.Navigator>
  );
}

function SettingsStack() {
  return (
    <Stack.Navigator
      initialRouteName="Settings"
      screenOptions={{
        // headerStyle: { backgroundColor: '#42f44b' },
        // headerTintColor: '#fff',
        // headerTitleStyle: { fontWeight: 'bold' },
        headerShown: false,
      }}
      headerShown={false}
    >
      <Stack.Screen
        name="Settings"
        component={SettingPage}
        // options={{ title: 'Setting Page' }}
      />
    </Stack.Navigator>
  );
}

function App() {
  return (
    <NavigationContainer>
      <NativeBaseProvider theme={theme}>

        <Tab.Navigator
          initialRouteName="Feed"
          screenOptions={{
            tabBarStyle: [
              {
                "display": "flex"
              },
              null
            ]
          }}>
          <Tab.Screen
            name="HiddenLinker"
            component={HomeStack}
            options={{
              tabBarLabel: 'Home',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="home" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="SettingsStack"
            component={SettingsStack}
            options={{
              tabBarLabel: 'Settings',
              tabBarIcon: ({ color, size }) => (
                <Ionicons
                  name="settings"
                  color={color}
                  size={size}
                />
              ),
            }}
          />
        </Tab.Navigator>
      </NativeBaseProvider>
    </NavigationContainer>
  );
}

export default App;