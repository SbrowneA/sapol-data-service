/**
 * APP_STAGE is the app's source-of-truth deployment stage.
 *
 * NODE_ENV is left as the conventional Node/runtime flag for framework and
 * library behaviour. To avoid requiring operators to set both, derive NODE_ENV
 * from APP_STAGE only when it is not provided explicitly.
 *
 * Local runs may use `.env.*` files. Hosted environments should inject
 * variables directly and must not depend on env files being present on disk.
 */
process.env.APP_STAGE = process.env.APP_STAGE || 'local';
process.env.NODE_ENV = process.env.NODE_ENV || (
  process.env.APP_STAGE === 'prod' ? 'production' :
    process.env.APP_STAGE === 'test' ? 'test' :
      'development'
);

export const appStage = process.env.APP_STAGE;

console.log(`Starting app in '${appStage}' mode`);
