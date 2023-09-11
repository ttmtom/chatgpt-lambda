import { ChatCompletionRequestMessage } from 'openai';

export type TChatGptLambdaInput = {
  model: string;
  userId: string;
  chatId: number;
  session: string;
  messages: ChatCompletionRequestMessage[];
}

export type TChatGptLambdaEvent = {
  body: TChatGptLambdaInput | null;
  resource: string;
}