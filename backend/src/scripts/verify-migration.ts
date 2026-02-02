import { pool } from '../config/database';

async function verify() {
    try {
        const intlCount = await pool.query("SELECT count(*) FROM intl_flight_info");
        const priceCount = await pool.query("SELECT count(*) FROM flight_prices WHERE source = 'flightsfrom.com'");

        console.log(`✅ intl_flight_info count: ${intlCount.rows[0].count}`);
        console.log(`✅ flight_prices (flightsfrom.com) count: ${priceCount.rows[0].count}`);
    } catch (error) {
        console.error('❌ Verification failed:', error);
    } finally {
        await pool.end();
    }
}

verify();
