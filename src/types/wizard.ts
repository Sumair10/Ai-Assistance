export type PersonalInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type FamilyFinancialInfo = {
  householdSize: string;
  monthlyIncome: string;
  monthlyExpenses: string;
  dependents: string;
};

export type SituationDescriptions = {
  situation: string;
  goals: string;
  notes: string | null;
};

export type WizardState = {
  currentStep: number;
  personalInfo: PersonalInfo;
  familyFinancialInfo: FamilyFinancialInfo;
  situationDescriptions: SituationDescriptions;
};
