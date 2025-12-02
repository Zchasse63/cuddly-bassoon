# Phase 9: Communication Automation

---

**Phase Number:** 9 of 12  
**Duration:** 1 Week  
**Dependencies:** [Phase 7: Buyer Intelligence](./PHASE_07_Buyer_Intelligence_2025-12-02.md), [Phase 8: Deal Pipeline](./PHASE_08_Deal_Pipeline_2025-12-02.md)  
**Status:** Not Started  
**Start Date:** TBD  
**Target Completion:** TBD  

---

## Overview

Integrate Twilio for SMS and SendGrid for email to enable automated and manual communication with sellers and buyers. This phase includes template management, AI-powered message generation, campaign automation, and communication tracking.

---

## Objectives

1. Integrate Twilio for SMS messaging
2. Integrate SendGrid for email
3. Build template management system
4. Implement AI-powered message generation
5. Create communication tracking and history
6. Build campaign automation for buyer blasts
7. Implement webhook handling for responses

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

## Success Criteria

- [ ] SMS sending and receiving functional
- [ ] Email sending and tracking functional
- [ ] Templates CRUD working
- [ ] AI message generation producing quality content
- [ ] Communication history accurate
- [ ] Buyer blast campaigns executing
- [ ] Webhooks processing correctly

---

## Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| SMS delivery issues | Medium | Medium | Multiple phone numbers, fallback |
| Email spam filtering | Medium | Medium | Proper domain setup, warm-up |
| Rate limit exceeded | Low | Medium | Queue management, throttling |
| Compliance violations | Low | High | Opt-out handling, audit logs |

---

## Related Phases

- **Previous Phase:** [Phase 8: Deal Pipeline](./PHASE_08_Deal_Pipeline_2025-12-02.md)
- **Next Phase:** [Phase 10: User Management](./PHASE_10_User_Management_2025-12-02.md)
- **Dependent Phases:** Phase 11 (communication analytics)

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

**Phase Document Version:** 1.0  
**Last Updated:** 2025-12-02

