# Extracted Tools Summary

Total: 203 tools

## advanced_search (3 tools)

- **search.buyer_property_match**: Match Buyer to Properties
  Find properties matching a buyer\

- **search.permit_pattern_match**: Permit Pattern Search
  Find properties with permit activity indicating investment opportunities.

- **search.similar_to_deal**: Find Similar Properties
  Find properties similar to a successful deal.

## automation (3 tools)

- **workflow.alert_on_match**: Alert on Match
  Create alerts for properties matching specific criteria.

- **workflow.auto_follow_up**: Auto Follow-Up
  Schedule automatic follow-up communications for a deal.

- **workflow.deal_stage_trigger**: Deal Stage Trigger
  Create automated actions when deals move between stages.

## batch_operations (4 tools)

- **batch.add_to_list_bulk**: Bulk Add to List
  Add multiple properties to a list at once with optional tags.

- **batch.export_properties**: Export Properties
  Export properties to CSV, Excel, or JSON format.

- **batch.skip_trace_bulk**: Bulk Skip Trace
  Queue multiple properties for skip tracing. Returns a job ID to track progress.

- **batch.update_deal_status**: Bulk Update Deal Status
  Update the status of multiple deals at once.

## buyer_management (13 tools)

- **buyer_management.analyze_buyer_activity**: Analyze Buyer Activity
  Analyze buyer engagement patterns, identify top performers and those needing attention.

- **buyer_management.get_buyer_insights**: Get Buyer Insights
  Get AI-powered insights about a buyer including score breakdown, strengths, and recommendations.

- **buyer_management.match_buyers_to_property**: Match Buyers to Property
  Find buyers whose preferences match a specific property. Returns ranked list with match scores and factors.

- **buyer_management.search_buyers**: Search Buyers
  Search for buyers by name, status, tier, or type.

- **buyer.compare**: compareBuyers
  Compare buyers and recommend for specific deal

- **buyer.generate_report**: generateBuyerReport
  Create buyer summary report with activity metrics

- **buyer.identify_gaps**: identifyBuyerGaps
  Analyze buyer network coverage and identify missing types

- **buyer.predict_behavior**: predictBuyerBehavior
  Predict buyer response and close probability

- **buyer.recommend_actions**: recommendBuyerActions
  Suggest next actions for buyers prioritized by impact

- **buyer.score_fit**: scoreBuyerFit
  Calculate buyer-property fit score with match factors

- **buyer.segment**: segmentBuyers
  Group buyers by criteria for targeted marketing

- **buyer.suggest_outreach**: suggestBuyerOutreach
  Identify buyers to contact and prioritize by opportunity

- **buyer.track_preference_changes**: trackBuyerPreferenceChanges
  Monitor preference updates and alert on significant changes

## communication (13 tools)

- **comms.generate_email_sequence**: Generate Email Sequence
  Generate a multi-email drip sequence for seller outreach.

- **comms.generate_sms_template**: Generate SMS Template
  Generate personalized SMS templates for seller outreach.

- **comms.generate_talking_points**: Generate Talking Points
  Generate talking points and scripts for seller calls.

- **notification.check_opt_out**: checkOptOut
  Check if a contact has opted out of communications

- **notification.generate_ai_message**: generateAIMessage
  Generate a personalized message using AI

- **notification.get_history**: getMessageHistory
  Get message history for a specific contact

- **notification.get_inbox**: getInboxMessages
  Get messages from the unified inbox

- **notification.get_status**: getCommunicationStatus
  Check if SMS and email services are configured

- **notification.list_templates**: listTemplates
  List available message templates

- **notification.mark_as_read**: markAsRead
  Mark messages as read

- **notification.send_email**: sendEmail
  Send an email to a recipient

- **notification.send_from_template**: sendFromTemplate
  Send a message using a pre-defined template

- **notification.send_sms**: sendSMS
  Send an SMS message to a phone number

## contractors (5 tools)

- **contractor.compare**: compareContractors
  Compare multiple contractors side-by-side to help choose the best one.

- **contractor.details**: getContractorDetails
  Get detailed information and performance metrics for a specific contractor.

- **contractor.history**: getContractorHistory
  Get permit history for a contractor to evaluate their work experience.

- **contractor.search**: searchContractors
  Search for contractors by location and specialty. Use to find contractors for renovation projects.

- **contractor.top**: findTopContractors
  Find the highest-rated contractors in an area, optionally filtered by specialty.

## crm (12 tools)

- **crm.analyze_source**: analyzeLeadSource
  Analyze performance of different lead sources

- **crm.create_lead_list**: createLeadList
  Create a new lead list for organizing leads

