import {useSyncExternalStore} from 'react';
import {getCurrentLanguage, subscribeLanguage} from './index';

export default function useLanguage() {
  return useSyncExternalStore(subscribeLanguage, getCurrentLanguage);
}
