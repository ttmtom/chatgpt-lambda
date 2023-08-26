import { APIGatewayProxyEvent } from 'aws-lambda';
import { TChatGptLambdaEvent, TChatGptLambdaInput } from './types/chatgptLambda.type';
import { chatgptController } from './controllers/chatgpt.controller';


const isGatewayEvent = (event: APIGatewayProxyEvent | TChatGptLambdaEvent): event is APIGatewayProxyEvent => {
  return typeof event.body === 'string';
}

const apiGatewayBodyValidation = (body: any): body is TChatGptLambdaInput => {
  return Array.isArray(body.messages);
}
const extractEvent = (event: APIGatewayProxyEvent | TChatGptLambdaEvent): {
  body: TChatGptLambdaInput | null,
  resource: string
} => {
  if (isGatewayEvent(event)) {
    const temp = JSON.parse(event.body ?? '{}');
    if (!apiGatewayBodyValidation(temp)) {
      throw new Error('invalid body');
    }
    return {
      resource: event.resource,
      body: temp
    };
  }
  return event;
}
export const handler = async (event: APIGatewayProxyEvent | TChatGptLambdaEvent) => {
  // const body = extractEvent(event);
  console.log('--- event: ' + JSON.stringify(event, null, 2));
  const {body, resource} = extractEvent(event);
  switch (resource) {
    case '/chat': {
      if (!body) throw new Error('invalid body');
      return await chatgptController.chat(body.model, body.messages);
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