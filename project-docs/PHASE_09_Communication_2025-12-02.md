# Phase 9: Communication Automation

---

**Phase Number:** 9 of 12
**Duration:** 2.5 Weeks
**Dependencies:** [Phase 5: AI/LLM Integration](./PHASE_05_AI_LLM_Integration_2025-12-02.md), [Phase 7: Buyer Intelligence](./PHASE_07_Buyer_Intelligence_2025-12-02.md), [Phase 8: Deal Pipeline](./PHASE_08_Deal_Pipeline_2025-12-02.md)
**Status:** Not Started
**Start Date:** TBD
**Target Completion:** TBD
**AI Tools in Phase:** 20
**New Database Tables:** 4

---

## Overview

Integrate Twilio for SMS and SendGrid for email to enable automated and manual communication with sellers and buyers. This phase includes template management, AI-powered message generation, campaign automation, and communication tracking.

**Additionally, this phase implements:**
- **Schema Extension** - 4 new database tables for messaging and workflows
- **Sensitivity-Aware Outreach** - Filters forbidden topics from written communications
- **Unified Communication Inbox** - Single view for all SMS, email, voicemail
- **Workflow Automation Engine** - Trigger-based automated actions
- **Skip Tracing AI Tools** (10) - Contact information discovery
- **Notification AI Tools** (10) - Alert management and delivery

---

## Objectives

1. Integrate Twilio for SMS messaging
2. Integrate SendGrid for email
3. Build template management system
4. Implement AI-powered message generation
5. Create communication tracking and history
6. Build campaign automation for buyer blasts
7. Implement webhook handling for responses
8. **Create 4 new database tables (Schema Extension)**
9. **Implement Sensitivity-Aware Outreach filtering**
10. **Build Unified Communication Inbox**
11. **Create Workflow Automation Engine**
12. **Implement 10 Skip Tracing AI Tools**
13. **Implement 10 Notification AI Tools**

---

## Technology Requirements

| Service | Purpose | Key Features |
|---------|---------|--------------|
| Twilio | SMS messaging | Send/receive SMS, phone verification |
| SendGrid | Email delivery | Transactional email, templates |
| Claude AI | Message generation | Personalized content |

---

## Task Hierarchy

### 1. Twilio SMS Integration
- [ ] **1.1 Twilio Client Setup**
  - [ ] Install twilio package
  - [ ] Create lib/communication/twilio.ts
  - [ ] Configure with Account SID and Auth Token
  - [ ] Set up phone number(s)
  - [ ] Test connection

- [ ] **1.2 Send SMS Function**
  - [ ] Create sendSMS(to, body) function
  - [ ] Validate phone numbers
  - [ ] Handle character limits
  - [ ] Return message SID
  - [ ] Log all sent messages

- [ ] **1.3 Receive SMS Webhook**
  - [ ] Create app/api/webhooks/twilio/route.ts
  - [ ] Validate Twilio signature
  - [ ] Parse incoming message
  - [ ] Store in messages table
  - [ ] Link to deal/buyer if possible
  - [ ] Trigger notification

- [ ] **1.4 SMS API Routes**
  - [ ] POST /api/sms/send
  - [ ] Accept recipient, message, deal_id
  - [ ] Validate user permissions
  - [ ] Return send status

---

### 2. SendGrid Email Integration
- [ ] **2.1 SendGrid Client Setup**
  - [ ] Install @sendgrid/mail
  - [ ] Create lib/communication/sendgrid.ts
  - [ ] Configure with API key
  - [ ] Set up sender domain/email
  - [ ] Test connection

- [ ] **2.2 Send Email Function**
  - [ ] Create sendEmail(to, subject, body) function
  - [ ] Support HTML and plain text
  - [ ] Support attachments
  - [ ] Return message ID
  - [ ] Log all sent emails

- [ ] **2.3 Email Webhooks**
  - [ ] Create app/api/webhooks/sendgrid/route.ts
  - [ ] Handle delivery events
  - [ ] Handle open events
  - [ ] Handle click events
  - [ ] Handle bounce/spam events
  - [ ] Update message status

- [ ] **2.4 Email API Routes**
  - [ ] POST /api/email/send
  - [ ] Accept recipient, subject, body, deal_id
  - [ ] Support template_id
  - [ ] Validate user permissions

---

