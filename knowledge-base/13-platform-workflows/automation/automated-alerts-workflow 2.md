---
slug: automated-alerts-workflow
title: "Automated Alerts - Setting Up Property and Market Alerts"
category: Platform Workflows
subcategory: Automation
tags: [workflow-automation, workflow-alerts, tool-automation, action-monitor]
related_docs: [saved-searches-workflow, batch-operations-workflow, scheduled-reports-workflow]
difficulty_level: intermediate
---

# Automated Alerts Workflow

## Overview

Automated alerts notify you when new properties match your criteria or when market conditions change, helping you act quickly on opportunities.

## Types of Alerts

### New Property Alerts
Get notified when new properties match your criteria.

```
"Alert me when new properties appear that match:
- Miami-Dade County
- Absentee owner
- Equity above 40%
- Under $300,000"
```

### Price Change Alerts
Monitor price changes on specific properties or markets.

```
"Alert me when:
- Any property in my watch list drops price
- Properties in ZIP 33139 drop below asking price"
```

### Market Condition Alerts
Track market metric changes.

```
"Alert me when:
- Days on market in [area] drops below 30
- Inventory drops below 3 months supply
- Price trends shift direction"
```

### Motivation Score Alerts
Get notified about high-motivation opportunities.

```
"Alert me when any property in [area] gets a motivation score above 80"
```

## Setting Up Alerts

### From Saved Search
```
"Add alerts to my 'Miami High Equity' saved search"
```

Options:
- Alert frequency: Instant, Daily digest, Weekly
- Delivery method: Email, SMS, In-app
- Alert threshold: All matches or new only

### From Scratch
```
"Create a new alert for:
- Location: Tampa, FL
- Criteria: Out-of-state owner, 3+ beds
- Frequency: Daily digest
- Notify by: Email"
```

### From Current Search
```
"Set up alerts for this search"
```

## Alert Configuration Options

### Frequency Settings
| Frequency | Best For |
|-----------|----------|
| Instant | Hot markets, time-sensitive opportunities |
| Daily Digest | Most users, balanced approach |
| Weekly Summary | Slow markets, busy schedules |

### Delivery Methods
| Method | Pros | Cons |
|--------|------|------|
| Email | Detailed, searchable | May miss urgent ones |
| SMS | Immediate | Limited details |
| In-App | Rich data | Requires app open |
| Push Notification | Mobile awareness | Can be intrusive |

### Threshold Options
```
"Only alert me when:
- More than 5 new properties match
- Property value is under $200K
- Motivation score exceeds 70"
```

## Managing Alerts

### View All Alerts
```
"Show all my active alerts"
"List my alert settings"
```

### Modify Alert
```
"Change my Miami alert to daily digest"
"Add price filter to my Tampa alert"
"Update notification method to SMS"
```

### Pause Alert
```
"Pause my alerts for the next week"
"Temporarily disable the Miami alert"
```

### Delete Alert
```
"Delete the old Tampa alert"
"Remove alerts for areas I'm no longer targeting"
```

## Alert Best Practices

### Don't Over-Alert
Too many alerts leads to alert fatigue.

**Good:**
- 3-5 well-defined alerts
- Clear, specific criteria
- Appropriate frequency

**Bad:**
- Dozens of overlapping alerts
- Very broad criteria (too many matches)
- Instant alerts for non-urgent items

### Prioritize Alerts
```
Set up tiered alert system:
- Priority 1 (Instant): Properties meeting ALL your criteria
- Priority 2 (Daily): Properties meeting most criteria
- Priority 3 (Weekly): General market monitoring
```

### Review and Refine
```
Monthly alert review:
1. Check which alerts generated action
2. Disable alerts that aren't useful
3. Refine criteria on low-conversion alerts
4. Add alerts for new opportunities
```

## Alert Workflows

### Morning Alert Review
```
"Show me all alerts from overnight"
"Summarize new opportunities since yesterday"
```

### Alert-to-Action
```
When alert fires:
1. Review property basics
2. Check motivation score
3. Quick deal analysis
4. If promising → Full analysis
5. If not → Dismiss
```

### Alert Analytics
```
"Show my alert performance:
- Alerts triggered last 30 days
- Properties I acted on
- Deals closed from alerts"
```

## Smart Alert Strategies

### The Competition Alert
```
"Alert me when:
- Properties in my target area get listed on MLS
- Cash sales occur in my neighborhood
- Investor activity increases"
```

### The Timing Alert
```
"Alert me when:
- Properties I passed on drop price
- 90+ days pass on listings (motivated)
- Seasonal market shifts begin"
```

### The Opportunity Stack Alert
```
"Alert me when a property hits 3+ signals:
- Absentee owner
- High equity
- Long ownership
- Out of state"
```

## Alert Integration

### CRM Integration
```
"When alert fires, automatically:
- Add property to lead list
- Create follow-up task
- Assign to team member"
```

### Communication Integration
```
"When high-priority alert fires:
- Send to my acquisitions team
- Begin auto-outreach sequence
- Schedule property for driving"
```

## Troubleshooting Alerts

### Not Receiving Alerts
```
Check:
□ Alert is active (not paused)
□ Criteria isn't too restrictive
□ Email not in spam folder
□ Notification permissions enabled
□ Delivery method is correct
```

### Too Many Alerts
```
Solutions:
□ Add more specific criteria
□ Raise threshold values
□ Change to digest format
□ Consolidate similar alerts
```

### Irrelevant Alerts
```
Refine:
□ Tighten geographic area
□ Add price limits
□ Require higher motivation scores
□ Exclude certain property types
```

## Related Documentation

- [Saved Searches](saved-searches-workflow)
- [Batch Operations](batch-operations-workflow)
- [Automation Tools](tool-category-automation)
