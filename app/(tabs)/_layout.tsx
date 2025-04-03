import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Link, Tabs } from 'expo-router';
import { Pressable, useColorScheme, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { StatusBar } from 'expo-status-bar';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome5>['name'];
  color: string;
}) {
  return <FontAwesome5 size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const { currentTheme } = useTheme();

  if (!currentTheme) {
    return null; // Or a loading screen
  }

  return (
    <View style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: currentTheme.colors.accent,
          tabBarInactiveTintColor: currentTheme.colors.textSecondary,
          tabBarStyle: {
            backgroundColor: currentTheme.colors.background,
            borderTopColor: currentTheme.colors.border,
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          headerShown: false,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color }) => <TabBarIcon name="compass" color={color} />,
          }}
        />
        <Tabs.Screen
          name="leaderboard"
          options={{
            title: 'Leaderboard',
            tabBarIcon: ({ color }) => <TabBarIcon name="trophy" color={color} />,
          }}
        />
        <Tabs.Screen
          name="workouts"
          options={{
            title: 'Workouts',
            tabBarIcon: ({ color }) => <TabBarIcon name="dumbbell" color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}
