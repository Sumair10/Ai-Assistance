import React, {useEffect, useRef, useState} from 'react';
import {
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  findNodeHandle,
} from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import {Button, HelperText, Icon, Text, TextInput} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import type {RootState} from '../../redux/store';
import AiSuggestionModal from '../../components/AiSuggestionModal';
import {callOpenAI} from '../../services/openai/client';
import {submitApplication} from '../../services/api/mockSubmit';
import {
  employmentCircumstances,
  financialSituation,
  reasonForApplying,
} from '../../services/openai/prompts';
import {getString} from '../../i18n';
import useLanguage from '../../i18n/useLanguage';

const BOTTOM_BAR_HEIGHT = 72;
const HELP_GRADIENT_COLORS = ['#7C3AED', '#3B82F6'];

const GradientText = ({
  text,
  style,
}: {
  text: string;
  style?: React.ComponentProps<typeof Text>['style'];
}) => (
  <MaskedView
    maskElement={<Text style={[style, styles.gradientTextMask]}>{text}</Text>}>
    <LinearGradient
      colors={HELP_GRADIENT_COLORS}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}>
      <Text style={[style, styles.gradientTextHidden]}>{text}</Text>
    </LinearGradient>
  </MaskedView>
);

const InputWrapper = ({children}: {children: React.ReactNode}) => (
  <View style={styles.inputWrapper}>{children}</View>
);

