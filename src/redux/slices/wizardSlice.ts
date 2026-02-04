import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {
  FamilyFinancialInfo,
  PersonalInfo,
  SituationDescriptions,
  WizardState,
} from '../../types/wizard';

const wizardSlice = createSlice({
  name: 'wizard',
  initialState: {
    currentStep: 1,
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    },
    familyFinancialInfo: {
      householdSize: '',
      monthlyIncome: '',
      monthlyExpenses: '',
      dependents: '',
    },
    situationDescriptions: {
      situation: '',
      goals: '',
      notes: null,
    },
  } as WizardState,
  reducers: {
    updatePersonalInfo(state, action: PayloadAction<Partial<PersonalInfo>>) {
      state.personalInfo = {...state.personalInfo, ...action.payload};
    },
    updateFamilyFinancialInfo(
      state,
      action: PayloadAction<Partial<FamilyFinancialInfo>>,
    ) {
      state.familyFinancialInfo = {
        ...state.familyFinancialInfo,
        ...action.payload,
      };
    },
    updateSituationDescriptions(
      state,
      action: PayloadAction<Partial<SituationDescriptions>>,
    ) {
      state.situationDescriptions = {
        ...state.situationDescriptions,
        ...action.payload,
      };
    },
    setCurrentStep(state, action: PayloadAction<number>) {
      state.currentStep = action.payload;
    },
    resetWizard(state) {
      state.currentStep = 1;
      state.personalInfo = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
      };
      state.familyFinancialInfo = {
        householdSize: '',
        monthlyIncome: '',
        monthlyExpenses: '',
        dependents: '',
      };
      state.situationDescriptions = {
        situation: '',
        goals: '',
        notes: null,
      };
    },
  },
});

export default wizardSlice.reducer;
