import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Button, HelperText, Menu, Text, TextInput} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import type {RootState} from '../../redux/store';
import {getString} from '../../i18n';
import en from '../../i18n/en.json';
import ar from '../../i18n/ar.json';
import useLanguage from '../../i18n/useLanguage';

const BOTTOM_BAR_HEIGHT = 72;
const TEXT_MIN_LENGTH = 2;
const TEXT_MAX_LENGTH = 60;
const MAX_DEPENDENTS = 20;
const MAX_MONTHLY_INCOME = 1000000;
const EN_STRINGS = en as Record<string, string>;
const AR_STRINGS = ar as Record<string, string>;
const MARITAL_OPTION_KEYS = [
  'options.maritalSingle',
  'options.maritalMarried',
  'options.maritalDivorced',
  'options.maritalWidowed',
] as const;
const EMPLOYMENT_OPTION_KEYS = [
  'options.employmentEmployed',
  'options.employmentSelfEmployed',
  'options.employmentUnemployed',
  'options.employmentStudent',
  'options.employmentRetired',
] as const;
const HOUSING_OPTION_KEYS = [
  'options.housingOwned',
  'options.housingRented',
  'options.housingFamily',
  'options.housingEmployer',
] as const;

const InputWrapper = ({children}: {children: React.ReactNode}) => (
  <View style={styles.inputWrapper}>{children}</View>
);

const isWholeNumber = (value: string) => /^\d+$/.test(value);
const isValidMoney = (value: string) => /^\d+(\.\d{1,2})?$/.test(value);
const resolveOptionKey = (value: string | undefined, keys: readonly string[]) => {
  if (!value) {
    return null;
  }
  if (value.startsWith('options.')) {
    return keys.includes(value) ? value : null;
  }
  for (const key of keys) {
    if (EN_STRINGS[key] === value || AR_STRINGS[key] === value) {
      return key;
    }
  }
  return null;
};

const resolveOptionLabel = (value: string | undefined, keys: readonly string[]) => {
  const key = resolveOptionKey(value, keys);
  if (key) {
    return getString(key);
  }
  return value ?? '';
};

