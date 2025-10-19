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
  Switch,
  Chip,
} from 'react-native-paper';
import DatePicker from 'react-native-date-picker';
import { feedingAPI } from '../../services/api';

const AddFeedingScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { cattle } = route.params;
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cattleId: cattle.id,
    feedType: '',
    quantity: '',
    waterGiven: false,
    timestamp: new Date(),
  });
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  const feedTypes = [
    'Grass',
    'Hay',
    'Silage',
    'Concentrate',
    'Grain',
    'Mixed Feed',
    'Other',
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.feedType.trim()) {
      newErrors.feedType = 'Feed type is required';
    }
    
    if (!formData.quantity.trim()) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(parseFloat(formData.quantity)) || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const submitData = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        timestamp: formData.timestamp.toISOString(),
      };

      const response = await feedingAPI.recordFeeding(submitData);
      
      Alert.alert(
        'Success',
        'Feeding recorded successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error recording feeding:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to record feeding');
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
              Record Feeding
            </Text>
            <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              {cattle.name} (#{cattle.tagNumber})
            </Text>

            <View style={styles.form}>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Feeding Details
              </Text>

              <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
                Feed Type *
              </Text>
              <View style={styles.chipContainer}>
                {feedTypes.map((type) => (
                  <Chip
                    key={type}
                    selected={formData.feedType === type}
                    onPress={() => handleInputChange('feedType', type)}
                    style={[
                      styles.chip,
                      formData.feedType === type && { backgroundColor: theme.colors.primary }
                    ]}
                    textStyle={[
                      styles.chipText,
                      formData.feedType === type && { color: theme.colors.onPrimary }
                    ]}
                  >
                    {type}
                  </Chip>
                ))}
              </View>
              {errors.feedType && (
                <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.feedType}
                </Text>
              )}

              <TextInput
                label="Quantity (kg) *"
                value={formData.quantity}
                onChangeText={(text) => handleInputChange('quantity', text)}
                error={!!errors.quantity}
                style={styles.input}
                mode="outlined"
                left={<TextInput.Icon icon="scale" />}
                keyboardType="numeric"
                placeholder="Enter quantity in kilograms"
              />
              {errors.quantity && (
                <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.quantity}
                </Text>
              )}

              <View style={styles.switchContainer}>
                <Text variant="bodyMedium" style={[styles.switchLabel, { color: theme.colors.onSurface }]}>
                  Water Given
                </Text>
                <Switch
                  value={formData.waterGiven}
                  onValueChange={(value) => handleInputChange('waterGiven', value)}
                  color={theme.colors.primary}
                />
              </View>

              <Button
                mode="outlined"
                onPress={() => setShowDatePicker(true)}
                style={styles.dateButton}
                contentStyle={styles.dateButtonContent}
                icon="calendar"
              >
                {formatDate(formData.timestamp)} at {formatTime(formData.timestamp)}
              </Button>

              <Text variant="bodySmall" style={[styles.helpText, { color: theme.colors.onSurfaceVariant }]}>
                Tap to change the feeding time (defaults to now)
              </Text>

              <View style={styles.summaryBox}>
                <Text variant="bodyMedium" style={[styles.summaryTitle, { color: theme.colors.primary }]}>
                  📋 Feeding Summary
                </Text>
                <Text variant="bodySmall" style={[styles.summaryText, { color: theme.colors.onSurfaceVariant }]}>
                  {formData.feedType || 'Feed type'} • {formData.quantity || '0'} kg
                  {formData.waterGiven && ' • Water provided'}
                </Text>
                <Text variant="bodySmall" style={[styles.summaryTime, { color: theme.colors.onSurfaceVariant }]}>
                  {formatDate(formData.timestamp)} at {formatTime(formData.timestamp)}
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
                  'Record Feeding'
                )}
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <DatePicker
        modal
        open={showDatePicker}
        date={formData.timestamp}
        mode="datetime"
        onConfirm={(date) => {
          setShowDatePicker(false);
          handleInputChange('timestamp', date);
        }}
        onCancel={() => setShowDatePicker(false)}
        maximumDate={new Date()}
        title="Select Feeding Date & Time"
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
  label: {
    fontWeight: '500',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    marginBottom: 4,
  },
  chipText: {
    fontSize: 12,
  },
  errorText: {
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 12,
  },
  input: {
    marginBottom: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontWeight: '500',
  },
  dateButton: {
    marginBottom: 4,
  },
  dateButtonContent: {
    justifyContent: 'flex-start',
    paddingVertical: 12,
  },
  helpText: {
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 12,
    fontStyle: 'italic',
  },
  summaryBox: {
    backgroundColor: '#E8F5E8',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  summaryTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryText: {
    marginBottom: 2,
  },
  summaryTime: {
    fontStyle: 'italic',
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

export default AddFeedingScreen;