- **crm.export_leads**: exportLeadData
  Export lead data in JSON or CSV format

- **crm.generate_report**: generateLeadReport
  Generate a summary report for leads

- **crm.identify_hot**: identifyHotLeads
  Find leads with high motivation scores

- **crm.merge_leads**: mergeLeadRecords
  Merge duplicate lead records

- **crm.predict_conversion**: predictLeadConversion
  Predict likelihood of lead converting to deal

- **crm.rank_by_motivation**: rankListByMotivation
  Rank leads by motivation score, highest first

- **crm.segment_leads**: segmentLeads
  Segment leads by motivation, status, source, or recency

- **crm.suggest_nurturing**: suggestLeadNurturing
  Suggest nurturing plan for a lead

- **crm.suggest_outreach**: suggestLeadOutreach
  Suggest leads to contact based on motivation and status

- **crm.track_engagement**: trackLeadEngagement
  Track engagement history for a lead

## data_enrichment (10 tools)

- **skip_trace.batch_trace**: batchSkipTrace
  Queue multiple leads for skip tracing

- **skip_trace.enrich_lead**: enrichLeadData
  Enrich lead with demographics, property, or financial data

- **skip_trace.find_related**: findRelatedContacts
  Find relatives, associates, or neighbors of a lead

- **skip_trace.get_credits**: getSkipTraceCredits
  Check remaining skip trace credits

- **skip_trace.get_status**: getSkipTraceStatus
  Check the status of a skip trace request

- **skip_trace.reverse_address**: reverseAddressLookup
  Look up owner information by property address

- **skip_trace.reverse_phone**: reversePhoneLookup
  Look up owner information by phone number

- **skip_trace.trace_lead**: skipTraceLead
  Skip trace a lead to find phone numbers, emails, and addresses

- **skip_trace.validate_email**: validateEmail
  Validate an email address

- **skip_trace.validate_phone**: validatePhoneNumber
  Validate and get info about a phone number

## deal_analysis (3 tools)

- **deal_analysis.analyze**: Analyze Deal
  Perform comprehensive analysis of a wholesale deal including ARV, MAO, and profit calculations

- **deal_analysis.calculate_mao**: Calculate MAO
  Calculate Maximum Allowable Offer based on ARV, repairs, and desired margins

- **deal_analysis.score**: Score Deal
  Generate a deal score based on multiple factors including motivation, equity, and market conditions

## deal_pipeline (12 tools)

- **deal.analyze_progress**: analyzeDealProgress
  Analyze deal progress and identify bottlenecks

- **deal.assign_buyer**: assignBuyerToDeal
  Assign a buyer to a deal and move to assigned stage

- **deal.calculate_metrics**: calculateDealMetrics
  Calculate financial metrics for a deal

- **deal.compare_to_portfolio**: compareDealToPortfolio
  Compare deal metrics to portfolio averages

- **deal.create**: createDeal
  Create a new deal in the pipeline

- **deal.flag_issues**: flagDealIssues
  Identify deals with issues that need attention

- **deal.generate_offer_strategy**: generateOfferStrategy
  Calculate tiered offer prices (optimal, target, max, walk-away)

- **deal.generate_summary**: generateDealSummary
  Generate a comprehensive summary of a deal

- **deal.get_timeline**: getDealTimeline
  Get activity timeline for a deal

- **deal.predict_outcome**: predictDealOutcome
  Predict likelihood of deal closing successfully

- **deal.suggest_actions**: suggestDealActions
  Suggest next actions for a deal

- **deal.update_stage**: updateDealStage
  Move a deal to a different pipeline stage

## document_generation (3 tools)

- **docs.generate_comp_report**: Generate Comp Report
  Generate a comparable sales report for a property.

- **docs.generate_deal_summary**: Generate Deal Summary
  Generate a comprehensive deal summary with comps, financials, and timeline.

- **docs.generate_offer_letter**: Generate Offer Letter
  Generate a professional offer letter for a property with customizable terms.

## integrations (2 tools)

- **sync.calendar_integration**: Calendar Integration
  Create, update, or manage calendar events for property viewings and meetings.

- **sync.crm_export**: Export to CRM
  Export leads, contacts, or deals to external CRM systems.

## intelligence (3 tools)

- **intel.competitor_activity**: Analyze Competitor Activity
  Analyze investor/flipper activity in zip codes using permit data.

- **intel.market_saturation**: Analyze Market Saturation
  Analyze market saturation using real market data and permit activity.

- **intel.market_velocity**: Analyze Market Velocity
  Comprehensive market velocity analysis for investment timing decisions.

## map (11 tools)

