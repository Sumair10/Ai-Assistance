type PromptLanguage = 'en' | 'ar';

const baseInstructionByLanguage: Record<PromptLanguage, string> = {
  en: 'Write a concise, neutral, and formal statement suitable for a government application form. Avoid emotional language and keep the tone objective.',
  ar: 'اكتب بيانًا موجزًا ومحايدًا ورسميًا مناسبًا لنموذج طلب حكومي. تجنب اللغة العاطفية وحافظ على نبرة موضوعية.',
};

const contextPrefixByLanguage: Record<PromptLanguage, string> = {
  en: ' Context: ',
  ar: ' السياق: ',
};

const buildPrompt = (
  description: Record<PromptLanguage, string>,
  context?: string,
  language: PromptLanguage = 'en',
): string => {
  const baseInstruction = baseInstructionByLanguage[language] ?? baseInstructionByLanguage.en;
  const promptDescription = description[language] ?? description.en;
  return `${baseInstruction} ${promptDescription}.${context ? `${contextPrefixByLanguage[language] ?? contextPrefixByLanguage.en}${context}` : ''}`;
};

export const financialSituation = (
  context?: string,
  language: PromptLanguage = 'en',
): string =>
  buildPrompt(
    {
      en: "Describe the applicant's current financial situation",
      ar: 'صف الوضع المالي الحالي لمقدم الطلب',
    },
    context,
    language,
  );

export const employmentCircumstances = (
  context?: string,
  language: PromptLanguage = 'en',
): string =>
  buildPrompt(
    {
      en: "Describe the applicant's employment circumstances",
      ar: 'صف الظروف الوظيفية لمقدم الطلب',
    },
    context,
    language,
  );

export const reasonForApplying = (
  context?: string,
  language: PromptLanguage = 'en',
): string =>
  buildPrompt(
    {
      en: "Describe the applicant's reason for applying for assistance",
      ar: 'صف سبب تقديم مقدم الطلب للحصول على المساعدة',
    },
    context,
    language,
  );
