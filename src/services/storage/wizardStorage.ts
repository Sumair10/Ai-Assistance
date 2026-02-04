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
    typeof personalInfo.firstName !== 'string' ||
    typeof personalInfo.lastName !== 'string' ||
    typeof personalInfo.email !== 'string' ||
    typeof personalInfo.phone !== 'string'
  ) {
    return false;
  }
  if (
    !isRecord(familyFinancialInfo) ||
    typeof familyFinancialInfo.householdSize !== 'string' ||
    typeof familyFinancialInfo.monthlyIncome !== 'string' ||
    typeof familyFinancialInfo.monthlyExpenses !== 'string' ||
    typeof familyFinancialInfo.dependents !== 'string'
  ) {
    return false;
  }
  if (
    !isRecord(situationDescriptions) ||
    typeof situationDescriptions.situation !== 'string' ||
    typeof situationDescriptions.goals !== 'string' ||
    (typeof situationDescriptions.notes !== 'string' &&
      situationDescriptions.notes !== null)
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
