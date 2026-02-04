import React from 'react';
import {useSelector} from 'react-redux';
import type {RootState} from '../redux/store';
import PersonalInfoScreen from '../screens/step1/PersonalInfoScreen';
import FamilyFinancialScreen from '../screens/step2/FamilyFinancialScreen';
import SituationDescriptionsScreen from '../screens/step3/SituationDescriptionsScreen';
import ConfirmationScreen from '../screens/confirmation/ConfirmationScreen';

const resolveScreenForStep = (step: number) => {
  switch (step) {
    case 1:
      return <PersonalInfoScreen />;
    case 2:
      return <FamilyFinancialScreen />;
    case 3:
      return <SituationDescriptionsScreen />;
    case 4:
      return <ConfirmationScreen />;
    default:
      return <PersonalInfoScreen />;
  }
};

export default function AppNavigator(): React.JSX.Element {
  const currentStep = useSelector((state: RootState) => state.wizard.currentStep);
  return resolveScreenForStep(currentStep);
}