- **census.batch_geocode_comps**: Batch Geocode Comps
  Geocode multiple comparable properties to their Census geographies in a single operation. Use this when analyzing multiple comps, after receiving comps from RentCast valuation API, or when the user asks to 

- **census.classify_comp_geography**: Classify Comp Geography
  Determine the geographic relationship between a subject property and a comparable property. Returns a tier (excellent/good/acceptable/marginal) and explanation. Use this when the user asks 

- **census.get_boundary_by_point**: Get Census Boundary by Point
  Retrieve Census boundary polygon(s) that contain a specific point. This is a convenience tool that combines geocoding and boundary retrieval in one step. Use when you have coordinates and want to immediately visualize the surrounding Census geography.

- **census.get_boundary_polygon**: Get Census Boundary Polygon
  Retrieve the GeoJSON polygon boundary for a Census geography to display on a map. Requires a GEOID from get_census_geography. Use this when the user asks to 

- **census.get_geography**: Get Census Geography
  Retrieve Census geographic identifiers (Block Group, Tract, County, State) for a property based on coordinates. Use this when you need to identify a property

- **map.compare_areas**: Compare Areas
  Compare multiple geographic areas based on real estate metrics like average price, days on market, inventory levels, and appreciation rates.

- **map.compare_neighborhoods**: Compare Neighborhoods
  Compare multiple neighborhoods based on livability factors like schools, walkability, transit access, and amenities using POI density analysis.

- **map.draw_search_area**: Draw Search Area
  Create a search area on the map by defining a center point and radius, or drawing a polygon. Returns the bounds and property count within the area.

- **map.show_commute_time**: Show Commute Time
  Display isochrone (travel time) polygons on the map showing areas reachable within a specified time using Mapbox Isochrone API.

- **map.spatial_query**: Spatial Query
  Query points of interest (POIs) near a location using Mapbox Tilequery API. Find schools, restaurants, shops, and other amenities.

- **map.toggle_style**: Toggle Map Style
  Switch between different map visual styles: streets, satellite, satellite-streets, light, or dark mode.

## market_analysis (32 tools)

- **heat_mapping.absentee_owners**: Absentee Owner Analysis
  Identify absentee owner concentrations

- **heat_mapping.analyze_area**: Analyze Area
  Analyze a geographic area for investment opportunities based on market data

- **heat_mapping.competition_analysis**: Competition Analysis
  Analyze competition levels in a specific area

- **heat_mapping.crime_impact**: Crime Impact Analysis
  Analyze crime impact on property values

- **heat_mapping.days_on_market**: Days on Market Analysis
  Analyze average days on market

- **heat_mapping.detect_opportunities**: Detect Opportunities
  Detect high-opportunity areas based on specified criteria

- **heat_mapping.development**: Development Activity
  Track development and construction activity

- **heat_mapping.distress_indicator**: Distress Indicator
  Identify distressed property concentrations

- **heat_mapping.equity_analysis**: Equity Analysis
  Analyze equity levels in an area

- **heat_mapping.flip_potential**: Flip Potential Analysis
  Analyze flip potential in an area

- **heat_mapping.inventory**: Inventory Analysis
  Analyze current inventory levels

- **heat_mapping.price_trends**: Price Trend Analysis
  Analyze price trends in an area

- **heat_mapping.rental_yield**: Rental Yield Analysis
  Calculate rental yields in an area

- **heat_mapping.school_impact**: School District Impact
  Analyze school district impact on values

- **market_analysis.compare**: Market Comparison
  Compare multiple markets side by side

- **market_analysis.economic**: Economic Indicators
  Analyze economic factors affecting the market

- **market_analysis.forecast**: Price Forecasting
  Forecast future property prices

- **market_analysis.neighborhood**: Neighborhood Scoring
  Score neighborhood quality factors

- **market_analysis.rental**: Rental Market Analysis
  Analyze rental market conditions

- **market_analysis.roi**: Investment ROI Calculator
  Calculate investment returns

- **market_analysis.seasonality**: Seasonality Analysis
  Analyze seasonal patterns in the market

- **market_analysis.supply_demand**: Supply/Demand Analysis
  Analyze market supply and demand dynamics

- **market_analysis.timing**: Market Timing Indicator
  Get market timing signals

- **market_analysis.trends**: Market Trend Analysis
  Analyze market trends and momentum

- **market_velocity.compare_markets**: Compare Market Velocity
  Compare market velocity between multiple locations. Use when users want
    to compare markets, decide between areas, or understand relative demand. Examples:
    

- **market_velocity.explain_score**: Explain Velocity Score
  Explain why a specific area has its velocity score. Breaks down the
    component factors (DOM, absorption, inventory, permit activity). Use when users ask
    

