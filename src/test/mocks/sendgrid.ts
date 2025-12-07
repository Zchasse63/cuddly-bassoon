/**
 * SendGrid API Mocks
 * Mock responses for SendGrid email sending and marketing services
 *
 * NOTE: SendGrid is ALWAYS mocked - it costs money and sends real emails
 */

import { vi } from 'vitest';

// Mock successful send response (SendGrid returns 202 with empty body)
export const mockSendResponse = {
  statusCode: 202,
  body: '',
  headers: {
    'x-message-id': 'mock-message-id-' + Date.now(),
  },
};

// Mock email activity response
export const mockEmailActivityResponse = {
  messages: [
    {
      from_email: 'sender@example.com',
      msg_id: 'mock-message-id-123',
      subject: 'Test Email Subject',
      to_email: 'recipient@example.com',
      status: 'delivered',
      opens_count: 1,
      clicks_count: 0,
      last_event_time: new Date().toISOString(),
    },
  ],
};

// Mock contact response
export const mockContactResponse = {
  job_id: 'mock-job-id-' + Date.now(),
  contacts: [
    {
      id: 'mock-contact-id',
      email: 'contact@example.com',
      first_name: 'Test',
      last_name: 'User',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
};

// Mock template response
export const mockTemplateResponse = {
  id: 'mock-template-id',
  name: 'Test Template',
  generation: 'dynamic',
  versions: [
    {
      id: 'mock-version-id',
      template_id: 'mock-template-id',
      active: 1,
      name: 'Test Version',
      subject: 'Test Subject {{name}}',
      html_content: '<html><body>Hello {{name}}</body></html>',
      plain_content: 'Hello {{name}}',
    },
  ],
};

// Mock stats response
export const mockStatsResponse = [
  {
    date: new Date().toISOString().split('T')[0],
    stats: [
      {
        metrics: {
          blocks: 0,
          bounce_drops: 0,
          bounces: 0,
          clicks: 5,
          deferred: 0,
          delivered: 100,
          invalid_emails: 0,
          opens: 45,
          processed: 100,
          requests: 100,
          spam_report_drops: 0,
          spam_reports: 0,
          unique_clicks: 3,
          unique_opens: 30,
          unsubscribe_drops: 0,
          unsubscribes: 1,
        },
      },
    ],
  },
];

// Mock sender verification response
export const mockSenderResponse = {
  id: 123456,
  nickname: 'Test Sender',
  from: {
    email: 'sender@example.com',
    name: 'Test Sender',
  },
  reply_to: {
    email: 'reply@example.com',
    name: 'Reply Handler',
  },
  address: '123 Test St',
  city: 'Test City',
  state: 'TS',
  zip: '12345',
  country: 'US',
  verified: true,
};

/**
 * Mock fetch for SendGrid APIs
 */
export function mockSendGridApis() {
  return vi.fn().mockImplementation((url: string, options?: RequestInit) => {
    const urlStr = url.toString();
    const method = options?.method || 'GET';

    // Send email (v3/mail/send)
    if (urlStr.includes('/mail/send')) {
      return Promise.resolve({
        ok: true,
        status: 202,
        statusText: 'Accepted',
        json: () => Promise.resolve({}),
        text: () => Promise.resolve(''),
        headers: new Headers({
          'x-message-id': 'mock-message-id-' + Date.now(),
        }),
      });
    }

    // Email activity
    if (urlStr.includes('/messages')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockEmailActivityResponse),
      });
    }

    // Contacts (Marketing API)
    if (urlStr.includes('/marketing/contacts')) {
      if (method === 'PUT') {
        return Promise.resolve({
          ok: true,
          status: 202,
          json: () => Promise.resolve({ job_id: 'mock-job-' + Date.now() }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockContactResponse),
      });
    }

    // Templates
    if (urlStr.includes('/templates')) {
      if (method === 'POST') {
        return Promise.resolve({
          ok: true,
          status: 201,
          json: () => Promise.resolve(mockTemplateResponse),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ templates: [mockTemplateResponse] }),
      });
    }

    // Stats
    if (urlStr.includes('/stats')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockStatsResponse),
      });
    }

    // Senders
    if (urlStr.includes('/senders') || urlStr.includes('/verified_senders')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ results: [mockSenderResponse] }),
      });
    }

    // Suppressions (bounces, blocks, spam reports)
    if (
      urlStr.includes('/suppression') ||
      urlStr.includes('/bounces') ||
      urlStr.includes('/blocks') ||
      urlStr.includes('/spam_reports')
    ) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    }

    // Default response
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });
  });
}

/**
 * Create a custom email activity response
 */
export function createEmailActivityResponse(
  emails: Array<{
    to: string;
    subject: string;
    status: 'delivered' | 'processed' | 'bounced' | 'dropped';
    opens?: number;
    clicks?: number;
  }>
) {
  return {
    messages: emails.map((email, i) => ({
      from_email: 'sender@example.com',
      msg_id: `mock-message-id-${i}`,
      subject: email.subject,
      to_email: email.to,
      status: email.status,
      opens_count: email.opens || 0,
      clicks_count: email.clicks || 0,
      last_event_time: new Date().toISOString(),
    })),
  };
}

/**
 * Mock SendGrid client for direct module mocking
 */
export const mockSendGridClient = {
  send: vi.fn().mockResolvedValue([mockSendResponse, {}]),
  sendMultiple: vi.fn().mockResolvedValue([mockSendResponse, {}]),
  setApiKey: vi.fn(),
  setSubstitutionWrappers: vi.fn(),
  setDefaultHeader: vi.fn(),
};

/**
 * Mock SendGrid mail helper for common use cases
 */
export const mockMailHelper = {
  MailService: {
    setApiKey: vi.fn(),
    send: vi.fn().mockResolvedValue([mockSendResponse, {}]),
    sendMultiple: vi.fn().mockResolvedValue([mockSendResponse, {}]),
  },
  classes: {
    Mail: vi.fn().mockImplementation(() => ({
      setFrom: vi.fn().mockReturnThis(),
      setSubject: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
      addContent: vi.fn().mockReturnThis(),
      setTemplateId: vi.fn().mockReturnThis(),
      addDynamicTemplateData: vi.fn().mockReturnThis(),
    })),
  },
};
