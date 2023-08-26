import { ChatCompletionRequestMessage } from 'openai';

export type TChatGptLambdaInput = {
  model: string;
  messages: ChatCompletionRequestMessage[];
}

export type TChatGptLambdaEvent = {
  body: TChatGptLambdaInput | null;
  resource: string;
}