- **market_velocity.find_cold_markets**: Find Cold Markets
  Find markets with low buyer velocity - useful for identifying areas to
    avoid or for finding deep value plays (though risky for wholesaling). Use when users
    ask about slow markets, cold areas, or places to avoid.

- **market_velocity.find_hot_markets**: Find Hot Markets
  Find markets with high buyer velocity/demand. Use when users say things
    like 

- **market_velocity.get_for_bounds**: Get Velocity for Map Bounds
  Get velocity data for a geographic bounding box. Used internally for
    heat map rendering.

- **market_velocity.get_rankings**: Get Velocity Rankings
  Get ranked list of markets by velocity. Use when users want to see
    

- **market_velocity.get_trend**: Get Velocity Trend
  Get the historical trend of market velocity for an area. Shows whether
    the market is heating up, cooling down, or stable. Use when users ask 

- **market_velocity.get_velocity**: Get Market Velocity
  Get the Market Velocity Index for a specific location. The velocity index
    measures buyer demand intensity on a 0-100 scale. Higher scores mean properties sell
    faster and wholesalers can assign contracts more confidently. Use this when users ask
    about market heat, buyer demand, how fast things are selling, or whether an area is
    good for wholesaling.

## permits (8 tools)

- **permit.analyze_patterns**: analyzePermitPatterns
  Analyze permit history to identify seller motivation signals and property condition.

- **permit.check_system_age**: checkSystemAge
  Check the age of major systems (roof, HVAC, plumbing, electrical) based on permit history.

- **permit.deferred_maintenance**: identifyDeferredMaintenance
  Find properties with no recent permits, indicating potential deferred maintenance.

- **permit.details**: getPermitDetails
  Get detailed information about a specific permit by ID.

- **permit.history**: getPermitHistory
  Get complete permit history for a property address. Use when user asks about permits, renovations, or construction history.

- **permit.metrics**: getPermitMetrics
  Get aggregated permit metrics for a property. Shows total permits, values, and activity patterns.

- **permit.search**: searchPermitsByArea
  Search for permits in a geographic area with filters. Use for finding renovation activity in neighborhoods.

- **permit.stalled**: findStalledPermits
  Find properties with stalled or expired permits - indicates abandoned projects or motivated sellers.

## portfolio (3 tools)

- **portfolio.geographic_concentration**: Geographic Concentration Analysis
  Analyze portfolio geographic concentration and diversification from actual data.

- **portfolio.performance_summary**: Portfolio Performance Summary
  Get a comprehensive summary of portfolio performance from actual deal data.

- **portfolio.roi_by_strategy**: ROI by Strategy
  Analyze ROI performance by investment strategy from actual deal data.

## predictive (7 tools)

- **predict.batch_motivation**: Batch Score Seller Motivation
  Calculate seller motivation scores for multiple properties at once. Returns scores, owner classifications, and recommendations for up to 20 properties. Useful for prioritizing lead lists.

- **predict.classify_owner**: Classify Owner Type
  Classify a property owner into categories: Individual (owner-occupied/absentee), Investor/Entity (LLC, corporation, trust), or Institutional (bank REO, government, estate). Uses pattern matching on owner name and optional signals.

- **predict.compare_motivation**: Compare Motivation Scores
  Compare seller motivation scores across multiple properties to prioritize outreach. Ranks properties and provides analysis of which to contact first.

- **predict.deal_close_probability**: Predict Deal Close Probability
  Predict the likelihood of a deal closing using market velocity and property data.

- **predict.optimal_offer_price**: Calculate Optimal Offer Price
  Calculate optimal offer price using real ARV from RentCast and market data.

- **predict.seller_motivation**: Predict Seller Motivation
  Analyze property and owner data using stratified scoring models. Uses different scoring logic based on owner type: Individual (long ownership = HIGH motivation), Investor/Entity (long ownership = LOW motivation), Institutional (process-focused). Optionally includes AI-enhanced DealFlow IQ score.

- **predict.time_to_close**: Predict Time to Close
  Predict deal timeline using market velocity data and deal type analysis.

## property_search (36 tools)

- **filter.compare**: compareFilters
  Compare two filter sets and recommend which to use

- **filter.create**: createCustomFilter
  Create filter from natural language description

- **filter.explain**: explainFilter
  Describe what a filter does with usage examples

- **filter.export**: exportFilterDefinition
  Export filter as shareable format

- **filter.import**: importFilter
  Import filter from definition

- **filter.optimize**: optimizeFilterCombination
  Analyze filter set, identify redundancies, suggest improvements