### 3. Template Management
- [ ] **3.1 Template CRUD**
  - [ ] Create templates table (Phase 2)
  - [ ] POST /api/templates (create)
  - [ ] GET /api/templates (list)
  - [ ] GET /api/templates/[id] (detail)
  - [ ] PATCH /api/templates/[id] (update)
  - [ ] DELETE /api/templates/[id]

- [ ] **3.2 Template Editor**
  - [ ] Create components/templates/TemplateEditor.tsx
  - [ ] Template name and category
  - [ ] Channel selection (SMS/email)
  - [ ] Subject line (email only)
  - [ ] Body with variable placeholders
  - [ ] Preview with sample data

- [ ] **3.3 Template Variables**
  - [ ] Define available variables:
    - [ ] {{seller_name}}
    - [ ] {{property_address}}
    - [ ] {{offer_amount}}
    - [ ] {{buyer_name}}
    - [ ] {{user_name}}
    - [ ] {{user_phone}}
  - [ ] Variable insertion UI
  - [ ] Variable validation

- [ ] **3.4 Default Templates**
  - [ ] Initial seller outreach (SMS)
  - [ ] Follow-up message (SMS)
  - [ ] Offer letter (email)
  - [ ] Buyer deal blast (email)
  - [ ] Closing confirmation (email)

---

### 4. AI Message Generation
- [ ] **4.1 Message Generator Service**
  - [ ] Create lib/communication/ai-generator.ts
  - [ ] Use Claude Sonnet for generation
  - [ ] Accept context (deal, buyer, purpose)
  - [ ] Generate personalized message
  - [ ] Return editable draft

- [ ] **4.2 Generation Prompts**
  - [ ] Seller initial contact prompt
  - [ ] Seller follow-up prompt
  - [ ] Offer explanation prompt
  - [ ] Buyer deal presentation prompt
  - [ ] Negotiation response prompt

- [ ] **4.3 AI Generation UI**
  - [ ] "Generate with AI" button
  - [ ] Context selection
  - [ ] Tone selection (professional, friendly)
  - [ ] Preview and edit
  - [ ] Use or regenerate

- [ ] **4.4 Generation API**
  - [ ] POST /api/ai/generate-message
  - [ ] Accept type, context, tone
  - [ ] Return generated message
  - [ ] Track generation usage

---

### 5. Communication History
- [ ] **5.1 Message Storage**
  - [ ] Store all messages in messages table
  - [ ] Link to deal_id and/or buyer_id
  - [ ] Track channel (SMS/email)
  - [ ] Track direction (inbound/outbound)
  - [ ] Track status (sent, delivered, read)

- [ ] **5.2 Conversation View**
  - [ ] Create ConversationThread component
  - [ ] Show messages chronologically
  - [ ] Distinguish inbound/outbound
  - [ ] Show delivery status
  - [ ] Quick reply input

- [ ] **5.3 Communication Dashboard**
  - [ ] Recent messages list
  - [ ] Unread/pending responses
  - [ ] Filter by channel, deal, buyer
  - [ ] Search messages

---

### 6. Buyer Blast Campaigns
- [ ] **6.1 Campaign Creation**
  - [ ] Create components/campaigns/CampaignForm.tsx
  - [ ] Select deal to blast
  - [ ] Select buyer criteria (or all matched)
  - [ ] Choose template
  - [ ] Schedule or send immediately

- [ ] **6.2 Campaign Execution**
  - [ ] Create lib/communication/campaign.ts
  - [ ] Queue messages for sending
  - [ ] Respect rate limits
  - [ ] Track send progress
  - [ ] Handle failures

- [ ] **6.3 Campaign Tracking**
  - [ ] Track messages sent
  - [ ] Track delivery rates
  - [ ] Track response rates
  - [ ] Show campaign results

- [ ] **6.4 Campaign API**
  - [ ] POST /api/campaigns (create)
  - [ ] GET /api/campaigns (list)
  - [ ] GET /api/campaigns/[id] (detail)
  - [ ] POST /api/campaigns/[id]/send

---

### 7. Quick Actions
- [ ] **7.1 One-Click SMS**
  - [ ] SMS button on deal/buyer cards
  - [ ] Pre-fill recipient
  - [ ] Template selection
  - [ ] Quick send

- [ ] **7.2 One-Click Email**
  - [ ] Email button on deal/buyer cards
  - [ ] Pre-fill recipient
  - [ ] Template selection
  - [ ] Quick send

- [ ] **7.3 Click-to-Call**
  - [ ] Call button with tel: link
  - [ ] Log call activity
  - [ ] Call outcome modal
  - [ ] Schedule follow-up

