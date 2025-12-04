/**
 * Skip Trace API Mocks
 * Mock responses for skip tracing services
 */

import { vi } from 'vitest';

export const mockSkipTraceResponse = {
  success: true,
  data: {
    id: 'trace-001',
    status: 'complete',
    subject: {
      firstName: 'John',
      lastName: 'Doe',
      middleName: 'Michael',
      age: 45,
      dateOfBirth: '1979-05-15',
    },
    phones: [
      {
        number: '+1-305-555-1234',
        type: 'mobile',
        carrier: 'Verizon',
        lineType: 'wireless',
        status: 'active',
        confidence: 0.95,
        lastSeen: '2024-01-10',
      },
      {
        number: '+1-305-555-5678',
        type: 'landline',
        carrier: 'AT&T',
        lineType: 'landline',
        status: 'active',
        confidence: 0.85,
        lastSeen: '2023-12-01',
      },
    ],
    emails: [
      {
        address: 'johndoe@gmail.com',
        type: 'personal',
        status: 'valid',
        confidence: 0.92,
        lastSeen: '2024-01-08',
      },
      {
        address: 'john.doe@company.com',
        type: 'work',
        status: 'valid',
        confidence: 0.78,
        lastSeen: '2023-11-15',
      },
    ],
    addresses: [
      {
        street: '123 Main St',
        city: 'Miami',
        state: 'FL',
        zip: '33101',
        type: 'current',
        confidence: 0.98,
        residenceDuration: '5 years',
      },
      {
        street: '456 Oak Ave',
        city: 'Fort Lauderdale',
        state: 'FL',
        zip: '33301',
        type: 'previous',
        confidence: 0.75,
        residenceDuration: '3 years',
      },
    ],
    relatives: [
      {
        name: 'Jane Doe',
        relationship: 'spouse',
        phone: '+1-305-555-9999',
      },
    ],
    associates: [
      {
        name: 'Bob Smith',
        relationship: 'business',
        phone: '+1-305-555-8888',
      },
    ],
    socialProfiles: [
      { platform: 'linkedin', url: 'linkedin.com/in/johndoe' },
      { platform: 'facebook', url: 'facebook.com/johndoe' },
    ],
  },
  creditsUsed: 1,
  creditsRemaining: 999,
};

export const mockPhoneValidationResponse = {
  success: true,
  data: {
    phone: '+1-305-555-1234',
    valid: true,
    type: 'mobile',
    carrier: 'Verizon',
    lineType: 'wireless',
    location: { city: 'Miami', state: 'FL', country: 'US' },
    status: 'active',
    spam: false,
    doNotCall: false,
  },
};

export const mockEmailValidationResponse = {
  success: true,
  data: {
    email: 'johndoe@gmail.com',
    valid: true,
    deliverable: true,
    format: 'valid',
    domain: {
      name: 'gmail.com',
      type: 'free',
      mxRecords: true,
    },
    disposable: false,
    role: false,
    spamTrap: false,
  },
};

export const mockCreditsResponse = {
  success: true,
  data: {
    available: 999,
    used: 1,
    total: 1000,
    expiresAt: '2025-12-31',
    plan: 'professional',
  },
};

/**
 * Mock fetch for Skip Trace APIs
 */
export function mockSkipTraceApis() {
  return vi.fn().mockImplementation((url: string) => {
    const urlStr = url.toString();
    
    if (urlStr.includes('/trace') || urlStr.includes('/lookup')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockSkipTraceResponse),
      });
    }
    
    if (urlStr.includes('/validate/phone')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPhoneValidationResponse),
      });
    }
    
    if (urlStr.includes('/validate/email')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockEmailValidationResponse),
      });
    }
    
    if (urlStr.includes('/credits')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCreditsResponse),
      });
    }
    
    return Promise.resolve({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: 'Not found' }),
    });
  });
}

