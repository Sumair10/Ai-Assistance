export type PersonalInfo = {
  name: string;
  nationalId: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  country: string;
  countryCode: string;
  phone: string;
  email: string;
};

export type FamilyFinancialInfo = {
  maritalStatus: string;
  dependents: string;
  employmentStatus: string;
  monthlyIncome: string;
  housingStatus: string;
};

export type SituationDescriptions = {
  currentFinancialSituation: string;
  employmentCircumstances: string;
  reasonForApplying: string;
};

export type WizardState = {
  currentStep: number;
  personalInfo: PersonalInfo;
  familyFinancialInfo: FamilyFinancialInfo;
  situationDescriptions: SituationDescriptions;
};
