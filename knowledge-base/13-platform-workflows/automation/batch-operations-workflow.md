---
slug: batch-operations-workflow
title: "Batch Operations - Processing Multiple Properties Efficiently"
category: Platform Workflows
subcategory: Automation
tags: [workflow-automation, workflow-batch, tool-batch-operations, action-process]
related_docs: [batch-search-workflow, automated-alerts-workflow, skip-tracing-workflow]
difficulty_level: advanced
---

# Batch Operations Workflow

## Overview

Batch operations allow you to perform actions on multiple properties simultaneously, dramatically increasing efficiency for tasks like analysis, enrichment, and outreach.

## Available Batch Operations

### Batch Analysis
```
"Analyze all 50 properties from my last search"
"Run deal analysis on this list of addresses"
```

Operations performed per property:
- Property details lookup
- AVM valuation
- Motivation scoring
- Quick MAO calculation

### Batch Enrichment
```
"Enrich all properties in my lead list with:
- Skip trace data
- Permit history
- Market statistics"
```

### Batch Scoring
```
"Calculate motivation scores for all properties in this list"
"Score these 100 properties for investment potential"
```

### Batch Export
```
"Export all analyzed properties to spreadsheet"
"Create mailing list from these leads"
```

## Running Batch Operations

### From Search Results
```
"Run batch analysis on all search results"
"Batch enrich these 75 properties"
```

### From Saved List
```
"Batch analyze my 'Hot Leads' list"
"Run skip trace on 'Follow-up Required' list"
```

### From File Import
```
"Import this address list and batch analyze"
"Upload spreadsheet and enrich all properties"
```

## Batch Operation Settings

### Processing Options
| Option | Description |
|--------|-------------|
| Speed | Fast (basic) vs Complete (thorough) |
| On Error | Stop, Skip, or Retry |
| Output | Results format and destination |
| Notify | Alert when complete |

### Resource Management
```
"Run batch with:
- Priority: High
- Max concurrent: 10
- Timeout per item: 30 seconds"
```

## Managing Large Batches

### Chunking Large Lists
```
For lists > 500 properties:
1. Chunk into batches of 100-200
2. Process in sequence
3. Combine results after
```

### Progress Monitoring
```
"Show batch progress"
"How many properties have been processed?"
```

### Pause/Resume
```
"Pause this batch operation"
"Resume batch processing"
```

## Batch Analysis Workflow

### Step 1: Prepare Your List
```
"Filter my leads to properties that haven't been analyzed"
```

### Step 2: Start Batch Analysis
```
"Batch analyze these [X] properties with full analysis"
```

### Step 3: Monitor Progress
```
"Show batch progress and any errors"
```

### Step 4: Review Results
```
"Show batch analysis summary:
- Properties analyzed
- Average motivation score
- Top opportunities
- Failed lookups"
```

### Step 5: Export/Action
```
"Export all properties with motivation score > 70
to my CRM as high-priority leads"
```

## Batch Enrichment Workflow

### Available Enrichment Types
| Type | Data Added |
|------|------------|
| Skip Trace | Phone, email, current address |
| Permit History | All permits for property |
| Market Data | Area statistics |
| Valuation | AVM and comps |
| Owner Details | Full owner profile |

### Step 1: Select Enrichment
```
"Batch enrich with skip trace and permit history"
```

### Step 2: Run Enrichment
```
"Start enrichment on 200 properties"
```

### Step 3: Review Completion
```
"Show enrichment results:
- Success rate
- Data coverage
- Failed lookups"
```

## Batch Export Options

### Spreadsheet Export
```
"Export batch results to Excel with columns:
- Address
- Owner name
- Phone numbers
- Estimated value
- Motivation score
- MAO"
```

### CRM Export
```
"Export to CRM with status: New Lead"
```

### Mail Merge Export
```
"Export for direct mail:
- Owner name
- Mailing address
- Property address
- Custom merge fields"
```

### Calling List Export
```
"Export calling list:
- Priority order by motivation score
- Include all phone numbers
- Add talking points"
```

## Error Handling

### Common Batch Errors
| Error | Cause | Resolution |
|-------|-------|------------|
| Address not found | Invalid address format | Clean data, retry |
| No owner data | Record unavailable | Skip or flag |
| Timeout | Slow processing | Retry with longer timeout |
| Rate limit | Too many requests | Slow down, retry later |

### Error Recovery
```
"Show all failed items from batch"
"Retry failed items only"
"Export failures for manual review"
```

### Partial Completion
```
"Batch 85% complete with 15 failures.
- Continue with remaining
- Review and retry failures
- Export partial results"
```

## Batch Performance Tips

### Optimize for Speed
- Use filters to reduce list size first
- Choose "Fast" mode for initial screening
- Run during off-peak hours
- Process in reasonable chunks (100-500)

### Optimize for Quality
- Use "Complete" mode for final analysis
- Include all enrichment types needed
- Verify data quality before processing
- Review and validate results

### Cost Management
```
Batch operations may have costs:
- Skip tracing: $0.15-0.50 per record
- Data enrichment: $0.05-0.25 per record

Plan accordingly:
- Pre-filter before expensive operations
- Use free operations first to qualify leads
```

## Automated Batch Workflows

### Scheduled Batches
```
"Schedule daily batch:
1. Run saved search
2. Filter to new properties
3. Batch analyze
4. Add high-score to lead list
5. Alert me with summary"
```

### Triggered Batches
```
"When alert fires for 10+ new properties:
- Auto-batch analyze
- Skip trace top 5 by score
- Add to follow-up queue"
```

## Batch Operation Templates

### New Market Entry Batch
```
1. Search entire new market area
2. Batch score all properties
3. Filter to score > 50
4. Batch full analysis
5. Export top 100 for action
```

### Weekly Lead Processing
```
1. Pull all new leads from week
2. Batch analyze
3. Batch skip trace score > 60
4. Sort by motivation score
5. Distribute to team
```

### Buyer Match Batch
```
1. Get buyer criteria
2. Search matching properties
3. Batch analyze for buyer fit
4. Generate match reports
5. Send to buyer
```

## Related Documentation

- [Batch Search](batch-search-workflow)
- [Automated Alerts](automated-alerts-workflow)
- [Skip Tracing](skip-tracing-workflow)
- [Batch Operation Tools](tool-category-batch-operations)
