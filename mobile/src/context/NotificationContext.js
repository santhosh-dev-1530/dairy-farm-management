import React, { createContext, useContext, useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { notificationAPI } from '../services/api';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    try {
      // Request permission for notifications
      const authStatus = await messaging().requestPermission();
      const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                     authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Notification permission granted');
        
        // Get FCM token
        const fcmToken = await messaging().getToken();
        console.log('FCM Token:', fcmToken);
        
        // Register device token with backend
        try {
          await notificationAPI.registerDevice(fcmToken);
        } catch (error) {
          console.error('Error registering device token:', error);
        }

        // Create notification channel for Android
        await notifee.createChannel({
          id: 'dairy_farm_notifications',
          name: 'Dairy Farm Notifications',
          importance: AndroidImportance.HIGH,
        });

        // Handle foreground messages
        const unsubscribe = messaging().onMessage(async remoteMessage => {
          console.log('Foreground message received:', remoteMessage);
          
          // Display local notification
          await notifee.displayNotification({
            title: remoteMessage.notification?.title,
            body: remoteMessage.notification?.body,
            data: remoteMessage.data,
            android: {
              channelId: 'dairy_farm_notifications',
              importance: AndroidImportance.HIGH,
            },
          });
        });

        return unsubscribe;
      } else {
        console.log('Notification permission denied');
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  const scheduleLocalNotification = async (title, body, scheduledDate, data = {}) => {
    try {
      await notifee.createTriggerNotification(
        {
          title,
          body,
          data,
          android: {
            channelId: 'dairy_farm_notifications',
            importance: AndroidImportance.HIGH,
          },
        },
        {
          type: notifee.TriggerType.TIMESTAMP,
          timestamp: scheduledDate.getTime(),
        }
      );
      console.log('Local notification scheduled for:', scheduledDate);
    } catch (error) {
      console.error('Error scheduling local notification:', error);
    }
  };

  const cancelScheduledNotification = async (notificationId) => {
    try {
      await notifee.cancelNotification(notificationId);
      console.log('Scheduled notification cancelled:', notificationId);
    } catch (error) {
      console.error('Error cancelling scheduled notification:', error);
    }
  };

  const value = {
    scheduleLocalNotification,
    cancelScheduledNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
