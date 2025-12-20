// Environment configuration
// TODO: Add environment variable validation with Zod

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  // Add more environment variables here
};
