/**
 * Twilio API Mocks
 * Mock responses for Twilio SMS, Voice, and messaging services
 *
 * NOTE: Twilio is ALWAYS mocked - it costs money and sends real messages
 */

import { vi } from 'vitest';

// Mock SMS message response
export const mockSmsResponse = {
  sid: 'SM' + 'test'.repeat(8),
  accountSid: 'AC' + 'test'.repeat(8),
  to: '+15551234567',
  from: '+15559876543',
  body: 'Test message content',
  status: 'queued',
  numSegments: '1',
  numMedia: '0',
  direction: 'outbound-api',
  dateCreated: new Date().toISOString(),
  dateUpdated: new Date().toISOString(),
  dateSent: null,
  price: null,
  priceUnit: 'USD',
  uri: '/2010-04-01/Accounts/ACtest/Messages/SMtest.json',
};

// Mock call response
export const mockCallResponse = {
  sid: 'CA' + 'test'.repeat(8),
  accountSid: 'AC' + 'test'.repeat(8),
  to: '+15551234567',
  from: '+15559876543',
  status: 'queued',
  startTime: null,
  endTime: null,
  duration: null,
  price: null,
  priceUnit: 'USD',
  direction: 'outbound-api',
  dateCreated: new Date().toISOString(),
  dateUpdated: new Date().toISOString(),
  uri: '/2010-04-01/Accounts/ACtest/Calls/CAtest.json',
};

// Mock message list response
export const mockMessageListResponse = {
  messages: [mockSmsResponse],
  firstPageUri: '/2010-04-01/Accounts/ACtest/Messages.json?PageSize=50&Page=0',
  nextPageUri: null,
  previousPageUri: null,
  page: 0,
  pageSize: 50,
};

// Mock account response
export const mockAccountResponse = {
  sid: 'AC' + 'test'.repeat(8),
  ownerAccountSid: 'AC' + 'test'.repeat(8),
  friendlyName: 'Test Account',
  status: 'active',
  type: 'Full',
  dateCreated: '2024-01-01T00:00:00Z',
  dateUpdated: new Date().toISOString(),
};

// Mock verify response (for 2FA)
export const mockVerifyResponse = {
  sid: 'VE' + 'test'.repeat(8),
  serviceSid: 'VA' + 'test'.repeat(8),
  accountSid: 'AC' + 'test'.repeat(8),
  to: '+15551234567',
  channel: 'sms',
  status: 'pending',
  valid: false,
  dateCreated: new Date().toISOString(),
  dateUpdated: new Date().toISOString(),
};

// Mock verify check response
export const mockVerifyCheckResponse = {
  sid: 'VE' + 'test'.repeat(8),
  serviceSid: 'VA' + 'test'.repeat(8),
  accountSid: 'AC' + 'test'.repeat(8),
  to: '+15551234567',
  channel: 'sms',
  status: 'approved',
  valid: true,
  dateCreated: new Date().toISOString(),
  dateUpdated: new Date().toISOString(),
};

/**
 * Mock fetch for Twilio APIs
 */
export function mockTwilioApis() {
  return vi.fn().mockImplementation((url: string, options?: RequestInit) => {
    const urlStr = url.toString();
    const method = options?.method || 'GET';

    // SMS Messages
    if (urlStr.includes('/Messages')) {
      if (method === 'POST') {
        // Sending a message
        const body = options?.body;
        const formData =
          typeof body === 'string'
            ? Object.fromEntries(new URLSearchParams(body))
            : {};

        return Promise.resolve({
          ok: true,
          status: 201,
          json: () =>
            Promise.resolve({
              ...mockSmsResponse,
              to: formData.To || mockSmsResponse.to,
              from: formData.From || mockSmsResponse.from,
              body: formData.Body || mockSmsResponse.body,
              sid: 'SM' + Math.random().toString(36).substring(2, 10).repeat(4),
            }),
        });
      }

      // GET messages
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockMessageListResponse),
      });
    }

    // Voice Calls
    if (urlStr.includes('/Calls')) {
      if (method === 'POST') {
        return Promise.resolve({
          ok: true,
          status: 201,
          json: () =>
            Promise.resolve({
              ...mockCallResponse,
              sid: 'CA' + Math.random().toString(36).substring(2, 10).repeat(4),
            }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            calls: [mockCallResponse],
            page: 0,
            pageSize: 50,
          }),
      });
    }

    // Verify (2FA)
    if (urlStr.includes('/Verifications')) {
      if (method === 'POST') {
        return Promise.resolve({
          ok: true,
          status: 201,
          json: () => Promise.resolve(mockVerifyResponse),
        });
      }
    }

    if (urlStr.includes('/VerificationCheck')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockVerifyCheckResponse),
      });
    }

    // Account info
    if (urlStr.includes('/Accounts')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAccountResponse),
      });
    }

    // Default response
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });
}

/**
 * Create a custom SMS response for specific test scenarios
 */
export function createSmsResponse(overrides: Partial<typeof mockSmsResponse>) {
  return {
    ...mockSmsResponse,
    ...overrides,
    sid: overrides.sid || 'SM' + Math.random().toString(36).substring(2, 10).repeat(4),
  };
}

/**
 * Create a failed delivery response
 */
export function createFailedSmsResponse(errorCode: number, errorMessage: string) {
  return {
    ...mockSmsResponse,
    status: 'failed',
    errorCode,
    errorMessage,
  };
}

/**
 * Mock Twilio client for direct module mocking
 */
export const mockTwilioClient = {
  messages: {
    create: vi.fn().mockResolvedValue(mockSmsResponse),
    list: vi.fn().mockResolvedValue([mockSmsResponse]),
    get: vi.fn().mockReturnValue({
      fetch: vi.fn().mockResolvedValue(mockSmsResponse),
    }),
  },
  calls: {
    create: vi.fn().mockResolvedValue(mockCallResponse),
    list: vi.fn().mockResolvedValue([mockCallResponse]),
  },
  verify: {
    v2: {
      services: vi.fn().mockReturnValue({
        verifications: {
          create: vi.fn().mockResolvedValue(mockVerifyResponse),
        },
        verificationChecks: {
          create: vi.fn().mockResolvedValue(mockVerifyCheckResponse),
        },
      }),
    },
  },
};
