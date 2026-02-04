import React, {useEffect, useState} from 'react';
import {Modal, StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Button, Text, TextInput} from 'react-native-paper';
import DreamyBubble from './DreamyBubble';
import {getString} from '../i18n';
import useLanguage from '../i18n/useLanguage';

type Props = {
  visible: boolean;
  fieldLabel: string;
  text: string;
  loading?: boolean;
  onAccept: (text: string) => void;
  onDiscard: () => void;
};

export default function AiSuggestionModal({
  visible,
  fieldLabel,
  text,
  loading = false,
  onAccept,
  onDiscard,
}: Props) {
  const [value, setValue] = useState(text);
  const isLoading = Boolean(loading);
  const language = useLanguage();
  const isRTL = language === 'ar';
  const textAlignStyle = isRTL ? styles.textRtl : styles.textLtr;
  const inputContentStyle = [
    styles.inputContent,
    isRTL ? styles.inputContentRtl : styles.inputContentLtr,
  ];

  useEffect(() => {
    setValue(text);
  }, [text]);

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.backdrop}>
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
            {isLoading ? (
              <View style={styles.loadingContent}>
                <DreamyBubble size={140} />
                <Text variant="bodyMedium" style={[styles.loadingText, textAlignStyle]}>
                  {getString('labels.generatingSuggestion')}
                </Text>
              </View>
            ) : (
              <>
                <Text variant="titleMedium" style={[styles.title, textAlignStyle]}>
                  {getString('labels.aiSuggestionFor').replace(
                    '{fieldLabel}',
                    fieldLabel,
                  )}
                </Text>
                <TextInput
                  mode="outlined"
                  multiline
                  value={value}
                  onChangeText={setValue}
                  style={styles.input}
                  contentStyle={inputContentStyle}
                  outlineStyle={styles.inputOutline}
                />
                <View
                  style={[
                    styles.actions,
                    isRTL ? styles.actionsRtl : styles.actionsLtr,
                  ]}>
                  <Button mode="outlined" onPress={onDiscard} style={styles.button}>
                    {getString('buttons.discard')}
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => onAccept(value)}
                    style={styles.button}>
                    {getString('buttons.accept')}
                  </Button>
                </View>
              </>
            )}
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(17, 24, 39, 0.2)',
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
    padding: 16,
    gap: 12,
  },
  title: {
    color: '#111827',
  },
  input: {
    backgroundColor: 'transparent',
  },
  inputContent: {
    minHeight: 140,
  },
  inputContentLtr: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  inputContentRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  inputOutline: {
    borderRadius: 12,
    borderColor: '#E7E5FF',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionsLtr: {
    flexDirection: 'row',
  },
  actionsRtl: {
    flexDirection: 'row-reverse',
  },
  button: {
    flex: 1,
    borderRadius: 12,
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#111827',
  },
  textLtr: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  textRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
