require('dotenv').config();

const app = require('./app');
const pool = require('./config/database');

const PORT = process.env.PORT || 3000;

async function startServer() {

    try {

        const connection = await pool.getConnection();

        console.log('MySQL connected successfully');

        connection.release();

        app.listen(PORT, () => {

            console.log('--------------------------------');
            console.log('Google Review SaaS API');
            console.log(`Server running on port ${PORT}`);
            console.log(`Health: http://localhost:${PORT}/api/health`);
            console.log('--------------------------------');

        });

    } catch (error) {

        console.error('Unable to connect to MySQL');
        console.error(error.message);

        process.exit(1);

    }

}

startServer();