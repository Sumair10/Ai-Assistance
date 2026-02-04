declare module 'react-native-linear-gradient' {
  import type {ComponentType} from 'react';
  import type {ViewProps} from 'react-native';

  export interface LinearGradientProps extends ViewProps {
    colors: string[];
    start?: {x: number; y: number};
    end?: {x: number; y: number};
    locations?: number[];
  }

  const LinearGradient: ComponentType<LinearGradientProps>;
  export default LinearGradient;
}
