import {useEffect, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import type {AppDispatch, RootState} from '../redux/store';
import type {WizardState} from '../types/wizard';
import {loadWizardDraft, saveWizardDraft} from '../services/storage/wizardStorage';

const applyWizardDraft = (dispatch: AppDispatch, draft: WizardState) => {
  dispatch({type: 'wizard/resetWizard', payload: draft});
  dispatch({type: 'wizard/setCurrentStep', payload: draft.currentStep});
  dispatch({type: 'wizard/updatePersonalInfo', payload: draft.personalInfo});
  dispatch({
    type: 'wizard/updateFamilyFinancialInfo',
    payload: draft.familyFinancialInfo,
  });
  dispatch({
    type: 'wizard/updateSituationDescriptions',
    payload: draft.situationDescriptions,
  });
};

export default function useWizardDraft(): void {
  const dispatch = useDispatch<AppDispatch>();
  const wizardState = useSelector((state: RootState) => state.wizard);
  const isHydrating = useRef(true);
  const hasLoaded = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const draft = await loadWizardDraft();
      if (cancelled) {
        return;
      }
      if (draft) {
        applyWizardDraft(dispatch, draft);
      }
      hasLoaded.current = true;
      isHydrating.current = false;
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  useEffect(() => {
    if (!hasLoaded.current || isHydrating.current) {
      return;
    }
    saveWizardDraft(wizardState as WizardState);
  }, [wizardState]);
}
