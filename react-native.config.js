const path = require('path');

module.exports = {
  assets: [
    './node_modules/@react-native-vector-icons/material-design-icons/fonts',
  ],
  dependencies: {
    '@react-native-community/datetimepicker': {
      platforms: {
        android: {
          sourceDir: path.resolve(
            __dirname,
            'node_modules/@react-native-community/datetimepicker/android',
          ),
          packageImportPath:
            'import com.reactcommunity.rndatetimepicker.RNDateTimePickerPackage;',
          packageInstance: 'new RNDateTimePickerPackage()',
        },
      },
    },
  },
};
