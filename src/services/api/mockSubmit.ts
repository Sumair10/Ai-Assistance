import type {WizardState} from '../../types/wizard';

export const submitApplication = async (
  data: WizardState,
): Promise<void> => {
  await new Promise(resolve => {
    setTimeout(resolve, 500);
  });
  void data;
};