- **filter.performance**: getFilterPerformance
  Track filter usage and lead-to-deal conversion

- **filter.recommendations**: getFilterRecommendations
  Get filter recommendations based on success patterns

- **filter.refine**: suggestFilterRefinements
  Analyze results and suggest tightening/loosening filters

- **filter.suggest**: suggestFilters
  Analyze user goals and recommend filter combinations

- **filter.validate**: validateFilterCriteria
  Check filter for logical errors and impossible combinations

- **property_search.get_details**: Get Property Details
  Get detailed information about a specific property including owner info and comparable sales

- **property_search.search**: Search Properties
  Search for properties matching specified criteria including location, price, property type, and motivation indicators

- **property.comps**: getComparables
  Find comparable sold properties with adjustments

- **property.deal_potential**: analyzeDealPotential
  Calculate potential profit margins and assess risk factors

- **property.issues**: flagPropertyIssues
  Identify potential red flags including title issues, liens, and violations

- **property.motivation**: calculateMotivationScore
  Calculate seller motivation score with reasoning

- **property.neighborhood**: getNeighborhoodInsights
  Analyze surrounding area including crime, schools, and market trends

- **property.offer_price**: generateOfferPrice
  Calculate optimal offer price with justification

- **property.ownership**: getOwnershipHistory
  Retrieve ownership timeline and identify patterns

- **property.portfolio_compare**: compareToPortfolio
  Compare property to user past deals and predict success

- **property.rental**: assessRentalPotential
  Estimate rental income and calculate cap rate

- **property.repairs**: estimateRepairCosts
  Generate repair estimate with category breakdown

- **property.summary**: generatePropertySummary
  Generate AI-written property description for different audiences

- **property.time_on_market**: predictTimeOnMarket
  Predict days to sell based on market and property characteristics

- **property.valuation**: getPropertyValuation
  Get AI-powered property valuation with ARV estimate

- **search.analyze**: analyzeSearchPerformance
  Analyze search-to-deal conversion

- **search.by_description**: searchPropertiesByDescription
  Search for properties using natural language description

- **search.compare**: compareSearchResults
  Compare two search result sets

- **search.execute_filter**: executeFilter
  Execute a saved search filter

- **search.export**: exportSearchResults
  Export search results to CSV/JSON

- **search.recent**: getRecentSearches
  Get recent search history

- **search.refine**: refineSearch
  Refine search based on natural language

- **search.save_filter**: saveSearchAsFilter
  Save search criteria as a reusable filter

- **search.schedule**: scheduleSearch
  Schedule a recurring search

- **search.suggestions**: getSearchSuggestions
  Get AI-based search suggestions

## reporting (12 tools)

- **dashboard.activity**: Activity Summary
  Summarize your recent activity

- **dashboard.alerts**: Get Alerts
  Get current alerts and notifications

- **dashboard.anomalies**: Anomaly Detection
  Detect unusual patterns in your metrics

- **dashboard.compare_periods**: Compare Periods
  Compare metrics between two time periods

- **dashboard.funnel**: Conversion Funnel
  Analyze your deal conversion funnel

- **dashboard.goals**: Goal Tracking
  Track progress towards your goals

- **dashboard.insights**: Generate Insights
  Generate AI-powered insights from your data

- **dashboard.kpis**: KPI Status
  Get current KPI status and progress

- **dashboard.performance**: Performance Summary
  Get a summary of your performance metrics

- **dashboard.recommendations**: Get Recommendations
  Get AI-powered action recommendations

- **dashboard.report**: Generate Report
  Generate automated analytics reports

- **dashboard.trends**: Dashboard Trends
  Analyze trends across your key metrics

## utility (4 tools)

- **utility.calculate_distance**: Calculate Distance
  Calculate the straight-line (Haversine) distance between two points. Accepts coordinates or addresses.

- **utility.format_currency**: Format Currency
  Format a numeric amount as a currency string with proper locale-specific formatting, symbols, and notation.

- **utility.geocode**: Geocode Address
  Convert a street address or place name to geographic coordinates (latitude/longitude) using Mapbox Geocoding API.

- **utility.reverse_geocode**: Reverse Geocode
  Convert geographic coordinates (latitude/longitude) to a human-readable address using Mapbox Geocoding API.

## verticals (4 tools)

- **vertical.filters**: getVerticalFilters
  Get the available filters for a business vertical.

- **vertical.get_active**: getActiveVertical
  Get the user\

- **vertical.insights**: getVerticalInsights
  Get vertical-specific insights and opportunities for a property.

- **vertical.switch**: switchVertical
  Switch the user\

