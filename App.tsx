import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {
  DevSettings,
  I18nManager,
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Appbar,
  Avatar,
  Button,
  MD3DarkTheme,
  MD3LightTheme,
  Provider as PaperProvider,
  Text,
} from 'react-native-paper';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import {Provider, useDispatch, useSelector} from 'react-redux';
import AppNavigator from './src/app/AppNavigator';
import type {RootState} from './src/redux/store';
import {store} from './src/redux/store';
import useWizardDraft from './src/hooks/useWizardDraft.ts';
import {getString, setLanguage} from './src/i18n';
import {applyRTL} from './src/i18n/rtl';

type Language = 'en' | 'ar';

type RootProps = {
  language: Language;
  onChangeLanguage: (lang: Language) => void;
};

function Root({language, onChangeLanguage}: RootProps): React.JSX.Element {
  useWizardDraft();
  return (
    <NavigationContainer key={language}>
      <View style={styles.appContainer}>
        <AppHeader language={language} onChangeLanguage={onChangeLanguage} />
        <View style={styles.content}>
          <AppNavigator />
        </View>
      </View>
    </NavigationContainer>
  );
}

export default function App(): React.JSX.Element | null {
  const isDarkMode = useColorScheme() === 'dark';
  const baseTheme = isDarkMode ? MD3DarkTheme : MD3LightTheme;
  const [language, setLanguageState] = React.useState<Language>('en');
  const [languageReady, setLanguageReady] = React.useState(false);
  const hasHydratedLanguage = React.useRef(false);

  React.useEffect(() => {
    let isActive = true;
    const loadLanguage = async () => {
      try {
        const stored = await AsyncStorage.getItem('appLanguage');
        const nextLanguage: Language = stored === 'ar' ? 'ar' : 'en';
        const shouldBeRTL = nextLanguage === 'ar';
        const needsRTLReload = I18nManager.isRTL !== shouldBeRTL;
        if (!isActive) {
          return;
        }
        setLanguageState(nextLanguage);
        setLanguage(nextLanguage);
        applyRTL(nextLanguage);
        if (needsRTLReload) {
          DevSettings.reload();
          return;
        }
      } finally {
        if (isActive) {
          hasHydratedLanguage.current = true;
          setLanguageReady(true);
        }
      }
    };
    loadLanguage();
    return () => {
      isActive = false;
    };
  }, []);

  React.useEffect(() => {
    if (!hasHydratedLanguage.current) {
      return;
    }
    setLanguage(language);
    applyRTL(language);
    AsyncStorage.setItem('appLanguage', language).catch(() => undefined);
  }, [language]);

  const theme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: '#2563EB',
    },
  };
  if (!languageReady) {
    return null;
  }

  return (
    <Provider store={store}>
      <PaperProvider
        theme={theme}
        settings={{
          icon: props => <MaterialDesignIcons {...props} />,
        }}>
        <View style={[styles.root, {backgroundColor: theme.colors.background}]}>
          <StatusBar barStyle="light-content" backgroundColor="#000000" />
          <Root language={language} onChangeLanguage={setLanguageState} />
        </View>
      </PaperProvider>
    </Provider>
  );
}

type AppHeaderProps = {
  language: Language;
  onChangeLanguage: (lang: Language) => void;
};

function AppHeader({
  language,
  onChangeLanguage,
}: AppHeaderProps): React.JSX.Element {
  const dispatch = useDispatch();
  const currentStep = useSelector(
    (state: RootState) => state.wizard.currentStep,
  );
  const [languageModalVisible, setLanguageModalVisible] = React.useState(false);
  const isRTL = language === 'ar';
  const canGoBack = currentStep > 1 && currentStep < 4;

  const handleLanguageChange = (nextLanguage: Language) => {
    onChangeLanguage(nextLanguage);
    setLanguageModalVisible(false);
  };
  const handleBack = () => {
    if (!canGoBack) {
      return;
    }
    dispatch({
      type: 'wizard/setCurrentStep',
      payload: Math.max(1, currentStep - 1),
    });
  };

  const settingsAction = (
    <View style={styles.headerSide}>
      <Appbar.Action
        icon="cog-outline"
        onPress={() => setLanguageModalVisible(true)}
        accessibilityLabel="Settings"
        color="#FFFFFF"
      />
    </View>
  );
  const backAction = canGoBack ? (
    <View style={styles.headerSide}>
      <Appbar.Action
        icon={isRTL ? 'arrow-right' : 'arrow-left'}
        onPress={handleBack}
        accessibilityLabel={getString('buttons.back')}
        color="#FFFFFF"
      />
    </View>
  ) : (
    <View style={styles.headerSide} />
  );

  return (
    <>
      <Appbar.Header mode="center-aligned" style={styles.header}>
        {isRTL ? settingsAction : backAction}
        <View style={styles.headerCenter}>
          <Avatar.Text size={32} label="AI" style={styles.logoAvatar} />
          <Text variant="titleMedium" style={styles.logoText}>
            AI Assistance
          </Text>
        </View>
        {isRTL ? backAction : settingsAction}
      </Appbar.Header>
      <Modal
        visible={languageModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setLanguageModalVisible(false)}>
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setLanguageModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text variant="titleMedium" style={styles.modalTitle}>
              Language
            </Text>
            <View style={styles.modalActions}>
              <Button
                mode={language === 'en' ? 'contained' : 'outlined'}
                onPress={() => handleLanguageChange('en')}
                style={styles.modalButton}>
                English
              </Button>
              <Button
                mode={language === 'ar' ? 'contained' : 'outlined'}
                onPress={() => handleLanguageChange('ar')}
                style={styles.modalButton}>
                Arabic
              </Button>
            </View>
            <Button
              mode="text"
              onPress={() => setLanguageModalVisible(false)}>
              Close
            </Button>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  appContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: '#000000',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerSide: {
    width: 48,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoAvatar: {
    backgroundColor: '#2563EB',
  },
  logoText: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  modalTitle: {
    color: '#111827',
  },
  modalActions: {
    gap: 8,
  },
  modalButton: {
    borderRadius: 12,
  },
});
