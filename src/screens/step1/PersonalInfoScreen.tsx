import React, {useEffect, useState} from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Button, HelperText, Menu, Text, TextInput} from 'react-native-paper';
import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import CountryPicker, {
  Flag,
  isCountryCode,
  type Country,
  type CountryCode,
} from 'react-native-country-picker-modal';
import {useDispatch, useSelector} from 'react-redux';
import type {RootState} from '../../redux/store';
import {getString} from '../../i18n';
import en from '../../i18n/en.json';
import ar from '../../i18n/ar.json';
import useLanguage from '../../i18n/useLanguage';

const BOTTOM_BAR_HEIGHT = 72;
const NAME_MIN_LENGTH = 3;
const NAME_MAX_LENGTH = 50;
const ADDRESS_MIN_LENGTH = 5;
const ADDRESS_MAX_LENGTH = 120;
const CITY_MIN_LENGTH = 2;
const CITY_MAX_LENGTH = 60;
const STATE_MIN_LENGTH = 2;
const STATE_MAX_LENGTH = 60;
const EMAIL_MAX_LENGTH = 120;
const MIN_AGE = 18;
const MAX_AGE = 100;

const InputWrapper = ({children}: {children: React.ReactNode}) => (
  <View style={styles.inputWrapper}>{children}</View>
);

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${day}-${month}-${year}`;
};

const parseDate = (value?: string) => {
  if (!value) {
    return new Date(1990, 0, 1);
  }
  const parts = value.split('-').map(part => Number(part));
  if (parts.length === 3 && parts.every(part => !Number.isNaN(part))) {
    const [day, month, year] = parts;
    return new Date(year, month - 1, day);
  }
  const fallback = new Date(value);
  return Number.isNaN(fallback.getTime()) ? new Date(1990, 0, 1) : fallback;
};

const getAge = (date: Date) => {
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age -= 1;
  }
  return age;
};

const formatEmiratesId = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 15);
  const parts = [];
  if (digits.length > 0) {
    parts.push(digits.slice(0, 3));
  }
  if (digits.length > 3) {
    parts.push(digits.slice(3, 7));
  }
  if (digits.length > 7) {
    parts.push(digits.slice(7, 14));
  }
  if (digits.length > 14) {
    parts.push(digits.slice(14, 15));
  }
  return parts.join('-');
};

const isValidEmiratesId = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits.length === 15;
};

const normalizePhoneDigits = (value: string) => value.replace(/\D/g, '');
const PHONE_MIN_DIGITS = 7;
const PHONE_MAX_DIGITS = 15;
const EN_STRINGS = en as Record<string, string>;
const AR_STRINGS = ar as Record<string, string>;
const GENDER_OPTION_KEYS = ['options.genderMale', 'options.genderFemale'] as const;

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

export default function PersonalInfoScreen() {
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
  const getSwappedIconElements = (
    leftIcon: React.ReactNode,
    rightIcon: React.ReactNode,
  ) => ({
    left: isRTL ? rightIcon : leftIcon,
    right: isRTL ? leftIcon : rightIcon,
  });
  const countryFlagIcon = (
    <TextInput.Icon
      icon={() => (
        <View style={styles.flagIcon}>
          <Flag countryCode={countryCode} flagSize={20} />
        </View>
      )}
    />
  );
  const dateIconProps = getSwappedIconProps('calendar', 'chevron-down');
  const genderIconProps = getSwappedIconProps('gender-male-female', 'chevron-down');
  const countryInputIcons = getSwappedIconElements(
    countryFlagIcon,
    <TextInput.Icon icon="chevron-down" />,
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderMenu, setShowGenderMenu] = useState(false);
  const [genderMenuWidth, setGenderMenuWidth] = useState<number | null>(null);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [touchedFields, setTouchedFields] = useState({
    name: false,
    nationalId: false,
    dateOfBirth: false,
    gender: false,
    address: false,
    city: false,
    state: false,
    country: false,
    phone: false,
    email: false,
  });
  const isIOS = Platform.OS === 'ios';
  const personalInfo = useSelector(
    (state: RootState) => state.wizard.personalInfo,
  ) as Record<string, string>;
  const dateOfBirthValue = personalInfo.dateOfBirth ?? '';
  const dateOfBirthDate = parseDate(dateOfBirthValue);
  const [countryCode, setCountryCode] = useState<CountryCode>(() => {
    const storedCode = personalInfo.countryCode ?? '';
    return isCountryCode(storedCode) ? storedCode : 'AE';
  });
  const openAndroidDatePicker = () => {
    if (!DateTimePickerAndroid?.open) {
      return;
    }
    DateTimePickerAndroid.open({
      value: dateOfBirthDate,
      mode: 'date',
      maximumDate: new Date(),
      onChange: (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (event.type === 'set' && selectedDate) {
          const formatted = formatDate(selectedDate);
          dispatch({
            type: 'wizard/updatePersonalInfo',
            payload: {dateOfBirth: formatted},
          });
        }
      },
    });
  };

  useEffect(() => {
    const storedCode = personalInfo.countryCode ?? '';
    if (isCountryCode(storedCode) && storedCode !== countryCode) {
      setCountryCode(storedCode);
    }
  }, [countryCode, personalInfo.countryCode]);

  const handleCountrySelect = (country: Country) => {
    const name =
      typeof country.name === 'string'
        ? country.name
        : country.name.common ?? country.cca2;
    setCountryCode(country.cca2);
    dispatch({
      type: 'wizard/updatePersonalInfo',
      payload: {country: name, countryCode: country.cca2},
    });
    setShowCountryPicker(false);
  };

  const markTouched = (
    field:
      | 'name'
      | 'nationalId'
      | 'dateOfBirth'
      | 'gender'
      | 'address'
      | 'city'
      | 'state'
      | 'country'
      | 'phone'
      | 'email',
  ) => {
    setTouchedFields(prev => ({...prev, [field]: true}));
  };

  const nameError = (() => {
    const value = (personalInfo.name ?? '').trim();
    if (!value) {
      return getString('errors.nameRequired');
    }
    if (value.length < NAME_MIN_LENGTH) {
      return getString('errors.nameMin').replace(
        '{min}',
        String(NAME_MIN_LENGTH),
      );
    }
    if (value.length > NAME_MAX_LENGTH) {
      return getString('errors.nameMax').replace(
        '{max}',
        String(NAME_MAX_LENGTH),
      );
    }
    return null;
  })();

  const emiratesIdError = (() => {
    const value = personalInfo.nationalId ?? '';
    if (!value.trim()) {
      return getString('errors.emiratesIdRequired');
    }
    if (!isValidEmiratesId(value)) {
      return getString('errors.emiratesIdInvalid');
    }
    return null;
  })();

  const dateOfBirthError = (() => {
    if (!dateOfBirthValue.trim()) {
      return getString('errors.dobRequired');
    }
    const age = getAge(dateOfBirthDate);
    if (age < MIN_AGE || age > MAX_AGE) {
      return getString('errors.ageRange')
        .replace('{min}', String(MIN_AGE))
        .replace('{max}', String(MAX_AGE));
    }
    return null;
  })();

  const genderError = (() => {
    const value = (personalInfo.gender ?? '').trim();
    if (!value) {
      return getString('errors.genderRequired');
    }
    return null;
  })();

  const addressError = (() => {
    const value = (personalInfo.address ?? '').trim();
    if (!value) {
      return getString('errors.addressRequired');
    }
    if (value.length < ADDRESS_MIN_LENGTH) {
      return getString('errors.addressMin').replace(
        '{min}',
        String(ADDRESS_MIN_LENGTH),
      );
    }
    if (value.length > ADDRESS_MAX_LENGTH) {
      return getString('errors.addressMax').replace(
        '{max}',
        String(ADDRESS_MAX_LENGTH),
      );
    }
    return null;
  })();

  const cityError = (() => {
    const value = (personalInfo.city ?? '').trim();
    if (!value) {
      return getString('errors.cityRequired');
    }
    if (value.length < CITY_MIN_LENGTH) {
      return getString('errors.cityMin').replace(
        '{min}',
        String(CITY_MIN_LENGTH),
      );
    }
    if (value.length > CITY_MAX_LENGTH) {
      return getString('errors.cityMax').replace(
        '{max}',
        String(CITY_MAX_LENGTH),
      );
    }
    return null;
  })();

  const stateError = (() => {
    const value = (personalInfo.state ?? '').trim();
    if (!value) {
      return getString('errors.stateRequired');
    }
    if (value.length < STATE_MIN_LENGTH) {
      return getString('errors.stateMin').replace(
        '{min}',
        String(STATE_MIN_LENGTH),
      );
    }
    if (value.length > STATE_MAX_LENGTH) {
      return getString('errors.stateMax').replace(
        '{max}',
        String(STATE_MAX_LENGTH),
      );
    }
    return null;
  })();

  const countryError = (() => {
    const value = (personalInfo.country ?? '').trim();
    if (!value) {
      return getString('errors.countryRequired');
    }
    return null;
  })();

  const phoneError = (() => {
    const value = personalInfo.phone ?? '';
    if (!value.trim()) {
      return getString('errors.phoneRequired');
    }
    const digits = normalizePhoneDigits(value);
    if (digits.length < PHONE_MIN_DIGITS || digits.length > PHONE_MAX_DIGITS) {
      return getString('errors.phoneDigits')
        .replace('{min}', String(PHONE_MIN_DIGITS))
        .replace('{max}', String(PHONE_MAX_DIGITS));
    }
    return null;
  })();

  const emailError = (() => {
    const value = (personalInfo.email ?? '').trim();
    if (!value) {
      return getString('errors.emailRequired');
    }
    if (value.length > EMAIL_MAX_LENGTH) {
      return getString('errors.emailMax').replace(
        '{max}',
        String(EMAIL_MAX_LENGTH),
      );
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) {
      return getString('errors.emailInvalid');
    }
    return null;
  })();

  const isFormValid =
    !nameError &&
    !emiratesIdError &&
    !dateOfBirthError &&
    !genderError &&
    !addressError &&
    !cityError &&
    !stateError &&
    !countryError &&
    !phoneError &&
    !emailError;

  const shouldShowError = (field: keyof typeof touchedFields) =>
    (showErrors || touchedFields[field]) && Boolean(
      field === 'name'
        ? nameError
        : field === 'nationalId'
          ? emiratesIdError
          : field === 'dateOfBirth'
            ? dateOfBirthError
            : field === 'gender'
              ? genderError
              : field === 'address'
                ? addressError
                : field === 'city'
                  ? cityError
                  : field === 'state'
                    ? stateError
                    : field === 'country'
                      ? countryError
                      : field === 'phone'
                        ? phoneError
                        : emailError,
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
            {getString('titles.personalInfo')}
          </Text>
          <Text variant="bodyMedium" style={[styles.subtitle, textAlignStyle]}>
            {getString('descriptions.personalInfo')}
          </Text>
          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text variant="labelLarge" style={[styles.fieldLabel, textAlignStyle]}>
                {getString('fields.name')}
              </Text>
              <InputWrapper>
                <TextInput
                  accessibilityLabel={getString('fields.name')}
                  placeholder="John Doe"
                  mode="outlined"
                  value={personalInfo.name ?? ''}
                  onChangeText={(text: string) =>
                    dispatch({
                      type: 'wizard/updatePersonalInfo',
                      payload: {name: text},
                    })
                  }
                  onBlur={() => markTouched('name')}
                  style={styles.input}
                  contentStyle={inputContentStyle}
                  outlineStyle={styles.inputOutline}
                  {...getSingleIconProps('account')}
                  error={shouldShowError('name')}
                />
              </InputWrapper>
              {shouldShowError('name') ? (
                <HelperText type="error" style={styles.errorText}>
                  {nameError ?? ''}
                </HelperText>
              ) : null}
            </View>
            <View style={styles.fieldGroup}>
              <Text variant="labelLarge" style={[styles.fieldLabel, textAlignStyle]}>
                {getString('fields.nationalId')}
              </Text>
              <InputWrapper>
                <TextInput
                  accessibilityLabel={getString('fields.nationalId')}
                  placeholder="Emirates ID"
                  mode="outlined"
                  value={personalInfo.nationalId ?? ''}
                  onChangeText={(text: string) => {
                    dispatch({
                      type: 'wizard/updatePersonalInfo',
                      payload: {nationalId: formatEmiratesId(text)},
                    });
                  }}
                  onBlur={() => markTouched('nationalId')}
                  style={styles.input}
                  contentStyle={inputContentStyle}
                  outlineStyle={styles.inputOutline}
                  keyboardType="number-pad"
                  {...getSingleIconProps('card-account-details')}
                  error={shouldShowError('nationalId')}
                />
              </InputWrapper>
              {shouldShowError('nationalId') ? (
                <HelperText type="error" style={styles.errorText}>
                  {emiratesIdError ?? ''}
                </HelperText>
              ) : null}
            </View>
            <View style={styles.fieldGroup}>
              <Text variant="labelLarge" style={[styles.fieldLabel, textAlignStyle]}>
                {getString('fields.dateOfBirth')}
              </Text>
              <Pressable
                onPress={() =>
                  isIOS ? setShowDatePicker(true) : openAndroidDatePicker()
                }
                onPressIn={() => markTouched('dateOfBirth')}>
                <InputWrapper>
                  <TextInput
                    accessibilityLabel={getString('fields.dateOfBirth')}
                    placeholder="DD-MM-YYYY"
                    mode="outlined"
                    value={dateOfBirthValue}
                    editable={false}
                    showSoftInputOnFocus={false}
                    pointerEvents="none"
                    style={styles.input}
                    contentStyle={inputContentStyle}
                    outlineStyle={styles.inputOutline}
                  left={dateIconProps.left}
                  right={dateIconProps.right}
                    error={shouldShowError('dateOfBirth')}
                  />
                </InputWrapper>
              </Pressable>
              {shouldShowError('dateOfBirth') ? (
                <HelperText type="error" style={styles.errorText}>
                  {dateOfBirthError ?? ''}
                </HelperText>
              ) : null}
            </View>
            <View style={styles.fieldGroup}>
              <Text variant="labelLarge" style={[styles.fieldLabel, textAlignStyle]}>
                {getString('fields.gender')}
              </Text>
              <Menu
                visible={showGenderMenu}
                onDismiss={() => setShowGenderMenu(false)}
                style={[
                  styles.menu,
                  genderMenuWidth ? {width: genderMenuWidth} : null,
                ]}
                contentStyle={styles.menuContent}
                anchor={
                  <Pressable
                    onLayout={event =>
                      setGenderMenuWidth(event.nativeEvent.layout.width)
                    }
                    onPress={() => setShowGenderMenu(true)}>
                    <InputWrapper>
                      <TextInput
                        accessibilityLabel={getString('fields.gender')}
                        placeholder={getString('fields.gender')}
                        mode="outlined"
                        value={resolveOptionLabel(
                          personalInfo.gender,
                          GENDER_OPTION_KEYS,
                        )}
                        editable={false}
                        showSoftInputOnFocus={false}
                        pointerEvents="none"
                        style={styles.input}
                        contentStyle={inputContentStyle}
                        outlineStyle={styles.inputOutline}
                        left={genderIconProps.left}
                        right={genderIconProps.right}
                      />
                    </InputWrapper>
                  </Pressable>
                }>
                <Menu.Item
                  title={getString('options.genderMale')}
                  titleStyle={[styles.menuItemTitle, textAlignStyle]}
                  onPress={() => {
                    dispatch({
                      type: 'wizard/updatePersonalInfo',
                      payload: {gender: 'options.genderMale'},
                    });
                    markTouched('gender');
                    setShowGenderMenu(false);
                  }}
                />
                <Menu.Item
                  title={getString('options.genderFemale')}
                  titleStyle={[styles.menuItemTitle, textAlignStyle]}
                  onPress={() => {
                    dispatch({
                      type: 'wizard/updatePersonalInfo',
                      payload: {gender: 'options.genderFemale'},
                    });
                    markTouched('gender');
                    setShowGenderMenu(false);
                  }}
                />
              </Menu>
              {shouldShowError('gender') ? (
                <HelperText type="error" style={styles.errorText}>
                  {genderError ?? ''}
                </HelperText>
              ) : null}
            </View>
            <View style={styles.fieldGroup}>
              <Text variant="labelLarge" style={[styles.fieldLabel, textAlignStyle]}>
                {getString('fields.address')}
              </Text>
              <InputWrapper>
                <TextInput
                  accessibilityLabel={getString('fields.address')}
                  placeholder={getString('fields.address')}
                  mode="outlined"
                  value={personalInfo.address ?? ''}
                  onChangeText={(text: string) =>
                    dispatch({
                      type: 'wizard/updatePersonalInfo',
                      payload: {address: text},
                    })
                  }
                  onBlur={() => markTouched('address')}
                  style={styles.input}
                  contentStyle={inputContentStyle}
                  outlineStyle={styles.inputOutline}
                  {...getSingleIconProps('map-marker')}
                  error={shouldShowError('address')}
                />
              </InputWrapper>
              {shouldShowError('address') ? (
                <HelperText type="error" style={styles.errorText}>
                  {addressError ?? ''}
                </HelperText>
              ) : null}
            </View>
            <View style={styles.row}>
              <View style={[styles.fieldGroup, styles.flex]}>
                <Text variant="labelLarge" style={[styles.fieldLabel, textAlignStyle]}>
                  {getString('fields.city')}
                </Text>
                <InputWrapper>
                  <TextInput
                    accessibilityLabel={getString('fields.city')}
                    placeholder={getString('fields.city')}
                    mode="outlined"
                    value={personalInfo.city ?? ''}
                    onChangeText={(text: string) =>
                      dispatch({
                        type: 'wizard/updatePersonalInfo',
                        payload: {city: text},
                      })
                    }
                    onBlur={() => markTouched('city')}
                    style={styles.input}
                    contentStyle={inputContentStyle}
                    outlineStyle={styles.inputOutline}
                    {...getSingleIconProps('city')}
                    error={shouldShowError('city')}
                  />
                </InputWrapper>
                {shouldShowError('city') ? (
                  <HelperText type="error" style={styles.errorText}>
                    {cityError ?? ''}
                  </HelperText>
                ) : null}
              </View>
              <View style={styles.spacer} />
              <View style={[styles.fieldGroup, styles.flex]}>
                <Text variant="labelLarge" style={[styles.fieldLabel, textAlignStyle]}>
                  {getString('fields.state')}
                </Text>
                <InputWrapper>
                  <TextInput
                    accessibilityLabel={getString('fields.state')}
                    placeholder={getString('fields.state')}
                    mode="outlined"
                    value={personalInfo.state ?? ''}
                    onChangeText={(text: string) =>
                      dispatch({
                        type: 'wizard/updatePersonalInfo',
                        payload: {state: text},
                      })
                    }
                    onBlur={() => markTouched('state')}
                    style={styles.input}
                    contentStyle={inputContentStyle}
                    outlineStyle={styles.inputOutline}
                    {...getSingleIconProps('map')}
                    error={shouldShowError('state')}
                  />
                </InputWrapper>
                {shouldShowError('state') ? (
                  <HelperText type="error" style={styles.errorText}>
                    {stateError ?? ''}
                  </HelperText>
                ) : null}
              </View>
            </View>
            <View style={styles.fieldGroup}>
              <Text variant="labelLarge" style={[styles.fieldLabel, textAlignStyle]}>
                {getString('fields.country')}
              </Text>
              <Pressable
                onPress={() => setShowCountryPicker(true)}
                onPressIn={() => markTouched('country')}>
                <InputWrapper>
                  <TextInput
                    accessibilityLabel={getString('fields.country')}
                    placeholder="Select country"
                    mode="outlined"
                    value={personalInfo.country ?? ''}
                    editable={false}
                    showSoftInputOnFocus={false}
                    pointerEvents="none"
                    style={styles.input}
                    contentStyle={inputContentStyle}
                    outlineStyle={styles.inputOutline}
                    left={countryInputIcons.left}
                    right={countryInputIcons.right}
                    error={shouldShowError('country')}
                  />
                </InputWrapper>
              </Pressable>
              {shouldShowError('country') ? (
                <HelperText type="error" style={styles.errorText}>
                  {countryError ?? ''}
                </HelperText>
              ) : null}
              <CountryPicker
                countryCode={countryCode}
                preferredCountries={['AE']}
                withFilter
                withFlag
                withEmoji={false}
                withFlagButton={false}
                withCountryNameButton={false}
                visible={showCountryPicker}
                onClose={() => setShowCountryPicker(false)}
                onSelect={handleCountrySelect}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text variant="labelLarge" style={[styles.fieldLabel, textAlignStyle]}>
                {getString('fields.phone')}
              </Text>
              <InputWrapper>
                <TextInput
                  accessibilityLabel={getString('fields.phone')}
                  placeholder="Mobile Number"
                  mode="outlined"
                  value={personalInfo.phone ?? ''}
                  onChangeText={(text: string) =>
                    dispatch({
                      type: 'wizard/updatePersonalInfo',
                      payload: {phone: text},
                    })
                  }
                  onBlur={() => markTouched('phone')}
                  style={styles.input}
                  contentStyle={inputContentStyle}
                  outlineStyle={styles.inputOutline}
                  keyboardType="phone-pad"
                  {...getSingleIconProps('phone')}
                  error={shouldShowError('phone')}
                />
              </InputWrapper>
              {shouldShowError('phone') ? (
                <HelperText type="error" style={styles.errorText}>
                  {phoneError ?? ''}
                </HelperText>
              ) : null}
            </View>
            <View style={styles.fieldGroup}>
              <Text variant="labelLarge" style={[styles.fieldLabel, textAlignStyle]}>
                {getString('fields.email')}
              </Text>
              <InputWrapper>
                <TextInput
                  accessibilityLabel={getString('fields.email')}
                  placeholder="john.doe@example.com"
                  mode="outlined"
                  value={personalInfo.email ?? ''}
                  onChangeText={(text: string) =>
                    dispatch({
                      type: 'wizard/updatePersonalInfo',
                      payload: {email: text},
                    })
                  }
                  onBlur={() => markTouched('email')}
                  style={styles.input}
                  contentStyle={inputContentStyle}
                  outlineStyle={styles.inputOutline}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  {...getSingleIconProps('email')}
                  error={shouldShowError('email')}
                />
              </InputWrapper>
              {shouldShowError('email') ? (
                <HelperText type="error" style={styles.errorText}>
                  {emailError ?? ''}
                </HelperText>
              ) : null}
            </View>
          </View>
        </View>
        <View style={styles.footerSpace} />
      </ScrollView>
      <View style={styles.bottomBar}>
        <Button
          mode="contained"
          buttonColor="#000000"
          textColor="#FFFFFF"
          onPress={() => {
            if (!isFormValid) {
              setShowErrors(true);
              return;
            }
            dispatch({type: 'wizard/setCurrentStep', payload: 2});
          }}
          style={styles.primaryButton}
          contentStyle={styles.primaryButtonContent}>
          {getString('buttons.next')}
        </Button>
      </View>
      <Modal
        visible={showDatePicker && isIOS}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}>
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowDatePicker(false)}>
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <DateTimePicker
              value={dateOfBirthDate}
              mode="date"
              display="spinner"
              maximumDate={new Date()}
              onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                if (event.type === 'set' && selectedDate) {
                  const formatted = formatDate(selectedDate);
                  dispatch({
                    type: 'wizard/updatePersonalInfo',
                    payload: {dateOfBirth: formatted},
                  });
                }
              }}
            />
            <View style={styles.modalActions}>
              <Button
                mode="text"
                onPress={() => setShowDatePicker(false)}>
                {getString('buttons.done')}
              </Button>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  row: {
    flexDirection: 'row',
  },
  flex: {
    flex: 1,
  },
  spacer: {
    width: 12,
  },
  primaryButton: {
    borderRadius: 12,
  },
  primaryButtonContent: {
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
    paddingBottom :30,
    minHeight: BOTTOM_BAR_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
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
  flagIcon: {
    width: 24,
    alignItems: 'center',
  },
  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    paddingBottom: 4,
    paddingHorizontal: 12,
  },
  modalActions: {
    alignItems: 'flex-end',
    paddingBottom: 4,
  },
  errorText: {
    marginTop: 2,
    paddingVertical: 0,
  },
});
