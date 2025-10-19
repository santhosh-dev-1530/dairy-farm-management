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
  RadioButton,
} from 'react-native-paper';
import { seminationAPI } from '../../services/api';

const PregnancyCheckScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { cattle, seminationRecord } = route.params;
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    isPregnant: null,
    notes: '',
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (formData.isPregnant === null) {
      newErrors.isPregnant = 'Please select pregnancy result';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const response = await seminationAPI.checkPregnancy(seminationRecord.id, formData);
      
      const resultText = formData.isPregnant ? 'pregnant' : 'not pregnant';
      const nextAction = formData.isPregnant 
        ? 'Pregnancy tracking has been started.' 
        : 'You can record another semination when ready.';
      
      Alert.alert(
        'Pregnancy Check Recorded',
        `${cattle.name} is ${resultText}. ${nextAction}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error recording pregnancy check:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to record pregnancy check');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
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
              Pregnancy Check
            </Text>
            <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              {cattle.name} (#{cattle.tagNumber})
            </Text>

            <View style={styles.infoBox}>
              <Text variant="bodyMedium" style={[styles.infoTitle, { color: theme.colors.primary }]}>
                📅 Check Due Today
              </Text>
              <Text variant="bodySmall" style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
                Semination was performed on {formatDate(seminationRecord.seminationDate)}. 
                Today is the 15th day - time to check for pregnancy.
              </Text>
            </View>

            <View style={styles.form}>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Pregnancy Result *
              </Text>

              <View style={styles.radioGroup}>
                <View style={styles.radioItem}>
                  <RadioButton
                    value="true"
                    status={formData.isPregnant === true ? 'checked' : 'unchecked'}
                    onPress={() => handleInputChange('isPregnant', true)}
                    color={theme.colors.primary}
                  />
                  <View style={styles.radioContent}>
                    <Text variant="titleMedium" style={[styles.radioLabel, { color: theme.colors.onSurface }]}>
                      ✅ Pregnant
                    </Text>
                    <Text variant="bodySmall" style={[styles.radioDescription, { color: theme.colors.onSurfaceVariant }]}>
                      Pregnancy confirmed - tracking will begin
                    </Text>
                  </View>
                </View>

                <View style={styles.radioItem}>
                  <RadioButton
                    value="false"
                    status={formData.isPregnant === false ? 'checked' : 'unchecked'}
                    onPress={() => handleInputChange('isPregnant', false)}
                    color={theme.colors.primary}
                  />
                  <View style={styles.radioContent}>
                    <Text variant="titleMedium" style={[styles.radioLabel, { color: theme.colors.onSurface }]}>
                      ❌ Not Pregnant
                    </Text>
                    <Text variant="bodySmall" style={[styles.radioDescription, { color: theme.colors.onSurfaceVariant }]}>
                      No pregnancy detected - can try again later
                    </Text>
                  </View>
                </View>
              </View>

              {errors.isPregnant && (
                <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.isPregnant}
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
                placeholder="Add any additional notes about the pregnancy check..."
              />

              {formData.isPregnant && (
                <View style={styles.pregnancyInfo}>
                  <Text variant="bodyMedium" style={[styles.pregnancyTitle, { color: theme.colors.tertiary }]}>
                    🎉 Pregnancy Confirmed!
                  </Text>
                  <Text variant="bodySmall" style={[styles.pregnancyText, { color: theme.colors.onSurfaceVariant }]}>
                    Pregnancy tracking will begin automatically. You'll receive reminders for important milestones.
                  </Text>
                </View>
              )}

              {formData.isPregnant === false && (
                <View style={styles.notPregnantInfo}>
                  <Text variant="bodyMedium" style={[styles.notPregnantTitle, { color: theme.colors.onSurfaceVariant }]}>
                    📝 Next Steps
                  </Text>
                  <Text variant="bodySmall" style={[styles.notPregnantText, { color: theme.colors.onSurfaceVariant }]}>
                    You can record another semination when the cattle is ready. Consider consulting with a veterinarian if needed.
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
                  'Record Result'
                )}
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
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
  infoBox: {
    backgroundColor: '#E8F5E8',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    marginBottom: 24,
  },
  infoTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoText: {
    lineHeight: 20,
  },
  form: {
    gap: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  radioGroup: {
    gap: 12,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  radioContent: {
    flex: 1,
    marginLeft: 8,
  },
  radioLabel: {
    fontWeight: '600',
    marginBottom: 2,
  },
  radioDescription: {
    lineHeight: 18,
  },
  errorText: {
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 12,
  },
  input: {
    marginBottom: 4,
  },
  pregnancyInfo: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  pregnancyTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  pregnancyText: {
    lineHeight: 20,
  },
  notPregnantInfo: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#9E9E9E',
  },
  notPregnantTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notPregnantText: {
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

export default PregnancyCheckScreen;
