import serverless from 'serverless-http';
import app from './app';

module.exports = app;
module.exports.handler = serverless(app); 
// For local testing
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});