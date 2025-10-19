import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import DatePicker from 'react-native-date-picker';
import { seminationAPI } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';

const AddSeminationScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { scheduleLocalNotification } = useNotifications();
  const { cattle } = route.params;
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cattleId: cattle.id,
    seminationDate: new Date(),
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.seminationDate) {
      newErrors.seminationDate = 'Semination date is required';
    } else if (formData.seminationDate > new Date()) {
      newErrors.seminationDate = 'Semination date cannot be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateCheckDate = (seminationDate) => {
    const checkDate = new Date(seminationDate);
    checkDate.setDate(checkDate.getDate() + 15);
    return checkDate;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const submitData = {
        ...formData,
        seminationDate: formData.seminationDate.toISOString(),
      };

      const response = await seminationAPI.recordSemination(submitData);
      
      // Schedule local notification for 15-day check
      const checkDate = calculateCheckDate(formData.seminationDate);
      const notificationTime = new Date(checkDate);
      notificationTime.setHours(10, 0, 0, 0); // 10 AM

      await scheduleLocalNotification(
        'Pregnancy Check Due',
        `Pregnancy check is due for ${cattle.name} (${cattle.tagNumber})`,
        notificationTime,
        {
          type: 'PREGNANCY_CHECK_DUE',
          cattleId: cattle.id,
          cattleName: cattle.name,
          cattleTag: cattle.tagNumber,
        }
      );
      
      Alert.alert(
        'Success',
        'Semination recorded successfully. You will be reminded to check for pregnancy in 15 days.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error recording semination:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to record semination');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString();
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
              Record Semination
            </Text>
            <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              {cattle.name} (#{cattle.tagNumber})
            </Text>

            <View style={styles.form}>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Semination Details
              </Text>

              <Button
                mode="outlined"
                onPress={() => setShowDatePicker(true)}
                style={styles.dateButton}
                contentStyle={styles.dateButtonContent}
                icon="calendar"
              >
                {formatDate(formData.seminationDate)} at {formatTime(formData.seminationDate)}
              </Button>
              {errors.seminationDate && (
                <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.seminationDate}
                </Text>
              )}

              <TextInput
                label="Notes (Optional)"
                value={formData.notes}
                onChangeText={(text) => handleInputChange('notes', text)}
                style={styles.input}
                mode="outlined"
                multiline
                numberOfLines={3}
                placeholder="Add any additional notes about the semination..."
              />

              <View style={styles.infoBox}>
                <Text variant="bodyMedium" style={[styles.infoTitle, { color: theme.colors.primary }]}>
                  📅 Pregnancy Check Reminder
                </Text>
                <Text variant="bodySmall" style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
                  You will be reminded to check for pregnancy on{' '}
                  <Text style={{ fontWeight: 'bold' }}>
                    {formatDate(calculateCheckDate(formData.seminationDate))}
                  </Text>
                  {' '}at 10:00 AM
                </Text>
              </View>

              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.submitButton}
                contentStyle={styles.buttonContent}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={theme.colors.onPrimary} />
                ) : (
                  'Record Semination'
                )}
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <DatePicker
        modal
        open={showDatePicker}
        date={formData.seminationDate}
        mode="datetime"
        onConfirm={(date) => {
          setShowDatePicker(false);
          handleInputChange('seminationDate', date);
        }}
        onCancel={() => setShowDatePicker(false)}
        maximumDate={new Date()}
        title="Select Semination Date & Time"
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    elevation: 4,
    borderRadius: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
  },
  form: {
    gap: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  dateButton: {
    marginBottom: 4,
  },
  dateButtonContent: {
    justifyContent: 'flex-start',
    paddingVertical: 12,
  },
  errorText: {
    marginTop: -12,
    marginBottom: 8,
    marginLeft: 12,
  },
  input: {
    marginBottom: 4,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoText: {
    lineHeight: 20,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

export default AddSeminationScreen;
