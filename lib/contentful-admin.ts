import { createClient } from 'contentful-management';

if (!process.env.CONTENTFUL_MANAGEMENT_TOKEN) {
  throw new Error('CONTENTFUL_MANAGEMENT_TOKEN is not defined');
}

export const contentfulManagementClient = createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
});

export const SPACE_ID = process.env.CONTENTFUL_SPACE_ID!;
export const ENVIRONMENT_ID = process.env.CONTENTFUL_ENVIRONMENT_ID || 'master';
