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
      name: '',
      nationalId: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      city: '',
      state: '',
      country: '',
      countryCode: 'AE',
      phone: '',
      email: '',
    },
    familyFinancialInfo: {
      maritalStatus: '',
      dependents: '',
      employmentStatus: '',
      monthlyIncome: '',
      housingStatus: '',
    },
    situationDescriptions: {
      currentFinancialSituation: '',
      employmentCircumstances: '',
      reasonForApplying: '',
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
        name: '',
        nationalId: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        city: '',
        state: '',
        country: '',
        countryCode: 'AE',
        phone: '',
        email: '',
      };
      state.familyFinancialInfo = {
        maritalStatus: '',
        dependents: '',
        employmentStatus: '',
        monthlyIncome: '',
        housingStatus: '',
      };
      state.situationDescriptions = {
        currentFinancialSituation: '',
        employmentCircumstances: '',
        reasonForApplying: '',
      };
    },
  },
});

export default wizardSlice.reducer;