---

### 8. Notification System
- [ ] **8.1 In-App Notifications**
  - [ ] Create notifications table
  - [ ] Notification types:
    - [ ] New inbound message
    - [ ] Message delivery failure
    - [ ] Campaign complete
    - [ ] Response received
  - [ ] Mark as read

- [ ] **8.2 Notification UI**
  - [ ] Notification bell icon
  - [ ] Notification dropdown
  - [ ] Unread count badge
  - [ ] Click to navigate

- [ ] **8.3 Email Notifications**
  - [ ] Send email for important events
  - [ ] User preference settings
  - [ ] Digest option (daily summary)

---

### 9. Compliance & Opt-Out
- [ ] **9.1 Opt-Out Handling**
  - [ ] Detect opt-out keywords (STOP, UNSUBSCRIBE)
  - [ ] Mark contact as opted out
  - [ ] Prevent future messages
  - [ ] Log opt-out

- [ ] **9.2 Compliance Features**
  - [ ] Include opt-out instructions
  - [ ] Respect quiet hours
  - [ ] Rate limit per recipient
  - [ ] Audit trail

---

### 10. Schema Extension (4 New Tables)
- [ ] **10.1 Create messages table extension**
  - [ ] Add fields: voicemail_url, transcription, sensitivity_flags
  - [ ] Add channel enum: sms, email, voicemail, in_app
  - [ ] Add thread_id for conversation grouping
  - [ ] Enable RLS

- [ ] **10.2 Create message_templates table extension**
  - [ ] Add fields: sensitivity_level, forbidden_topics
  - [ ] Add template_type: outreach, follow_up, offer, blast
  - [ ] Add approval_required flag

- [ ] **10.3 Create workflows table**
  - [ ] Fields: id, user_id, name, trigger_type, trigger_config, actions, is_active
  - [ ] Trigger types: lead_status_change, deal_stage_change, time_based, property_match
  - [ ] Actions as JSON array
  - [ ] Enable RLS

- [ ] **10.4 Create workflow_executions table**
  - [ ] Fields: id, workflow_id, trigger_data, status, started_at, completed_at, error
  - [ ] Status: pending, running, completed, failed
  - [ ] Execution log for debugging

---

### 11. Sensitivity-Aware Outreach (from CRM Sales Intelligence Hub)
- [ ] **11.1 Create Sensitivity Filter**
  - [ ] Create lib/communication/sensitivity-filter.ts
  - [ ] Define forbidden topics for written communication:
    - Divorce/separation
    - Foreclosure/financial distress
    - Death/probate
    - Health issues
    - Legal troubles
  - [ ] Scan outgoing messages for forbidden content
  - [ ] Block or flag messages with sensitive content

- [ ] **11.2 Sensitivity Detection**
  - [ ] Use Claude Haiku for content analysis
  - [ ] Detect explicit and implicit references
  - [ ] Return sensitivity score and flags
  - [ ] Suggest alternative phrasing

- [ ] **11.3 Sensitivity UI**
  - [ ] Warning indicator on message compose
  - [ ] Block send if sensitivity detected
  - [ ] Show which content triggered flag
  - [ ] Provide rewrite suggestions

- [ ] **11.4 Sensitivity Logging**
  - [ ] Log all sensitivity detections
  - [ ] Track false positives
  - [ ] Enable admin review
  - [ ] Compliance audit trail

- [ ] **11.5 Caller Briefing Integration**
  - [ ] Include sensitivity info in caller briefings
  - [ ] Mark topics as "verbal only"
  - [ ] Provide talking points for sensitive situations

---

### 12. Unified Communication Inbox (from CRM Sales Intelligence Hub)
- [ ] **12.1 Inbox UI**
  - [ ] Create components/inbox/UnifiedInbox.tsx
  - [ ] Single view for all channels (SMS, email, voicemail)
  - [ ] Conversation threading
  - [ ] Filter by channel, status, lead/deal
  - [ ] Search across all messages

- [ ] **12.2 Conversation Threading**
  - [ ] Group messages by contact
  - [ ] Show all channels in single thread
  - [ ] Chronological ordering
  - [ ] Unread indicators

- [ ] **12.3 Voicemail Integration**
  - [ ] Twilio voicemail transcription
  - [ ] Store transcription in messages table
  - [ ] Playback in inbox
  - [ ] Mark as reviewed