export default function FamilyFinancialScreen() {
  const dispatch = useDispatch();
  const language = useLanguage();
  const isRTL = language === 'ar';
  const textAlignStyle = isRTL ? styles.textRtl : styles.textLtr;
  const inputContentStyle = [
    styles.inputContent,
    isRTL ? styles.inputContentRtl : styles.inputContentLtr,
  ];
  const getSingleIconProps = (iconName: string) => ({
    left: isRTL ? undefined : <TextInput.Icon icon={iconName} />,
    right: isRTL ? <TextInput.Icon icon={iconName} /> : undefined,
  });
  const getSwappedIconProps = (leftIcon: string, rightIcon: string) => ({
    left: isRTL ? <TextInput.Icon icon={rightIcon} /> : <TextInput.Icon icon={leftIcon} />,
    right: isRTL ? <TextInput.Icon icon={leftIcon} /> : <TextInput.Icon icon={rightIcon} />,
  });
  const menuIcons = getSwappedIconProps('heart', 'chevron-down');
  const employmentMenuIcons = getSwappedIconProps('briefcase', 'chevron-down');
  const housingMenuIcons = getSwappedIconProps('home', 'chevron-down');
  const [showErrors, setShowErrors] = useState(false);
  const [showMaritalStatusMenu, setShowMaritalStatusMenu] = useState(false);
  const [maritalMenuWidth, setMaritalMenuWidth] = useState<number | null>(null);
  const [showEmploymentStatusMenu, setShowEmploymentStatusMenu] =
    useState(false);
  const [employmentMenuWidth, setEmploymentMenuWidth] = useState<number | null>(
    null,
  );
  const [showHousingStatusMenu, setShowHousingStatusMenu] = useState(false);
  const [housingMenuWidth, setHousingMenuWidth] = useState<number | null>(null);
  const [touchedFields, setTouchedFields] = useState({
    maritalStatus: false,
    dependents: false,
    employmentStatus: false,
    monthlyIncome: false,
    housingStatus: false,
  });
  const familyFinancialInfo = useSelector(
    (state: RootState) => state.wizard.familyFinancialInfo,
  ) as Record<string, string>;

  const markTouched = (
    field:
      | 'maritalStatus'
      | 'dependents'
      | 'employmentStatus'
      | 'monthlyIncome'
      | 'housingStatus',
  ) => {
    setTouchedFields(prev => ({...prev, [field]: true}));
  };

  const maritalStatusError = (() => {
    const value = resolveOptionLabel(
      familyFinancialInfo.maritalStatus,
      MARITAL_OPTION_KEYS,
    ).trim();
    if (!value) {
      return getString('errors.maritalStatusRequired');
    }
    if (value.length < TEXT_MIN_LENGTH) {
      return getString('errors.maritalStatusMin').replace(
        '{min}',
        String(TEXT_MIN_LENGTH),
      );
    }
    if (value.length > TEXT_MAX_LENGTH) {
      return getString('errors.maritalStatusMax').replace(
        '{max}',
        String(TEXT_MAX_LENGTH),
      );
    }
    return null;
  })();

  const dependentsError = (() => {
    const value = (familyFinancialInfo.dependents ?? '').trim();
    if (!value) {
      return getString('errors.dependentsRequired');
    }
    if (!isWholeNumber(value)) {
      return getString('errors.dependentsInvalid');
    }
    const count = Number(value);
    if (count < 0 || count > MAX_DEPENDENTS) {
      return getString('errors.dependentsRange')
        .replace('{min}', '0')
        .replace('{max}', String(MAX_DEPENDENTS));
    }
    return null;
  })();

  const employmentStatusError = (() => {
    const value = resolveOptionLabel(
      familyFinancialInfo.employmentStatus,
      EMPLOYMENT_OPTION_KEYS,
    ).trim();
    if (!value) {
      return getString('errors.employmentStatusRequired');
    }
    if (value.length < TEXT_MIN_LENGTH) {
      return getString('errors.employmentStatusMin').replace(
        '{min}',
        String(TEXT_MIN_LENGTH),
      );
    }
    if (value.length > TEXT_MAX_LENGTH) {
      return getString('errors.employmentStatusMax').replace(
        '{max}',
        String(TEXT_MAX_LENGTH),
      );
    }
    return null;
  })();

  const monthlyIncomeError = (() => {
    const value = (familyFinancialInfo.monthlyIncome ?? '').trim();
    if (!value) {
      return getString('errors.monthlyIncomeRequired');
    }
    if (!isValidMoney(value)) {
      return getString('errors.monthlyIncomeInvalid');
    }
    const amount = Number(value);
    if (amount <= 0 || amount > MAX_MONTHLY_INCOME) {
      return getString('errors.monthlyIncomeRange')
        .replace('{min}', '1')
        .replace('{max}', String(MAX_MONTHLY_INCOME));
    }
    return null;
  })();

  const housingStatusError = (() => {
    const value = resolveOptionLabel(
      familyFinancialInfo.housingStatus,
      HOUSING_OPTION_KEYS,
    ).trim();
    if (!value) {
      return getString('errors.housingStatusRequired');
    }
    if (value.length < TEXT_MIN_LENGTH) {
      return getString('errors.housingStatusMin').replace(
        '{min}',
        String(TEXT_MIN_LENGTH),
      );
    }
    if (value.length > TEXT_MAX_LENGTH) {
      return getString('errors.housingStatusMax').replace(
        '{max}',
        String(TEXT_MAX_LENGTH),
      );
    }
    return null;
  })();

  const isFormValid =
    !maritalStatusError &&
    !dependentsError &&
    !employmentStatusError &&
    !monthlyIncomeError &&
    !housingStatusError;

  const shouldShowError = (field: keyof typeof touchedFields) =>
    (showErrors || touchedFields[field]) && Boolean(
      field === 'maritalStatus'
        ? maritalStatusError
        : field === 'dependents'
          ? dependentsError
          : field === 'employmentStatus'
            ? employmentStatusError
            : field === 'monthlyIncome'
              ? monthlyIncomeError
              : housingStatusError,
    );

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
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={styles.container}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}>
        <View>
          <Text variant="titleLarge" style={[styles.title, textAlignStyle]}>
            {getString('titles.familyFinancial')}
          </Text>
          <Text variant="bodyMedium" style={[styles.subtitle, textAlignStyle]}>
            {getString('descriptions.familyFinancial')}
          </Text>
          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text variant="labelLarge" style={[styles.fieldLabel, textAlignStyle]}>
                {getString('fields.maritalStatus')}
              </Text>
              <Menu
                visible={showMaritalStatusMenu}
                onDismiss={() => setShowMaritalStatusMenu(false)}
                style={[
                  styles.menu,
                  maritalMenuWidth ? {width: maritalMenuWidth} : null,
                ]}
                contentStyle={styles.menuContent}
                anchor={
                  <Pressable
                    onLayout={event =>
                      setMaritalMenuWidth(event.nativeEvent.layout.width)
                    }
                    onPress={() => setShowMaritalStatusMenu(true)}
                    onPressIn={() => markTouched('maritalStatus')}>
                    <InputWrapper>
                      <TextInput
                        accessibilityLabel={getString('fields.maritalStatus')}
                        placeholder={getString('fields.maritalStatus')}
                        mode="outlined"
                        value={resolveOptionLabel(
                          familyFinancialInfo.maritalStatus,
                          MARITAL_OPTION_KEYS,
                        )}
                        editable={false}
                        showSoftInputOnFocus={false}
                        pointerEvents="none"
                        style={styles.input}
                        contentStyle={inputContentStyle}
                        outlineStyle={styles.inputOutline}
                        left={menuIcons.left}
                        right={menuIcons.right}
                        error={shouldShowError('maritalStatus')}
                      />
                    </InputWrapper>
                  </Pressable>
                }>
                <Menu.Item
                  title={getString('options.maritalSingle')}
                  titleStyle={[styles.menuItemTitle, textAlignStyle]}
                  onPress={() => {
                    dispatch({
                      type: 'wizard/updateFamilyFinancialInfo',
                      payload: {maritalStatus: 'options.maritalSingle'},
                    });
                    markTouched('maritalStatus');
                    setShowMaritalStatusMenu(false);
                  }}
                />
                <Menu.Item
                  title={getString('options.maritalMarried')}
                  titleStyle={[styles.menuItemTitle, textAlignStyle]}
                  onPress={() => {
                    dispatch({
                      type: 'wizard/updateFamilyFinancialInfo',
                      payload: {
                        maritalStatus: 'options.maritalMarried',
                      },
                    });
                    markTouched('maritalStatus');
                    setShowMaritalStatusMenu(false);
                  }}
                />
                <Menu.Item
                  title={getString('options.maritalDivorced')}
                  titleStyle={[styles.menuItemTitle, textAlignStyle]}
                  onPress={() => {
                    dispatch({
                      type: 'wizard/updateFamilyFinancialInfo',
                      payload: {
                        maritalStatus: 'options.maritalDivorced',
                      },
                    });
                    markTouched('maritalStatus');
                    setShowMaritalStatusMenu(false);
                  }}
                />
                <Menu.Item
                  title={getString('options.maritalWidowed')}
                  titleStyle={[styles.menuItemTitle, textAlignStyle]}
                  onPress={() => {
                    dispatch({
                      type: 'wizard/updateFamilyFinancialInfo',
                      payload: {
                        maritalStatus: 'options.maritalWidowed',
                      },
                    });
                    markTouched('maritalStatus');
                    setShowMaritalStatusMenu(false);
                  }}
                />
              </Menu>
              {shouldShowError('maritalStatus') ? (
                <HelperText type="error" style={styles.errorText}>
                  {maritalStatusError ?? ''}
                </HelperText>
              ) : null}
            </View>
            <View style={styles.fieldGroup}>
              <Text variant="labelLarge" style={[styles.fieldLabel, textAlignStyle]}>
                {getString('fields.dependents')}
              </Text>
              <InputWrapper>
                <TextInput
                  accessibilityLabel={getString('fields.dependents')}
                  placeholder="0"
                  mode="outlined"
                  value={familyFinancialInfo.dependents ?? ''}
                  onChangeText={(text: string) =>
                    dispatch({
                      type: 'wizard/updateFamilyFinancialInfo',
                      payload: {dependents: text},
                    })
                  }
                  onBlur={() => markTouched('dependents')}
                  style={styles.input}
                  contentStyle={inputContentStyle}
                  outlineStyle={styles.inputOutline}
                  keyboardType="number-pad"
                  {...getSingleIconProps('account-multiple')}
                  error={shouldShowError('dependents')}
                />
              </InputWrapper>
              {shouldShowError('dependents') ? (
                <HelperText type="error" style={styles.errorText}>
                  {dependentsError ?? ''}
                </HelperText>
              ) : null}
            </View>
            <View style={styles.fieldGroup}>
              <Text variant="labelLarge" style={[styles.fieldLabel, textAlignStyle]}>
                {getString('fields.employmentStatus')}
              </Text>
              <Menu
                visible={showEmploymentStatusMenu}
                onDismiss={() => setShowEmploymentStatusMenu(false)}
                style={[
                  styles.menu,
                  employmentMenuWidth ? {width: employmentMenuWidth} : null,
                ]}
                contentStyle={styles.menuContent}
                anchor={
                  <Pressable
                    onLayout={event =>
                      setEmploymentMenuWidth(event.nativeEvent.layout.width)
                    }
                    onPress={() => setShowEmploymentStatusMenu(true)}
                    onPressIn={() => markTouched('employmentStatus')}>
                    <InputWrapper>
                      <TextInput
                        accessibilityLabel={getString('fields.employmentStatus')}
                        placeholder={getString('fields.employmentStatus')}
                        mode="outlined"
                        value={resolveOptionLabel(
                          familyFinancialInfo.employmentStatus,
                          EMPLOYMENT_OPTION_KEYS,
                        )}
                        editable={false}
                        showSoftInputOnFocus={false}
                        pointerEvents="none"
                        style={styles.input}
                        contentStyle={inputContentStyle}
                        outlineStyle={styles.inputOutline}
                        left={employmentMenuIcons.left}
                        right={employmentMenuIcons.right}
                        error={shouldShowError('employmentStatus')}
                      />
                    </InputWrapper>
                  </Pressable>
                }>
                <Menu.Item
                  title={getString('options.employmentEmployed')}
                  titleStyle={[styles.menuItemTitle, textAlignStyle]}
                  onPress={() => {
                    dispatch({
                      type: 'wizard/updateFamilyFinancialInfo',
                      payload: {
                        employmentStatus: 'options.employmentEmployed',
                      },
                    });
                    markTouched('employmentStatus');
                    setShowEmploymentStatusMenu(false);
                  }}
                />
                <Menu.Item
                  title={getString('options.employmentSelfEmployed')}
                  titleStyle={[styles.menuItemTitle, textAlignStyle]}
                  onPress={() => {
                    dispatch({
                      type: 'wizard/updateFamilyFinancialInfo',
                      payload: {
                        employmentStatus: 'options.employmentSelfEmployed',
                      },
                    });
                    markTouched('employmentStatus');
                    setShowEmploymentStatusMenu(false);
                  }}
                />
                <Menu.Item
                  title={getString('options.employmentUnemployed')}
                  titleStyle={[styles.menuItemTitle, textAlignStyle]}
                  onPress={() => {
                    dispatch({
                      type: 'wizard/updateFamilyFinancialInfo',
                      payload: {
                        employmentStatus: 'options.employmentUnemployed',
                      },
                    });
                    markTouched('employmentStatus');
                    setShowEmploymentStatusMenu(false);
                  }}
                />
                <Menu.Item
                  title={getString('options.employmentStudent')}
                  titleStyle={[styles.menuItemTitle, textAlignStyle]}
                  onPress={() => {
                    dispatch({
                      type: 'wizard/updateFamilyFinancialInfo',
                      payload: {
                        employmentStatus: 'options.employmentStudent',
                      },
                    });
                    markTouched('employmentStatus');
                    setShowEmploymentStatusMenu(false);
                  }}
                />
                <Menu.Item
                  title={getString('options.employmentRetired')}
                  titleStyle={[styles.menuItemTitle, textAlignStyle]}
                  onPress={() => {
                    dispatch({
                      type: 'wizard/updateFamilyFinancialInfo',
                      payload: {
                        employmentStatus: 'options.employmentRetired',
                      },
                    });
                    markTouched('employmentStatus');
                    setShowEmploymentStatusMenu(false);
                  }}
                />
              </Menu>
              {shouldShowError('employmentStatus') ? (
                <HelperText type="error" style={styles.errorText}>
                  {employmentStatusError ?? ''}
                </HelperText>
              ) : null}
            </View>
            <View style={styles.fieldGroup}>
              <Text variant="labelLarge" style={[styles.fieldLabel, textAlignStyle]}>
                {getString('fields.monthlyIncome')}
              </Text>
              <InputWrapper>
                <TextInput
                  accessibilityLabel={getString('fields.monthlyIncome')}
                  placeholder="0"
                  mode="outlined"
                  value={familyFinancialInfo.monthlyIncome ?? ''}
                  onChangeText={(text: string) =>
                    dispatch({
                      type: 'wizard/updateFamilyFinancialInfo',
                      payload: {monthlyIncome: text},
                    })
                  }
                  onBlur={() => markTouched('monthlyIncome')}
                  style={styles.input}
                  contentStyle={inputContentStyle}
                  outlineStyle={styles.inputOutline}
                  keyboardType="decimal-pad"
                  {...getSingleIconProps('cash')}
                  error={shouldShowError('monthlyIncome')}
                />
              </InputWrapper>
              {shouldShowError('monthlyIncome') ? (
                <HelperText type="error" style={styles.errorText}>
                  {monthlyIncomeError ?? ''}
                </HelperText>
              ) : null}
            </View>
            <View style={styles.fieldGroup}>
              <Text variant="labelLarge" style={[styles.fieldLabel, textAlignStyle]}>
                {getString('fields.housingStatus')}
              </Text>
              <Menu
                visible={showHousingStatusMenu}
                onDismiss={() => setShowHousingStatusMenu(false)}
                style={[
                  styles.menu,
                  housingMenuWidth ? {width: housingMenuWidth} : null,
                ]}
                contentStyle={styles.menuContent}
                anchor={
                  <Pressable
                    onLayout={event =>
                      setHousingMenuWidth(event.nativeEvent.layout.width)
                    }
                    onPress={() => setShowHousingStatusMenu(true)}
                    onPressIn={() => markTouched('housingStatus')}>
                    <InputWrapper>
                      <TextInput
                        accessibilityLabel={getString('fields.housingStatus')}
                        placeholder={getString('fields.housingStatus')}
                        mode="outlined"
                        value={resolveOptionLabel(
                          familyFinancialInfo.housingStatus,
                          HOUSING_OPTION_KEYS,
                        )}
                        editable={false}
                        showSoftInputOnFocus={false}
                        pointerEvents="none"
                        style={styles.input}
                        contentStyle={inputContentStyle}
                        outlineStyle={styles.inputOutline}
                        left={housingMenuIcons.left}
                        right={housingMenuIcons.right}
                        error={shouldShowError('housingStatus')}
                      />
                    </InputWrapper>
                  </Pressable>
                }>
                <Menu.Item
                  title={getString('options.housingOwned')}
                  titleStyle={[styles.menuItemTitle, textAlignStyle]}
                  onPress={() => {
                    dispatch({
                      type: 'wizard/updateFamilyFinancialInfo',
                      payload: {housingStatus: 'options.housingOwned'},
                    });
                    markTouched('housingStatus');
                    setShowHousingStatusMenu(false);
                  }}
                />
                <Menu.Item
                  title={getString('options.housingRented')}
                  titleStyle={[styles.menuItemTitle, textAlignStyle]}
                  onPress={() => {
                    dispatch({
                      type: 'wizard/updateFamilyFinancialInfo',
                      payload: {housingStatus: 'options.housingRented'},
                    });
                    markTouched('housingStatus');
                    setShowHousingStatusMenu(false);
                  }}
                />
                <Menu.Item
                  title={getString('options.housingFamily')}
                  titleStyle={[styles.menuItemTitle, textAlignStyle]}
                  onPress={() => {
                    dispatch({
                      type: 'wizard/updateFamilyFinancialInfo',
                      payload: {housingStatus: 'options.housingFamily'},
                    });
                    markTouched('housingStatus');
                    setShowHousingStatusMenu(false);
                  }}
                />
                <Menu.Item
                  title={getString('options.housingEmployer')}
                  titleStyle={[styles.menuItemTitle, textAlignStyle]}
                  onPress={() => {
                    dispatch({
                      type: 'wizard/updateFamilyFinancialInfo',
                      payload: {
                        housingStatus: 'options.housingEmployer',
                      },
                    });
                    markTouched('housingStatus');
                    setShowHousingStatusMenu(false);
                  }}
                />
              </Menu>
              {shouldShowError('housingStatus') ? (
                <HelperText type="error" style={styles.errorText}>
                  {housingStatusError ?? ''}
                </HelperText>
              ) : null}
            </View>
          </View>
        </View>
        <View style={styles.footerSpace} />
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
              dispatch({type: 'wizard/setCurrentStep', payload: 3});
            }}
            style={styles.primaryButton}
            contentStyle={styles.primaryButtonContent}>
            {getString('buttons.next')}
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
    gap: 10,
  },
  fieldGroup: {
    gap: 4,
  },
  fieldLabel: {
    color: '#111827',
  },
  input: {
    backgroundColor: 'transparent',
  },
  inputWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
  inputOutline: {
    borderRadius: 12,
    borderColor: '#E5E7EB',
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
  footerSpace: {
    height: 24,
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
  menu: {
    marginTop: 4,
  },
  menuContent: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingVertical: 4,
  },
  menuItemTitle: {
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
  errorText: {
    marginTop: 2,
    paddingVertical: 0,
  },
});
