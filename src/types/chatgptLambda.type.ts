import { ChatCompletionRequestMessage } from 'openai';

export type TChatGptLambdaInput = {
  mode: string;
  messages: ChatCompletionRequestMessage[];
}

export type TChatGptLambdaEvent = {
  body: TChatGptLambdaInput;
  resource: string;
}