export default function SituationDescriptionsScreen() {
  const dispatch = useDispatch();
  const language = useLanguage();
  const isRTL = language === 'ar';
  const textAlignStyle = isRTL ? styles.textRtl : styles.textLtr;
  const inputContentStyle = [
    styles.inputContent,
    styles.multilineContent,
    isRTL ? styles.inputContentRtl : styles.inputContentLtr,
  ];
  const scrollViewRef = useRef<ScrollView | null>(null);
  const reasonFieldRef = useRef<View | null>(null);
  const aiLoading = useSelector((state: RootState) => state.ai.loading);
  const aiError = useSelector((state: RootState) => state.ai.error);
  const wizardState = useSelector((state: RootState) => state.wizard);
  const situationDescriptions = useSelector(
    (state: RootState) => state.wizard.situationDescriptions,
  ) as Record<string, string>;
  const [modalVisible, setModalVisible] = useState(false);
  const [modalText, setModalText] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [reasonFocused, setReasonFocused] = useState(false);
  const [touchedFields, setTouchedFields] = useState({
    currentFinancialSituation: false,
    employmentCircumstances: false,
    reasonForApplying: false,
  });
  const [activeField, setActiveField] = useState<
    'currentFinancialSituation' | 'employmentCircumstances' | 'reasonForApplying'
  >('currentFinancialSituation');

  const activeFieldLabel =
    activeField === 'currentFinancialSituation'
      ? getString('fields.currentFinancialSituation')
      : activeField === 'employmentCircumstances'
        ? getString('fields.employmentCircumstances')
        : getString('fields.reasonForApplying');

  const markTouched = (
    field:
      | 'currentFinancialSituation'
      | 'employmentCircumstances'
      | 'reasonForApplying',
  ) => {
    setTouchedFields(prev => ({...prev, [field]: true}));
  };

  const currentFinancialSituationError = (() => {
    const value = (situationDescriptions.currentFinancialSituation ?? '').trim();
    if (!value) {
      return getString('errors.currentFinancialSituationRequired');
    }
    return null;
  })();

  const employmentCircumstancesError = (() => {
    const value = (situationDescriptions.employmentCircumstances ?? '').trim();
    if (!value) {
      return getString('errors.employmentCircumstancesRequired');
    }
    return null;
  })();

  const reasonForApplyingError = (() => {
    const value = (situationDescriptions.reasonForApplying ?? '').trim();
    if (!value) {
      return getString('errors.reasonForApplyingRequired');
    }
    return null;
  })();

  const isFormValid =
    !currentFinancialSituationError &&
    !employmentCircumstancesError &&
    !reasonForApplyingError;

  const shouldShowError = (field: keyof typeof touchedFields) =>
    (showErrors || touchedFields[field]) && Boolean(
      field === 'currentFinancialSituation'
        ? currentFinancialSituationError
        : field === 'employmentCircumstances'
          ? employmentCircumstancesError
          : reasonForApplyingError,
    );

  const openAiForField = async (
    field:
      | 'currentFinancialSituation'
      | 'employmentCircumstances'
      | 'reasonForApplying',
  ) => {
    setActiveField(field);
    setModalVisible(false);
    setModalText('');
    dispatch({type: 'ai/setLoading', payload: true});
    dispatch({type: 'ai/setError', payload: null});
    try {
      const context = situationDescriptions[field] || '';
      const prompt =
        field === 'currentFinancialSituation'
          ? financialSituation(context, language)
          : field === 'employmentCircumstances'
            ? employmentCircumstances(context, language)
            : reasonForApplying(context, language);
      const text = await callOpenAI(prompt);
      setModalText(text);
      setModalVisible(true);
      requestAnimationFrame(() => {
        dispatch({type: 'ai/setLoading', payload: false});
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'OpenAI request failed';
      dispatch({type: 'ai/setError', payload: message});
      dispatch({type: 'ai/setLoading', payload: false});
    } finally {
    }
  };

  const acceptSuggestion = (text: string) => {
    dispatch({
      type: 'wizard/updateSituationDescriptions',
      payload: {[activeField]: text},
    });
    setModalVisible(false);
  };

  const submit = async () => {
    await submitApplication(wizardState);
    dispatch({type: 'wizard/setCurrentStep', payload: 4});
  };

  const scrollToField = (fieldRef: React.RefObject<View>) => {
    const scrollView = scrollViewRef.current;
    const field = fieldRef.current;
    if (!scrollView || !field) {
      return;
    }
    const scrollNode = findNodeHandle(scrollView);
    if (!scrollNode) {
      return;
    }
    requestAnimationFrame(() => {
      field.measureLayout(
        scrollNode,
        (_x, y) => {
          scrollView.scrollTo({y: Math.max(0, y - 48), animated: true});
        },
        () => undefined,
      );
    });
  };

  useEffect(() => {
    const subscription = Keyboard.addListener('keyboardDidShow', () => {
      if (reasonFocused) {
        requestAnimationFrame(() => scrollToField(reasonFieldRef));
      }
    });
    return () => subscription.remove();
  }, [reasonFocused]);

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? BOTTOM_BAR_HEIGHT - 12 : 0}>
      <LinearGradient
        pointerEvents="none"
        colors={['#EAF7FF', '#F1E9FF', '#FFFFFF']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.background}
      />
      <ScrollView
        ref={scrollViewRef}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={styles.container}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        >
        <View>
          <Text variant="titleLarge" style={[styles.title, textAlignStyle]}>
            {getString('titles.situationDescriptions')}
          </Text>
          <Text variant="bodyMedium" style={[styles.subtitle, textAlignStyle]}>
            {getString('descriptions.situationDescriptions')}
          </Text>
          <View style={styles.form}>
            <LinearGradient
              colors={['#BFEFFF', '#E3D2FF']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={[styles.fieldGroup, styles.fieldCardGradient]}>
              <View style={styles.fieldCardInner}>
              <View
                style={[
                  styles.fieldHeaderRow,
                  isRTL ? styles.fieldHeaderRowRtl : styles.fieldHeaderRowLtr,
                ]}>
                <Text
                  variant="labelLarge"
                  style={[styles.fieldLabel, textAlignStyle]}>
                  {getString('fields.currentFinancialSituation')}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={getString('buttons.helpMeWrite')}
                  onPress={() => openAiForField('currentFinancialSituation')}
                  style={[
                    styles.helpLink,
                    isRTL ? styles.helpLinkRtl : styles.helpLinkLtr,
                  ]}
                  hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                  <Icon
                    source="magic-staff"
                    size={16}
                    color={HELP_GRADIENT_COLORS[0]}
                  />
                  <GradientText
                    text={getString('buttons.helpMeWrite')}
                    style={[styles.helpLinkText, textAlignStyle]}
                  />
                </Pressable>
              </View>
              <InputWrapper>
                <TextInput
                  multiline
                  numberOfLines={4}
                  accessibilityLabel={getString('fields.currentFinancialSituation')}
                  placeholder={getString('fields.currentFinancialSituation')}
                  mode="outlined"
                  value={situationDescriptions.currentFinancialSituation ?? ''}
                  onChangeText={text =>
                    dispatch({
                      type: 'wizard/updateSituationDescriptions',
                      payload: {currentFinancialSituation: text},
                    })
                  }
                  onBlur={() => markTouched('currentFinancialSituation')}
                  style={styles.input}
                  contentStyle={inputContentStyle}
                  outlineStyle={styles.inputOutline}
                  error={shouldShowError('currentFinancialSituation')}
                />
              </InputWrapper>
              {shouldShowError('currentFinancialSituation') ? (
                <HelperText type="error" style={styles.errorText}>
                  {currentFinancialSituationError ?? ''}
                </HelperText>
              ) : null}
              </View>
            </LinearGradient>
            <LinearGradient
              colors={['#BFEFFF', '#E3D2FF']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={[styles.fieldGroup, styles.fieldCardGradient]}>
              <View style={styles.fieldCardInner}>
              <View
                style={[
                  styles.fieldHeaderRow,
                  isRTL ? styles.fieldHeaderRowRtl : styles.fieldHeaderRowLtr,
                ]}>
                <Text
                  variant="labelLarge"
                  style={[styles.fieldLabel, textAlignStyle]}>
                  {getString('fields.employmentCircumstances')}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={getString('buttons.helpMeWrite')}
                  onPress={() => openAiForField('employmentCircumstances')}
                  style={[
                    styles.helpLink,
                    isRTL ? styles.helpLinkRtl : styles.helpLinkLtr,
                  ]}
                  hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                  <Icon
                    source="magic-staff"
                    size={16}
                    color={HELP_GRADIENT_COLORS[0]}
                  />
                  <GradientText
                    text={getString('buttons.helpMeWrite')}
                    style={[styles.helpLinkText, textAlignStyle]}
                  />
                </Pressable>
              </View>
              <InputWrapper>
                <TextInput
                  multiline
                  numberOfLines={4}
                  accessibilityLabel={getString('fields.employmentCircumstances')}
                  placeholder={getString('fields.employmentCircumstances')}
                  mode="outlined"
                  value={situationDescriptions.employmentCircumstances ?? ''}
                  onChangeText={text =>
                    dispatch({
                      type: 'wizard/updateSituationDescriptions',
                      payload: {employmentCircumstances: text},
                    })
                  }
                  onBlur={() => markTouched('employmentCircumstances')}
                  style={styles.input}
                  contentStyle={inputContentStyle}
                  outlineStyle={styles.inputOutline}
                  error={shouldShowError('employmentCircumstances')}
                />
              </InputWrapper>
              {shouldShowError('employmentCircumstances') ? (
                <HelperText type="error" style={styles.errorText}>
                  {employmentCircumstancesError ?? ''}
                </HelperText>
              ) : null}
              </View>
            </LinearGradient>
            <LinearGradient
              colors={['#BFEFFF', '#E3D2FF']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={[styles.fieldGroup, styles.fieldCardGradient]}>
              <View style={styles.fieldCardInner}>
              <View
                style={[
                  styles.fieldHeaderRow,
                  isRTL ? styles.fieldHeaderRowRtl : styles.fieldHeaderRowLtr,
                ]}>
                <Text
                  variant="labelLarge"
                  style={[styles.fieldLabel, textAlignStyle]}>
                  {getString('fields.reasonForApplying')}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={getString('buttons.helpMeWrite')}
                  onPress={() => openAiForField('reasonForApplying')}
                  style={[
                    styles.helpLink,
                    isRTL ? styles.helpLinkRtl : styles.helpLinkLtr,
                  ]}
                  hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                  <Icon
                    source="magic-staff"
                    size={16}
                    color={HELP_GRADIENT_COLORS[0]}
                  />
                  <GradientText
                    text={getString('buttons.helpMeWrite')}
                    style={[styles.helpLinkText, textAlignStyle]}
                  />
                </Pressable>
              </View>
              <View ref={reasonFieldRef}>
                <InputWrapper>
                <TextInput
                  multiline
                  numberOfLines={4}
                  accessibilityLabel={getString('fields.reasonForApplying')}
                  placeholder={getString('fields.reasonForApplying')}
                  mode="outlined"
                  value={situationDescriptions.reasonForApplying ?? ''}
                  onChangeText={text =>
                    dispatch({
                      type: 'wizard/updateSituationDescriptions',
                      payload: {reasonForApplying: text},
                    })
                  }
                  onFocus={() => {
                    setReasonFocused(true);
                    scrollToField(reasonFieldRef);
                  }}
                  onBlur={() => {
                    setReasonFocused(false);
                    markTouched('reasonForApplying');
                  }}
                  style={styles.input}
                  contentStyle={inputContentStyle}
                  outlineStyle={styles.inputOutline}
                  error={shouldShowError('reasonForApplying')}
                />
                </InputWrapper>
              </View>
              {shouldShowError('reasonForApplying') ? (
                <HelperText type="error" style={styles.errorText}>
                  {reasonForApplyingError ?? ''}
                </HelperText>
              ) : null}
              </View>
            </LinearGradient>
            <View style={styles.feedbackRow}>
              {aiError ? (
                <HelperText type="error" style={styles.errorText}>
                  {getString('errors.aiFailed')}
                </HelperText>
              ) : null}
            </View>
          </View>
          <AiSuggestionModal
            visible={modalVisible || aiLoading}
            fieldLabel={activeFieldLabel}
            text={modalText}
            loading={aiLoading}
            onAccept={acceptSuggestion}
            onDiscard={() => setModalVisible(false)}
          />
        </View>
      </ScrollView>
      <View style={styles.bottomBar}>
        <View
          style={[
            styles.bottomBarActions,
            isRTL ? styles.bottomBarActionsRtl : styles.bottomBarActionsLtr,
          ]}>
          <Button
            mode="contained"
            buttonColor="#000000"
            textColor="#FFFFFF"
            onPress={() => {
              if (!isFormValid) {
                setShowErrors(true);
                return;
              }
              submit();
            }}
            style={styles.primaryButton}
            contentStyle={styles.primaryButtonContent}>
            {getString('buttons.submit')}
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F6F5FF',
  },
  container: {
    paddingTop: 16,
    paddingBottom: BOTTOM_BAR_HEIGHT + 16,
    paddingHorizontal: 24,
    backgroundColor: 'transparent',
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 16,
    color: '#6B7280',
  },
  form: {
    gap: 12,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldCardGradient: {
    borderRadius: 16,
    padding: 1,
    shadowColor: '#7C3AED',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  fieldCardInner: {
    borderRadius: 15,
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  fieldLabel: {
    color: '#111827',
  },
  fieldHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  fieldHeaderRowLtr: {
    flexDirection: 'row',
  },
  fieldHeaderRowRtl: {
    flexDirection: 'row-reverse',
  },
  input: {
    backgroundColor: 'transparent',
  },
  inputWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E7E5FF',
    shadowColor: '#6D28D9',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  inputContent: {
    minHeight: 48,
  },
  inputContentLtr: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  inputContentRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  multilineContent: {
    minHeight: 120,
  },
  inputOutline: {
    borderRadius: 12,
    borderColor: '#E5E7EB',
  },
  helpLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  helpLinkLtr: {
    flexDirection: 'row',
  },
  helpLinkRtl: {
    flexDirection: 'row-reverse',
  },
  helpLinkText: {
    fontSize: 13,
    fontWeight: '600',
  },
  gradientTextMask: {
    color: '#000000',
  },
  gradientTextHidden: {
    opacity: 0,
  },
  feedbackRow: {
    minHeight: 24,
  },
  primaryButton: {
    borderRadius: 12,
    flex: 1,
  },
  primaryButtonContent: {
    paddingVertical: 6,
  },
  secondaryButton: {
    borderRadius: 12,
    flex: 1,
  },
  secondaryButtonContent: {
    paddingVertical: 6,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    paddingBottom: 30,
    minHeight: BOTTOM_BAR_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomBarActions: {
    flexDirection: 'row',
    gap: 12,
  },
  bottomBarActionsLtr: {
    flexDirection: 'row',
  },
  bottomBarActionsRtl: {
    flexDirection: 'row-reverse',
  },
  textLtr: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  textRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  errorText: {
    marginTop: 2,
    paddingVertical: 0,
  },
});
