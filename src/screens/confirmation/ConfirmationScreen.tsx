import React from 'react';
import {StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Button, Text} from 'react-native-paper';
import {useDispatch} from 'react-redux';
import {clearWizardDraft} from '../../services/storage/wizardStorage';
import {getString} from '../../i18n';
import useLanguage from '../../i18n/useLanguage';

export default function ConfirmationScreen() {
  const dispatch = useDispatch();
  const language = useLanguage();
  const isRTL = language === 'ar';
  const textAlignStyle = isRTL ? styles.textRtl : styles.textLtr;
  const startNew = async () => {
    await clearWizardDraft();
    dispatch({type: 'wizard/resetWizard'});
    dispatch({type: 'wizard/setCurrentStep', payload: 1});
  };
  return (
    <View style={styles.screen}>
      <LinearGradient
        pointerEvents="none"
        colors={['#EAF7FF', '#F1E9FF', '#FFFFFF']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.background}
      />
      <LinearGradient
        colors={['#BFEFFF', '#E3D2FF']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.cardGradient}>
        <View style={styles.card}>
          <Text
            variant="titleMedium"
            style={[styles.message, textAlignStyle]}
            accessibilityRole="text"
            accessibilityLabel={getString('confirmation.message')}>
            {getString('confirmation.message')}
          </Text>
          <Button
            mode="contained"
            onPress={startNew}
            style={styles.button}>
            {getString('buttons.startNewApplication')}
          </Button>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#F6F5FF',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  cardGradient: {
    borderRadius: 20,
    padding: 1,
  },
  card: {
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    padding: 20,
    gap: 16,
  },
  message: {
    color: '#111827',
    textAlign: 'center',
  },
  textLtr: {
    writingDirection: 'ltr',
  },
  textRtl: {
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  button: {
    borderRadius: 12,
  },
});
