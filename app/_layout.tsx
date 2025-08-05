import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/components/AuthProvider';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="auth/login" 
          options={{ 
              presentation: 'modal',
              animationTypeForReplace: 'pop',
                   }} 
        />
        <Stack.Screen 
          name="auth/register" 
          options={{ 
              presentation: 'modal',
              animationTypeForReplace: 'pop'
          }} 
        />
        <Stack.Screen name="exam" />
        <Stack.Screen name="question" />
        <Stack.Screen name="errors" />
        <Stack.Screen name="favorites" />
        <Stack.Screen name="exam-history" />
        <Stack.Screen name="training/memory" />
        <Stack.Screen name="training/judgment" />
        <Stack.Screen name="training/reaction" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </AuthProvider>
  );
}