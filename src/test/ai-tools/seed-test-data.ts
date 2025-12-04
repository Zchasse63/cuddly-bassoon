/**
 * AI Tools Test Database Seed Script
 *
 * Populates the test database with realistic data for AI tool testing.
 * Uses REAL Supabase connection - no mocks.
 *
 * Run with: npx tsx src/test/ai-tools/seed-test-data.ts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Environment validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('   Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Test user ID - will be created or fetched
const TEST_USER_EMAIL = 'ai-test@example.com';
let TEST_USER_ID: string;

// ============================================================================
// SEED DATA DEFINITIONS
// ============================================================================

const PROPERTIES = [
  {
    address: '123 Main St',
    city: 'Miami',
    state: 'FL',
    zip: '33101',
    county: 'Miami-Dade',
    latitude: 25.7617,
    longitude: -80.1918,
    property_type: 'single_family',
    bedrooms: 3,
    bathrooms: 2,
    square_footage: 1800,
    lot_size: 6500,
    year_built: 1995,
    owner_name: 'John Smith',
    owner_type: 'individual',
    ownership_length_months: 60,
    is_listed: false,
  },
  {
    address: '456 Oak Ave',
    city: 'Fort Lauderdale',
    state: 'FL',
    zip: '33301',
    county: 'Broward',
    latitude: 26.1224,
    longitude: -80.1373,
    property_type: 'single_family',
    bedrooms: 4,
    bathrooms: 3,
    square_footage: 2400,
    lot_size: 8000,
    year_built: 2005,
    owner_name: 'ABC Holdings LLC',
    owner_type: 'llc',
    ownership_length_months: 36,
    is_listed: true,
    listing_status: 'active',
  },
  {
    address: '789 Palm Dr',
    city: 'West Palm Beach',
    state: 'FL',
    zip: '33401',
    county: 'Palm Beach',
    latitude: 26.7153,
    longitude: -80.0534,
    property_type: 'condo',
    bedrooms: 2,
    bathrooms: 2,
    square_footage: 1200,
    lot_size: 0,
    year_built: 2010,
    owner_name: 'Maria Garcia',
    owner_type: 'individual',
    ownership_length_months: 24,
    is_listed: false,
  },
  {
    address: '321 Beach Blvd',
    city: 'Hollywood',
    state: 'FL',
    zip: '33019',
    county: 'Broward',
    latitude: 26.0112,
    longitude: -80.1495,
    property_type: 'multi_family',
    bedrooms: 6,
    bathrooms: 4,
    square_footage: 3200,
    lot_size: 10000,
    year_built: 1985,
    owner_name: 'Estate of Robert Johnson',
    owner_type: 'estate',
    ownership_length_months: 180,
    is_listed: false,
  },
  {
    address: '555 Sunset Way',
    city: 'Boca Raton',
    state: 'FL',
    zip: '33432',
    county: 'Palm Beach',
    latitude: 26.3587,
    longitude: -80.0831,
    property_type: 'single_family',
    bedrooms: 5,
    bathrooms: 4,
    square_footage: 3500,
    lot_size: 12000,
    year_built: 2015,
    owner_name: 'David Chen',
    owner_type: 'individual',
    ownership_length_months: 12,
    is_listed: true,
    listing_status: 'pending',
  },
];

const BUYERS = [
  {
    name: 'Mike Thompson',
    company_name: 'Thompson Investments',
    email: 'mike@thompsoninv.com',
    phone: '+1-305-555-0101',
    buyer_type: 'flipper' as const,
    status: 'qualified' as const,
    tier: 'A' as const,
    notes: 'Experienced flipper, closes fast, prefers Miami-Dade',
  },
  {
    name: 'Sarah Williams',
    company_name: 'Williams Properties LLC',
    email: 'sarah@williamsprops.com',
    phone: '+1-954-555-0202',
    buyer_type: 'landlord' as const,
    status: 'active' as const,
    tier: 'A' as const,
    notes: 'Buy and hold investor, looking for cash flow properties',
  },
  {
    name: 'James Rodriguez',
    company_name: null,
    email: 'james.r@email.com',
    phone: '+1-561-555-0303',
    buyer_type: 'flipper' as const,
    status: 'active' as const,
    tier: 'B' as const,
    notes: 'New investor, has done 3 flips, needs guidance',
  },
  {
    name: 'Lisa Park',
    company_name: 'Park Development Group',
    email: 'lisa@parkdev.com',
    phone: '+1-786-555-0404',
    buyer_type: 'developer' as const,
    status: 'qualified' as const,
    tier: 'A' as const,
    notes: 'Looking for teardown opportunities, has capital',
  },
  {
    name: 'Robert Martinez',
    company_name: 'RM Wholesale',
    email: 'robert@rmwholesale.com',
    phone: '+1-305-555-0505',
    buyer_type: 'wholesaler' as const,
    status: 'active' as const,
    tier: 'B' as const,
    notes: 'Fellow wholesaler, good for JV deals',
  },
];

const BUYER_PREFERENCES = [
  {
    property_types: ['single_family', 'multi_family'],
    price_range_min: 150000,
    price_range_max: 400000,
    bedroom_min: 3,
    bedroom_max: 5,
    markets: ['Miami', 'Fort Lauderdale', 'Hollywood'],
    condition_tolerance: 'heavy_rehab' as const,
    max_rehab_budget: 100000,
    preferred_roi_percent: 20,
  },
  {
    property_types: ['single_family', 'condo', 'multi_family'],
    price_range_min: 200000,
    price_range_max: 600000,
    bedroom_min: 2,
    bedroom_max: 6,
    markets: ['Fort Lauderdale', 'Boca Raton', 'West Palm Beach'],
    condition_tolerance: 'light_rehab' as const,
    max_rehab_budget: 50000,
    preferred_roi_percent: 8,
  },
  {
    property_types: ['single_family'],
    price_range_min: 100000,
    price_range_max: 250000,
    bedroom_min: 2,
    bedroom_max: 4,
    markets: ['Miami', 'Hialeah', 'Miami Beach'],
    condition_tolerance: 'moderate_rehab' as const,
    max_rehab_budget: 60000,
    preferred_roi_percent: 25,
  },
  {
    property_types: ['single_family', 'multi_family'],
    price_range_min: 300000,
    price_range_max: 1000000,
    bedroom_min: 4,
    bedroom_max: 10,
    markets: ['Boca Raton', 'Delray Beach', 'Palm Beach'],
    condition_tolerance: 'gut' as const,
    max_rehab_budget: 500000,
    preferred_roi_percent: 30,
  },
  {
    property_types: ['single_family', 'condo'],
    price_range_min: 50000,
    price_range_max: 200000,
    bedroom_min: 2,
    bedroom_max: 4,
    markets: ['Miami', 'Fort Lauderdale'],
    condition_tolerance: 'moderate_rehab' as const,
    max_rehab_budget: 40000,
    preferred_roi_percent: 15,
  },
];

const LEADS = [
  {
    property_address: '123 Main St, Miami, FL 33101',
    status: 'qualified' as const,
    source: 'skip_trace' as const,
    motivation_score: 85,
    owner_name: 'John Smith',
    owner_phone: '+1-305-555-1001',
    owner_email: 'john.smith@email.com',
    notes: 'Motivated seller, behind on taxes, wants quick sale',
  },
  {
    property_address: '789 Palm Dr, West Palm Beach, FL 33401',
    status: 'contacted' as const,
    source: 'driving_for_dollars' as const,
    motivation_score: 65,
    owner_name: 'Maria Garcia',
    owner_phone: '+1-561-555-1002',
    owner_email: 'maria.g@email.com',
    notes: 'Inherited property, lives out of state',
  },
  {
    property_address: '321 Beach Blvd, Hollywood, FL 33019',
    status: 'new' as const,
    source: 'direct_mail' as const,
    motivation_score: 45,
    owner_name: 'Estate of Robert Johnson',
    owner_phone: '+1-954-555-1003',
    owner_email: null,
    notes: 'Probate property, executor contact needed',
  },
  {
    property_address: '999 Coral Way, Miami, FL 33145',
    status: 'offer_made' as const,
    source: 'cold_call' as const,
    motivation_score: 92,
    owner_name: 'Patricia Brown',
    owner_phone: '+1-305-555-1004',
    owner_email: 'pat.brown@email.com',
    notes: 'Divorce situation, needs to sell ASAP',
  },
  {
    property_address: '444 Bayshore Dr, Fort Lauderdale, FL 33304',
    status: 'negotiating' as const,
    source: 'referral' as const,
    motivation_score: 78,
    owner_name: 'William Davis',
    owner_phone: '+1-954-555-1005',
    owner_email: 'wdavis@email.com',
    notes: 'Relocating for job, flexible on price',
  },
];

const DEALS = [
  {
    property_address: '123 Main St, Miami, FL 33101',
    stage: 'offer' as const,
    status: 'active' as const,
    seller_name: 'John Smith',
    seller_phone: '+1-305-555-1001',
    seller_email: 'john.smith@email.com',
    asking_price: 280000,
    offer_price: 220000,
    estimated_arv: 380000,
    estimated_repairs: 50000,
    notes: 'Strong deal, seller motivated, waiting for counter',
  },
  {
    property_address: '999 Coral Way, Miami, FL 33145',
    stage: 'contract' as const,
    status: 'active' as const,
    seller_name: 'Patricia Brown',
    seller_phone: '+1-305-555-1004',
    seller_email: 'pat.brown@email.com',
    asking_price: 350000,
    offer_price: 285000,
    contract_price: 290000,
    assignment_fee: 15000,
    estimated_arv: 450000,
    estimated_repairs: 60000,
    notes: 'Under contract, closing in 30 days',
  },
  {
    property_address: '444 Bayshore Dr, Fort Lauderdale, FL 33304',
    stage: 'offer' as const,
    status: 'active' as const,
    seller_name: 'William Davis',
    seller_phone: '+1-954-555-1005',
    seller_email: 'wdavis@email.com',
    asking_price: 520000,
    offer_price: 420000,
    estimated_arv: 650000,
    estimated_repairs: 80000,
    notes: 'Back and forth on price, seller wants 450k',
  },
  {
    property_address: '777 Sunrise Blvd, Plantation, FL 33317',
    stage: 'closed' as const,
    status: 'completed' as const,
    seller_name: 'Nancy Wilson',
    seller_phone: '+1-954-555-1006',
    seller_email: 'nwilson@email.com',
    asking_price: 195000,
    offer_price: 155000,
    contract_price: 160000,
    assignment_fee: 12000,
    estimated_arv: 280000,
    estimated_repairs: 45000,
    notes: 'Closed successfully, assigned to Mike Thompson',
  },
];

const MARKET_DATA = [
  {
    zip_code: '33101',
    city: 'Miami',
    state: 'FL',
    county: 'Miami-Dade',
    median_home_value: 425000,
    median_rent: 2200,
    price_per_sqft: 285,
    rent_per_sqft: 1.45,
    days_on_market_avg: 45,
    inventory_count: 1250,
    absorption_rate: 3.2,
    year_over_year_change: 8.5,
    data_date: new Date().toISOString().split('T')[0],
    data_source: 'rentcast',
  },
  {
    zip_code: '33301',
    city: 'Fort Lauderdale',
    state: 'FL',
    county: 'Broward',
    median_home_value: 385000,
    median_rent: 2000,
    price_per_sqft: 265,
    rent_per_sqft: 1.35,
    days_on_market_avg: 38,
    inventory_count: 980,
    absorption_rate: 2.8,
    year_over_year_change: 6.2,
    data_date: new Date().toISOString().split('T')[0],
    data_source: 'rentcast',
  },
  {
    zip_code: '33401',
    city: 'West Palm Beach',
    state: 'FL',
    county: 'Palm Beach',
    median_home_value: 365000,
    median_rent: 1850,
    price_per_sqft: 245,
    rent_per_sqft: 1.25,
    days_on_market_avg: 52,
    inventory_count: 720,
    absorption_rate: 3.5,
    year_over_year_change: 5.8,
    data_date: new Date().toISOString().split('T')[0],
    data_source: 'rentcast',
  },
  {
    zip_code: '33432',
    city: 'Boca Raton',
    state: 'FL',
    county: 'Palm Beach',
    median_home_value: 625000,
    median_rent: 2800,
    price_per_sqft: 345,
    rent_per_sqft: 1.65,
    days_on_market_avg: 35,
    inventory_count: 540,
    absorption_rate: 2.2,
    year_over_year_change: 10.2,
    data_date: new Date().toISOString().split('T')[0],
    data_source: 'rentcast',
  },
];

const TEMPLATES = [
  {
    name: 'Initial Outreach SMS',
    category: 'outreach',
    channel: 'sms' as const,
    subject_template: null,
    body_template: 'Hi {{owner_name}}, I noticed your property at {{address}}. Are you interested in selling? I can make a fair cash offer. Reply YES to learn more.',
    variables: ['owner_name', 'address'],
    is_active: true,
  },
  {
    name: 'Follow-up Email',
    category: 'follow_up',
    channel: 'email' as const,
    subject_template: 'Following up on {{address}}',
    body_template: 'Hi {{owner_name}},\n\nI wanted to follow up on our conversation about your property at {{address}}. I\'m still interested in making you a fair cash offer.\n\nWould you have time for a quick call this week?\n\nBest regards,\n{{user_name}}',
    variables: ['owner_name', 'address', 'user_name'],
    is_active: true,
  },
  {
    name: 'Offer Presentation',
    category: 'offer',
    channel: 'email' as const,
    subject_template: 'Cash Offer for {{address}}',
    body_template: 'Dear {{owner_name}},\n\nThank you for considering our offer. Based on our analysis, we are prepared to offer ${{offer_amount}} for your property at {{address}}.\n\nThis is a cash offer with a {{closing_days}}-day close. No repairs needed, no commissions.\n\nPlease let me know if you have any questions.\n\nBest,\n{{user_name}}',
    variables: ['owner_name', 'address', 'offer_amount', 'closing_days', 'user_name'],
    is_active: true,
  },
];

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

async function getOrCreateTestUser(): Promise<string> {
  console.log('👤 Setting up test user...');

  // Check if test user already exists in auth.users via admin API
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingUser = existingUsers?.users?.find(u => u.email === TEST_USER_EMAIL);

  if (existingUser) {
    console.log('   ✓ Found existing auth user');

    // Ensure profile exists
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', existingUser.id)
      .single();

    if (!profile) {
      await createUserProfile(existingUser.id);
    }

    return existingUser.id;
  }

  // Create new auth user via admin API
  console.log('   Creating new auth user...');
  const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
    email: TEST_USER_EMAIL,
    password: 'TestPassword123!',
    email_confirm: true,
  });

  if (authError || !newUser.user) {
    console.error('   ❌ Failed to create auth user:', authError?.message);
    throw authError || new Error('Failed to create user');
  }

  console.log('   ✓ Created auth user');

  // Create user profile
  await createUserProfile(newUser.user.id);

  return newUser.user.id;
}

async function createUserProfile(userId: string): Promise<void> {
  console.log('   Creating/updating user profile...');

  const { error } = await supabase
    .from('user_profiles')
    .upsert({
      id: userId,
      email: TEST_USER_EMAIL,
      full_name: 'AI Test User',
      company_name: 'Test Wholesaling Co',
      phone: '+1-305-555-0000',
      subscription_tier: 'pro',
      subscription_status: 'active',
      api_calls_remaining: 10000,
      preferences: {
        default_market: 'Miami',
        notification_preferences: { email: true, sms: true },
      },
    }, { onConflict: 'id' });

  if (error) {
    console.error('   ❌ Failed to create user profile:', error.message);
    throw error;
  }

  console.log('   ✓ User profile ready');
}

async function seedProperties(): Promise<string[]> {
  console.log('🏠 Seeding properties...');

  // Check for existing test properties and delete them first
  const testAddresses = PROPERTIES.map(p => p.address);
  await supabase
    .from('properties')
    .delete()
    .in('address', testAddresses);

  const { data, error } = await supabase
    .from('properties')
    .insert(PROPERTIES)
    .select('id');

  if (error) {
    console.error('   ❌ Failed to seed properties:', error.message);
    throw error;
  }

  console.log(`   ✓ Seeded ${data?.length || 0} properties`);
  return data?.map(p => p.id) || [];
}

async function seedBuyers(userId: string): Promise<string[]> {
  console.log('👥 Seeding buyers...');

  // Delete existing test buyers
  const testEmails = BUYERS.map(b => b.email);
  await supabase.from('buyers').delete().in('email', testEmails);

  const buyersWithUser = BUYERS.map(b => ({ ...b, user_id: userId }));

  const { data, error } = await supabase
    .from('buyers')
    .insert(buyersWithUser)
    .select('id');

  if (error) {
    console.error('   ❌ Failed to seed buyers:', error.message);
    throw error;
  }

  const buyerIds = data?.map(b => b.id) || [];

  // Seed buyer preferences
  if (buyerIds.length > 0) {
    // Delete existing preferences for these buyers
    await supabase.from('buyer_preferences').delete().in('buyer_id', buyerIds);

    const prefsWithBuyerId = BUYER_PREFERENCES.slice(0, buyerIds.length)
      .map((p, i) => {
        const buyerId = buyerIds[i];
        if (!buyerId) return null;
        return {
          ...p,
          buyer_id: buyerId,
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);

    if (prefsWithBuyerId.length > 0) {
      await supabase.from('buyer_preferences').insert(prefsWithBuyerId);
    }
  }

  console.log(`   ✓ Seeded ${buyerIds.length} buyers with preferences`);
  return buyerIds;
}

async function seedLeads(userId: string, propertyIds: string[]): Promise<string[]> {
  console.log('📋 Seeding leads...');

  // Delete existing test leads
  const testAddresses = LEADS.map(l => l.property_address);
  await supabase.from('leads').delete().in('property_address', testAddresses);

  const leadsWithUser = LEADS.map((l, i) => ({
    ...l,
    user_id: userId,
    property_id: propertyIds[i % propertyIds.length] || null,
  }));

  const { data, error } = await supabase
    .from('leads')
    .insert(leadsWithUser)
    .select('id');

  if (error) {
    console.error('   ❌ Failed to seed leads:', error.message);
    throw error;
  }

  console.log(`   ✓ Seeded ${data?.length || 0} leads`);
  return data?.map(l => l.id) || [];
}

async function seedDeals(userId: string, propertyIds: string[], buyerIds: string[]): Promise<string[]> {
  console.log('💼 Seeding deals...');

  // Delete existing test deals
  const testAddresses = DEALS.map(d => d.property_address);
  await supabase.from('deals').delete().in('property_address', testAddresses);

  const dealsWithUser = DEALS.map((d, i) => ({
    ...d,
    user_id: userId,
    property_id: propertyIds[i % propertyIds.length] || null,
    assigned_buyer_id: i === 3 ? buyerIds[0] : null, // Assign closed deal to first buyer
  }));

  const { data, error } = await supabase
    .from('deals')
    .insert(dealsWithUser)
    .select('id');

  if (error) {
    console.error('   ❌ Failed to seed deals:', error.message);
    throw error;
  }

  console.log(`   ✓ Seeded ${data?.length || 0} deals`);
  return data?.map(d => d.id) || [];
}

async function seedMarketData(): Promise<void> {
  console.log('📊 Seeding market data...');

  // Delete existing test market data
  const testZips = MARKET_DATA.map(m => m.zip_code);
  await supabase.from('market_data').delete().in('zip_code', testZips);

  const { error } = await supabase
    .from('market_data')
    .insert(MARKET_DATA);

  if (error) {
    console.error('   ❌ Failed to seed market data:', error.message);
    throw error;
  }

  console.log(`   ✓ Seeded ${MARKET_DATA.length} market data records`);
}

async function seedTemplates(userId: string): Promise<void> {
  console.log('📝 Seeding templates...');

  // Delete existing test templates
  const testNames = TEMPLATES.map(t => t.name);
  await supabase.from('templates').delete().in('name', testNames);

  const templatesWithUser = TEMPLATES.map(t => ({ ...t, user_id: userId }));

  const { error } = await supabase
    .from('templates')
    .insert(templatesWithUser);

  if (error) {
    console.error('   ❌ Failed to seed templates:', error.message);
    throw error;
  }

  console.log(`   ✓ Seeded ${TEMPLATES.length} templates`);
}

async function seedLeadLists(userId: string, leadIds: string[]): Promise<void> {
  console.log('📑 Seeding lead lists...');

  const listNames = ['Hot Leads - Miami', 'Probate Leads'];

  // Delete existing test lead lists and their items
  const { data: existingLists } = await supabase
    .from('lead_lists')
    .select('id')
    .in('name', listNames);

  if (existingLists && existingLists.length > 0) {
    const listIds = existingLists.map(l => l.id);
    await supabase.from('lead_list_items').delete().in('list_id', listIds);
    await supabase.from('lead_lists').delete().in('id', listIds);
  }

  const lists = [
    {
      user_id: userId,
      name: 'Hot Leads - Miami',
      description: 'High motivation leads in Miami-Dade area',
      list_type: 'static' as const,
      filter_criteria: { motivation_min: 70, city: 'Miami' },
      is_active: true,
    },
    {
      user_id: userId,
      name: 'Probate Leads',
      description: 'Estate and probate properties',
      list_type: 'dynamic' as const,
      filter_criteria: { owner_type: 'estate' },
      is_active: true,
    },
  ];

  const { data, error } = await supabase
    .from('lead_lists')
    .insert(lists)
    .select('id');

  if (error) {
    console.error('   ❌ Failed to seed lead lists:', error.message);
    throw error;
  }

  // Add leads to first list
  const firstList = data?.[0];
  if (firstList && leadIds.length > 0) {
    const listItems = leadIds.slice(0, 3).map((leadId, i) => ({
      list_id: firstList.id,
      lead_id: leadId,
      position: i,
    }));

    await supabase.from('lead_list_items').insert(listItems);
  }

  console.log(`   ✓ Seeded ${data?.length || 0} lead lists`);
}

async function seedSearchHistory(userId: string): Promise<void> {
  console.log('🔍 Seeding search history...');

  const searches = [
    {
      user_id: userId,
      query_type: 'property',
      criteria: { city: 'Miami', property_type: 'single_family', price_max: 300000 },
      natural_language_query: 'Find single family homes in Miami under 300k',
      results_count: 45,
      execution_time_ms: 234,
      properties_viewed: 12,
      led_to_action: true,
      action_type: 'offer_made',
    },
    {
      user_id: userId,
      query_type: 'property',
      criteria: { county: 'Broward', bedrooms_min: 3, owner_type: 'llc' },
      natural_language_query: 'LLC owned properties in Broward with 3+ bedrooms',
      results_count: 28,
      execution_time_ms: 189,
      properties_viewed: 8,
      led_to_action: false,
    },
    {
      user_id: userId,
      query_type: 'buyer',
      criteria: { buyer_type: 'flipper', tier: 'A' },
      natural_language_query: 'A-tier flipper buyers',
      results_count: 5,
      execution_time_ms: 45,
      properties_viewed: 0,
      led_to_action: true,
      action_type: 'buyer_contacted',
    },
  ];

  const { error } = await supabase.from('search_history').insert(searches);

  if (error) {
    console.error('   ❌ Failed to seed search history:', error.message);
    throw error;
  }

  console.log(`   ✓ Seeded ${searches.length} search history records`);
}

async function seedAnalyticsEvents(userId: string): Promise<void> {
  console.log('📈 Seeding analytics events...');

  const now = new Date();
  const events = [];

  // Generate events for the past 30 days
  for (let daysAgo = 0; daysAgo < 30; daysAgo++) {
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);

    // Property searches
    for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
      events.push({
        user_id: userId,
        event_type: 'property_search',
        event_data: { results_count: Math.floor(Math.random() * 50) + 10 },
        created_at: date.toISOString(),
      });
    }

    // Calls made
    for (let i = 0; i < Math.floor(Math.random() * 3); i++) {
      events.push({
        user_id: userId,
        event_type: 'call_made',
        event_data: { duration_seconds: Math.floor(Math.random() * 300) + 30, outcome: 'spoke_with' },
        created_at: date.toISOString(),
      });
    }

    // Offers made (less frequent)
    if (Math.random() > 0.7) {
      events.push({
        user_id: userId,
        event_type: 'offer_made',
        event_data: { amount: Math.floor(Math.random() * 200000) + 100000 },
        created_at: date.toISOString(),
      });
    }
  }

  const { error } = await supabase.from('analytics_events').insert(events);

  if (error) {
    console.error('   ❌ Failed to seed analytics events:', error.message);
    throw error;
  }

  console.log(`   ✓ Seeded ${events.length} analytics events`);
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('\n🌱 AI Tools Test Database Seeder');
  console.log('================================\n');
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  console.log(`🔑 Using: ${process.env.SUPABASE_SECRET_KEY ? 'Secret Key' : 'Publishable Key'}\n`);

  try {
    // Get or create test user
    TEST_USER_ID = await getOrCreateTestUser();

    // Seed all data
    const propertyIds = await seedProperties();
    const buyerIds = await seedBuyers(TEST_USER_ID);
    const leadIds = await seedLeads(TEST_USER_ID, propertyIds);
    await seedDeals(TEST_USER_ID, propertyIds, buyerIds);
    await seedMarketData();
    await seedTemplates(TEST_USER_ID);
    await seedLeadLists(TEST_USER_ID, leadIds);
    await seedSearchHistory(TEST_USER_ID);
    await seedAnalyticsEvents(TEST_USER_ID);

    console.log('\n✅ Database seeding complete!');
    console.log(`   Test User ID: ${TEST_USER_ID}`);
    console.log(`   Properties: ${propertyIds.length}`);
    console.log(`   Buyers: ${buyerIds.length}`);
    console.log(`   Leads: ${leadIds.length}`);
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Export for use in tests
export {
  TEST_USER_EMAIL,
  PROPERTIES,
  BUYERS,
  LEADS,
  DEALS,
  MARKET_DATA,
  getOrCreateTestUser,
  seedProperties,
  seedBuyers,
  seedLeads,
  seedDeals,
  seedMarketData,
};

// Run if executed directly
main();

