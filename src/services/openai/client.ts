type OpenAIResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};
import Config from 'react-native-config';
export const callOpenAI = async (prompt: string): Promise<string> => {
  const apiKey = Config.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OpenAI API key');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{role: 'user', content: prompt}],
      temperature: 0.3,
    }),
  });

  const data = (await response.json()) as OpenAIResponse;
  if (!response.ok) {
    throw new Error(data.error?.message || 'OpenAI request failed');
  }

  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('No response text');
  }
  return text.trim();
};