- [ ] **12.4 Quick Reply**
  - [ ] Reply from inbox
  - [ ] Channel selection (reply via same channel)
  - [ ] Template insertion
  - [ ] AI-assisted reply

- [ ] **12.5 Inbox API**
  - [ ] GET /api/inbox (all messages)
  - [ ] GET /api/inbox/threads (grouped by contact)
  - [ ] GET /api/inbox/unread (unread count)
  - [ ] PATCH /api/inbox/[id]/read (mark as read)

---

### 13. Workflow Automation Engine (from CRM Sales Intelligence Hub)
- [ ] **13.1 Workflow Builder**
  - [ ] Create lib/automation/workflow-engine.ts
  - [ ] Define trigger types:
    - Lead status change
    - Deal stage change
    - Time-based (schedule)
    - Property match (new property matches criteria)
    - Inbound message received
  - [ ] Define action types:
    - Send SMS
    - Send email
    - Create task
    - Update lead status
    - Assign to user
    - Add to list
    - Notify user

- [ ] **13.2 Workflow UI**
  - [ ] Create components/automation/WorkflowBuilder.tsx
  - [ ] Visual workflow editor
  - [ ] Trigger configuration
  - [ ] Action chain builder
  - [ ] Condition/branching support
  - [ ] Test workflow button

- [ ] **13.3 Workflow Execution**
  - [ ] Create lib/automation/executor.ts
  - [ ] Listen for trigger events
  - [ ] Execute action chain
  - [ ] Handle errors gracefully
  - [ ] Log execution details

- [ ] **13.4 Workflow Templates**
  - [ ] New lead follow-up sequence
  - [ ] Stale deal reminder
  - [ ] Buyer match notification
  - [ ] Weekly digest
  - [ ] Closing countdown

- [ ] **13.5 Workflow API**
  - [ ] POST /api/workflows (create)
  - [ ] GET /api/workflows (list)
  - [ ] GET /api/workflows/[id] (detail)
  - [ ] PATCH /api/workflows/[id] (update)
  - [ ] POST /api/workflows/[id]/test (test run)
  - [ ] GET /api/workflows/[id]/executions (history)

---

### 14. Skip Tracing AI Tools (10 Tools)
- [ ] **14.1 skipTraceProperty**
  - [ ] Implement in lib/ai/tools/skip-trace-tools.ts
  - [ ] Accept property address
  - [ ] Return owner contact information
  - [ ] Include confidence scores

- [ ] **14.2 batchSkipTraceList**
  - [ ] Accept lead list ID
  - [ ] Skip trace all properties
  - [ ] Return results summary
  - [ ] Track costs

- [ ] **14.3 verifyContactInfo**
  - [ ] Validate phone numbers
  - [ ] Validate email addresses
  - [ ] Check for disconnected numbers
  - [ ] Return verification status

- [ ] **14.4 findAlternateContacts**
  - [ ] Search for additional contacts
  - [ ] Find relatives/associates
  - [ ] Return contact list

- [ ] **14.5 enrichContactData**
  - [ ] Add demographic data
  - [ ] Add social profiles
  - [ ] Add property ownership history

- [ ] **14.6 getContactHistory**
  - [ ] Retrieve all contact attempts
  - [ ] Show outcomes
  - [ ] Calculate best contact time

- [ ] **14.7 suggestContactMethod**
  - [ ] Analyze contact data
  - [ ] Recommend best approach
  - [ ] Consider time of day

- [ ] **14.8 trackSkipTraceUsage**
  - [ ] Monitor skip trace credits
  - [ ] Alert on low balance
  - [ ] Generate usage report

- [ ] **14.9 compareSkipTraceProviders**
  - [ ] Compare results from multiple sources
  - [ ] Identify best provider for area
  - [ ] Track accuracy rates

- [ ] **14.10 exportSkipTraceResults**
  - [ ] Export to CSV
  - [ ] Include all contact data
  - [ ] Support filtering

---

### 15. Notification AI Tools (10 Tools)
- [ ] **15.1 getAlerts**
  - [ ] Implement in lib/ai/tools/notification-tools.ts
  - [ ] Retrieve user's active alerts
  - [ ] Filter by type, priority
  - [ ] Return formatted list

- [ ] **15.2 createCustomAlert**
  - [ ] Accept alert criteria
  - [ ] Create alert rule
  - [ ] Configure notification method

- [ ] **15.3 dismissAlert**
  - [ ] Mark alert as dismissed
  - [ ] Log dismissal
  - [ ] Prevent re-triggering

