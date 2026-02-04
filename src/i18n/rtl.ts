import {I18nManager} from 'react-native';

export const applyRTL = (lang: string): void => {
  const isRtl = lang === 'ar';
  I18nManager.allowRTL(isRtl);
  I18nManager.forceRTL(isRtl);
};
