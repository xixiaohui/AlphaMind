import { init } from '@cloudbase/node-sdk';

const cloudbase = init({
  env: process.env.CLOUDBASE_ENV_ID,
  secretId: process.env.CLOUDBASE_SECRETID,
  secretKey: process.env.CLOUDBASE_SECRETKEY,
  region: process.env.CLOUDBASE_REGION || 'ap-shanghai',
  timeout: 120000,
});

export default cloudbase;