- [ ] **15.4 snoozeAlert**
  - [ ] Temporarily hide alert
  - [ ] Set snooze duration
  - [ ] Re-trigger after snooze

- [ ] **15.5 prioritizeAlerts**
  - [ ] Analyze alert importance
  - [ ] Sort by priority
  - [ ] Highlight urgent items

- [ ] **15.6 summarizeAlerts**
  - [ ] Create daily/weekly summary
  - [ ] Group by category
  - [ ] Highlight trends

- [ ] **15.7 configureNotificationPreferences**
  - [ ] Set channel preferences
  - [ ] Set quiet hours
  - [ ] Set frequency limits

- [ ] **15.8 getNotificationHistory**
  - [ ] Retrieve past notifications
  - [ ] Show delivery status
  - [ ] Track engagement

- [ ] **15.9 testNotification**
  - [ ] Send test notification
  - [ ] Verify delivery
  - [ ] Check formatting

- [ ] **15.10 analyzeNotificationEffectiveness**
  - [ ] Track open rates
  - [ ] Track action rates
  - [ ] Recommend improvements

---

## Success Criteria

- [ ] SMS sending and receiving functional
- [ ] Email sending and tracking functional
- [ ] Templates CRUD working
- [ ] AI message generation producing quality content
- [ ] Communication history accurate
- [ ] Buyer blast campaigns executing
- [ ] Webhooks processing correctly
- [ ] **All 4 new database tables created with RLS**
- [ ] **Sensitivity filter blocking forbidden content 100%**
- [ ] **Unified Inbox showing all channels**
- [ ] **Workflow Automation executing triggers correctly**
- [ ] **All 10 Skip Tracing AI Tools implemented**
- [ ] **All 10 Notification AI Tools implemented**

---

## Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| SMS delivery issues | Medium | Medium | Multiple phone numbers, fallback |
| Email spam filtering | Medium | Medium | Proper domain setup, warm-up |
| Rate limit exceeded | Low | Medium | Queue management, throttling |
| Compliance violations | Low | High | Opt-out handling, audit logs |
| Sensitivity filter false positives | Medium | Medium | Human review option, tuning |
| Workflow infinite loops | Low | High | Loop detection, execution limits |
| Skip trace API costs | Medium | Medium | Usage monitoring, budget alerts |

---

## Related Phases

- **Previous Phase:** [Phase 8: Deal Pipeline](./PHASE_08_Deal_Pipeline_2025-12-02.md)
- **Next Phase:** [Phase 10: User Management](./PHASE_10_User_Management_2025-12-02.md)
- **Dependent Phases:** Phase 11 (communication analytics)
- **AI Framework:** Uses Tool Execution Framework from Phase 5

---

## AI Tool Summary

| Category | Tool Count | Key Capabilities |
|----------|------------|------------------|
| Skip Tracing Tools | 10 | Contact discovery, verification, enrichment |
| Notification Tools | 10 | Alert management, preferences, delivery |
| **Total** | **20** | |

---

## Database Schema Extension Summary

| Table | Purpose | Key Fields |
|-------|---------|------------|
| messages (extended) | All communications | channel, thread_id, sensitivity_flags |
| message_templates (extended) | Template management | sensitivity_level, forbidden_topics |
| workflows | Automation rules | trigger_type, actions, is_active |
| workflow_executions | Execution log | status, trigger_data, error |

---

## Sensitivity Topics Reference

| Topic | Detection Keywords | Handling |
|-------|-------------------|----------|
| Divorce/Separation | divorce, separated, ex-spouse | Verbal only |
| Foreclosure | foreclosure, bank-owned, default | Verbal only |
| Death/Probate | deceased, probate, inherited, estate | Verbal only |
| Health Issues | illness, hospital, medical | Verbal only |
| Legal Troubles | lawsuit, judgment, lien | Verbal only |

---

## Phase Completion Summary

> **Template - Complete after phase is finished**

### Completed Successfully
- [ ] Item 1

### Deferred or Blocked
- [ ] Item (Reason: )

### Lessons Learned
-

### Recommendations for Next Phase
-

---

**Phase Document Version:** 2.0
**Last Updated:** 2025-12-02
**Major Updates:** Added Schema Extension (4 tables), Sensitivity-Aware Outreach, Unified Inbox, Workflow Automation, 20 AI Tools from CRM Sales Intelligence Hub specification

