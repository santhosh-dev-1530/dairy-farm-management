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
  Chip,
} from 'react-native-paper';
import DatePicker from 'react-native-date-picker';
import { healthAPI } from '../../services/api';

const AddHealthRecordScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { cattle } = route.params;
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cattleId: cattle.id,
    recordType: '',
    description: '',
    medication: '',
    dosage: '',
    timestamp: new Date(),
  });
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  const recordTypes = [
    { label: 'Disease', value: 'DISEASE', icon: '🦠' },
    { label: 'Injection', value: 'INJECTION', icon: '💉' },
    { label: 'Checkup', value: 'CHECKUP', icon: '🩺' },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.recordType) {
      newErrors.recordType = 'Record type is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
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
        timestamp: formData.timestamp.toISOString(),
      };

      const response = await healthAPI.recordHealthEvent(submitData);
      
      Alert.alert(
        'Success',
        'Health record created successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating health record:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create health record');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedRecordType = () => {
    return recordTypes.find(rt => rt.value === formData.recordType);
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
              Health Record
            </Text>
            <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              {cattle.name} (#{cattle.tagNumber})
            </Text>

            <View style={styles.form}>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Record Type *
              </Text>

              <View style={styles.chipContainer}>
                {recordTypes.map((type) => (
                  <Chip
                    key={type.value}
                    selected={formData.recordType === type.value}
                    onPress={() => handleInputChange('recordType', type.value)}
                    style={[
                      styles.chip,
                      formData.recordType === type.value && { backgroundColor: theme.colors.primary }
                    ]}
                    textStyle={[
                      styles.chipText,
                      formData.recordType === type.value && { color: theme.colors.onPrimary }
                    ]}
                  >
                    {type.icon} {type.label}
                  </Chip>
                ))}
              </View>
              {errors.recordType && (
                <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.recordType}
                </Text>
              )}

              <TextInput
                label="Description *"
                value={formData.description}
                onChangeText={(text) => handleInputChange('description', text)}
                error={!!errors.description}
                style={styles.input}
                mode="outlined"
                multiline
                numberOfLines={3}
                placeholder="Describe the health condition, symptoms, or treatment..."
              />
              {errors.description && (
                <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.description}
                </Text>
              )}

              <TextInput
                label="Medication (Optional)"
                value={formData.medication}
                onChangeText={(text) => handleInputChange('medication', text)}
                style={styles.input}
                mode="outlined"
                placeholder="Name of medication given"
              />

              <TextInput
                label="Dosage (Optional)"
                value={formData.dosage}
                onChangeText={(text) => handleInputChange('dosage', text)}
                style={styles.input}
                mode="outlined"
                placeholder="Dosage amount and frequency"
              />

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
                Tap to change the record time (defaults to now)
              </Text>

              {getSelectedRecordType() && (
                <View style={styles.infoBox}>
                  <Text variant="bodyMedium" style={[styles.infoTitle, { color: theme.colors.primary }]}>
                    {getSelectedRecordType().icon} {getSelectedRecordType().label} Record
                  </Text>
                  <Text variant="bodySmall" style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
                    {getSelectedRecordType().value === 'DISEASE' && 
                      'This will be recorded as a health alert and may trigger notifications to administrators.'}
                    {getSelectedRecordType().value === 'INJECTION' && 
                      'Record any vaccinations, treatments, or injections given to the cattle.'}
                    {getSelectedRecordType().value === 'CHECKUP' && 
                      'Record routine health checkups, examinations, or general health observations.'}
                  </Text>
                </View>
              )}

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
                  'Create Health Record'
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
        title="Select Record Date & Time"
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

export default AddHealthRecordScreen;
