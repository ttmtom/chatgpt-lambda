import { APIGatewayEvent } from 'aws-lambda';
import { TChatGptLambdaEvent, TChatGptLambdaInput } from './types/chatgptLambda.type';
import { chatgptController } from './controllers/chatgpt.controller';


const isGatewayEvent = (event: APIGatewayEvent | TChatGptLambdaEvent): event is APIGatewayEvent => {
  return typeof event.body === 'string';
}

const apiGatewayBodyValidation = (event: any): event is TChatGptLambdaEvent => {
  return Array.isArray(event.body);
}
const extractEvent = (event: APIGatewayEvent | TChatGptLambdaEvent): {
  body: TChatGptLambdaInput,
  resource: string
} => {
  if (isGatewayEvent(event)) {
    const temp = JSON.parse(event.body ?? '{}');
    if (!apiGatewayBodyValidation(temp)) {
      throw new Error('invalid body');
    }

    return temp;
  }
  return event;
}
export const handler = async (event: APIGatewayEvent | TChatGptLambdaEvent) => {
  // const body = extractEvent(event);
  const {body, resource} = extractEvent(event);
  switch (resource) {
    case '/chat': {
      return await chatgptController.chat(body.mode, body.messages);
    }
    case '/list': {
      return await chatgptController.list();
    }
    default: {
      console.log('---- unexpected ----');
    }
  }
  return {
    statusCode: 404,
    body: 'source not found',
  }
}