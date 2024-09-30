import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

const schema = a.schema({
  Order: a.model({
      order_id: a.string().required(), 
      user_id: a.string().required(),
      email: a.string(),
      selected_package: a.string().required(),
      vials: a.integer().required(),
      pricePerVial: a.float().required(),
      total: a.float().required(),
      created_at: a.timestamp().required(), 
      updated_at: a.timestamp().required() 
    })
    .authorization(allow => [allow.publicApiKey()])
});

// Used for code completion / highlighting when making requests from frontend
export type Schema = ClientSchema<typeof schema>;

// defines the data resource to be deployed
export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: { expiresInDays: 30 }
  }
});