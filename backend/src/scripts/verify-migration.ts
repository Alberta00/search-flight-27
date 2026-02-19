import { pool } from '../config/database';

async function verify() {
    try {
        const depCount = await pool.query("SELECT count(*) FROM departure_flight_paths");
        const arrCount = await pool.query("SELECT count(*) FROM arrival_flight_paths");
        const priceCount = await pool.query("SELECT count(*) FROM flight_prices WHERE source = 'flightsfrom.com'");

        console.log(`✅ departure_flight_paths count: ${depCount.rows[0].count}`);
        console.log(`✅ arrival_flight_paths count: ${arrCount.rows[0].count}`);
        console.log(`✅ flight_prices (flightsfrom.com) count: ${priceCount.rows[0].count}`);
    } catch (error) {
        console.error('❌ Verification failed:', error);
    } finally {
        await pool.end();
    }
}

verify();
