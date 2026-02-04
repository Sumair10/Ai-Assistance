import AsyncStorage from '@react-native-async-storage/async-storage';
import {WIZARD_DRAFT_KEY} from './storageKeys';
import type {WizardState} from '../../types/wizard';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isWizardState = (value: unknown): value is WizardState => {
  if (!isRecord(value)) {
    return false;
  }
  const {
    currentStep,
    personalInfo,
    familyFinancialInfo,
    situationDescriptions,
  } = value;
  if (typeof currentStep !== 'number') {
    return false;
  }
  if (
    !isRecord(personalInfo) ||
    typeof personalInfo.name !== 'string' ||
    typeof personalInfo.nationalId !== 'string' ||
    typeof personalInfo.dateOfBirth !== 'string' ||
    typeof personalInfo.gender !== 'string' ||
    typeof personalInfo.address !== 'string' ||
    typeof personalInfo.city !== 'string' ||
    typeof personalInfo.state !== 'string' ||
    typeof personalInfo.country !== 'string' ||
    typeof personalInfo.countryCode !== 'string' ||
    typeof personalInfo.email !== 'string' ||
    typeof personalInfo.phone !== 'string'
  ) {
    return false;
  }
  if (
    !isRecord(familyFinancialInfo) ||
    typeof familyFinancialInfo.maritalStatus !== 'string' ||
    typeof familyFinancialInfo.dependents !== 'string' ||
    typeof familyFinancialInfo.employmentStatus !== 'string' ||
    typeof familyFinancialInfo.monthlyIncome !== 'string' ||
    typeof familyFinancialInfo.housingStatus !== 'string'
  ) {
    return false;
  }
  if (
    !isRecord(situationDescriptions) ||
    typeof situationDescriptions.currentFinancialSituation !== 'string' ||
    typeof situationDescriptions.employmentCircumstances !== 'string' ||
    typeof situationDescriptions.reasonForApplying !== 'string'
  ) {
    return false;
  }
  return true;
};

export const saveWizardDraft = async (
  wizardState: WizardState,
): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      WIZARD_DRAFT_KEY,
      JSON.stringify(wizardState),
    );
  } catch {
    return;
  }
};

export const loadWizardDraft = async (): Promise<WizardState | null> => {
  try {
    const raw = await AsyncStorage.getItem(WIZARD_DRAFT_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as unknown;
    return isWizardState(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const clearWizardDraft = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(WIZARD_DRAFT_KEY);
  } catch {
    return;
  }
};
