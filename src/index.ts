import 'dotenv/config'
import serverless from 'serverless-http';
import app from './app';

const isVercel = process.env.VERCEL === '1';
if (isVercel) {
    module.exports = app;
    module.exports.handler = serverless(app);
} else {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}