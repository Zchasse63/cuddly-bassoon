/**
 * Quick test script for RentCast API integration
 * Run with: npx tsx scripts/test-rentcast.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

// Simple fetch-based test (no imports from lib to avoid bundling issues)
async function testRentCastAPI() {
  const apiKey = process.env.RENTCAST_API_KEY;
  
  if (!apiKey) {
    console.error('❌ RENTCAST_API_KEY not found in environment');
    process.exit(1);
  }

  console.log('🔑 API Key found:', apiKey.substring(0, 8) + '...');
  console.log('');

  const baseUrl = 'https://api.rentcast.io/v1';

  // Test 1: Simple property search
  console.log('📍 Test 1: Property Search (Austin, TX)');
  console.log('─'.repeat(50));

  try {
    const searchUrl = `${baseUrl}/properties?city=Austin&state=TX&limit=3`;
    console.log('URL:', searchUrl);
    
    const response = await fetch(searchUrl, {
      headers: {
        'X-Api-Key': apiKey,
        'Accept': 'application/json',
      },
    });

    console.log('Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('Results:', Array.isArray(data) ? data.length : 'N/A', 'properties');
    
    if (Array.isArray(data) && data.length > 0) {
      console.log('\nSample property:');
      const sample = data[0];
      console.log('  Address:', sample.formattedAddress || sample.address);
      console.log('  Type:', sample.propertyType);
      console.log('  Beds/Baths:', sample.bedrooms, '/', sample.bathrooms);
      console.log('  Sq Ft:', sample.squareFootage);
      console.log('  Year Built:', sample.yearBuilt);
    }
  } catch (error) {
    console.error('Request failed:', error);
  }

  console.log('');

  // Test 2: Market data
  console.log('📊 Test 2: Market Data (78701 - Downtown Austin)');
  console.log('─'.repeat(50));

  try {
    const marketUrl = `${baseUrl}/markets?zipCode=78701`;
    console.log('URL:', marketUrl);
    
    const response = await fetch(marketUrl, {
      headers: {
        'X-Api-Key': apiKey,
        'Accept': 'application/json',
      },
    });

    console.log('Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('\nMarket stats:');
    console.log('  Median Sale Price:', data.medianSalePrice ? `$${data.medianSalePrice.toLocaleString()}` : 'N/A');
    console.log('  Median Rent:', data.medianRent ? `$${data.medianRent.toLocaleString()}` : 'N/A');
    console.log('  Price/SqFt:', data.pricePerSquareFoot ? `$${data.pricePerSquareFoot}` : 'N/A');
    console.log('  Days on Market:', data.daysOnMarket || 'N/A');
    console.log('  Inventory:', data.inventory || 'N/A');
  } catch (error) {
    console.error('Request failed:', error);
  }

  console.log('');
  console.log('✅ RentCast API test complete!');
}

testRentCastAPI();

