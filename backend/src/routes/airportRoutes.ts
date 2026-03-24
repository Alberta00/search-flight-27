import { Router } from 'express';
import {
  searchAirports,
  getAirportCountries,
  getAirportsByCountry,
  getAirportDetails,
  getPopularAirports,
  getTotalCount,
} from '../controllers/airportController';

const router = Router();

/**
 * @route   GET /api/airports/popular
 * @desc    Get popular airports
 * @access  Public
 */
router.get('/popular', getPopularAirports);

/**
 * @route   GET /api/airports/search
 * @desc    Search airports and cities
 * @access  Public
 * @query   keyword - Search keyword
 * @query   subType - Optional: AIRPORT or CITY
 * @note    Kept for compatibility. For lazy-loaded dropdowns,
 *          prefer GET /api/airports/countries followed by GET /api/airports/by-country
 *          because /search is keyword-based and intentionally returns a limited subset of rows.
 */
router.get('/search', searchAirports);

/**
 * @route   GET /api/airports/countries
 * @desc    Get airport countries summary for lazy directory loading
 * @access  Public
 */
router.get('/countries', getAirportCountries);

/**
 * @route   GET /api/airports/by-country
 * @desc    Get all airports for a single country
 * @access  Public
 * @query   country - Country code or country name
 */
router.get('/by-country', getAirportsByCountry);

/**
 * @route   GET /api/airports/count
 * @desc    Get total number of airports
 * @access  Public
 */
router.get('/count', getTotalCount);

/**
 * @route   GET /api/airports/:code
 * @desc    Get airport details by code
 * @access  Public
 */
router.get('/:code', getAirportDetails);

export default router;

