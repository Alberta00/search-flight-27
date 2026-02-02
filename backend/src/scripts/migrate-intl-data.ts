import { pool } from '../config/database';
import { FlightModel } from '../models/Flight';

async function migrateIntlData() {
    console.log('🚀 Starting migration of international flight data...');

    try {
        // 1. Get all international flights from flight_prices (source = 'flightsfrom.com')
        const query = `
            SELECT * FROM flight_prices 
            WHERE source = 'flightsfrom.com'
        `;
        const result = await pool.query(query);
        const records = result.rows;

        console.log(`📊 Found ${records.length} international flight records to migrate.`);

        if (records.length === 0) {
            console.log('✅ No records found to migrate.');
            return;
        }

        // 2. Map to intl_flight_info format
        const intlFlights = records.map(r => ({
            route_id: r.route_id,
            airline_id: r.airline_id,
            departure_date: r.departure_date,
            departure_time: r.departure_time,
            arrival_time: r.arrival_time,
            duration: r.duration,
            flight_number: r.flight_number,
            trip_type: r.trip_type,
            travel_class: r.travel_class,
            stops: r.stops || 0,
            dep_airport: r.dep_airport,
            arr_airport: r.arr_airport,
            destination: r.destination,
            airline_name: r.airline_name,
            airline_code: r.airline_code,
            source: r.source
        }));

        // 3. Batch insert into intl_flight_info
        console.log('📥 Inserting records into intl_flight_info...');
        await FlightModel.batchInsertIntlFlightInfo(intlFlights);

        // 4. Optionally delete from flight_prices
        console.log('🧹 Cleaning up migrated records from flight_prices...');
        await pool.query("DELETE FROM flight_prices WHERE source = 'flightsfrom.com'");

        console.log('🎉 Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await pool.end();
    }
}

migrateIntlData();
