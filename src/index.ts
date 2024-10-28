import serverless from 'serverless-http';
import app from './app';

module.exports = app;
module.exports.handler = serverless(app); 