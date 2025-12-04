/**
 * Shovels API Mocks
 * Mock responses for Shovels permit and contractor APIs
 */

import { vi } from 'vitest';

export const mockPermitResponse = {
  permits: [
    {
      id: 'permit-001',
      permitNumber: 'BP-2024-001234',
      type: 'building',
      status: 'issued',
      description: 'Kitchen renovation',
      issuedDate: '2024-01-15',
      completedDate: null,
      estimatedValue: 45000,
      contractor: {
        name: 'ABC Contractors',
        license: 'CGC123456',
      },
      address: '123 Main St, Miami, FL 33101',
    },
    {
      id: 'permit-002',
      permitNumber: 'EP-2024-005678',
      type: 'electrical',
      status: 'completed',
      description: 'Panel upgrade 200A',
      issuedDate: '2023-11-10',
      completedDate: '2023-12-05',
      estimatedValue: 8500,
      contractor: {
        name: 'Spark Electric',
        license: 'EC13001234',
      },
      address: '123 Main St, Miami, FL 33101',
    },
  ],
  total: 2,
  page: 1,
  pageSize: 25,
};

export const mockContractorResponse = {
  contractors: [
    {
      id: 'contractor-001',
      name: 'ABC Contractors',
      license: 'CGC123456',
      licenseType: 'General Contractor',
      status: 'active',
      rating: 4.5,
      reviewCount: 127,
      yearsInBusiness: 15,
      specialties: ['kitchen', 'bathroom', 'additions'],
      phone: '+1-305-555-1234',
      email: 'info@abccontractors.com',
      address: '100 Business Ave, Miami, FL 33101',
      totalPermits: 342,
      averageProjectValue: 85000,
    },
    {
      id: 'contractor-002',
      name: 'Spark Electric',
      license: 'EC13001234',
      licenseType: 'Electrical Contractor',
      status: 'active',
      rating: 4.8,
      reviewCount: 89,
      yearsInBusiness: 10,
      specialties: ['residential', 'commercial', 'solar'],
      phone: '+1-305-555-5678',
      email: 'info@sparkelectric.com',
      address: '200 Power Blvd, Miami, FL 33102',
      totalPermits: 567,
      averageProjectValue: 12000,
    },
  ],
  total: 2,
  page: 1,
  pageSize: 25,
};

export const mockPermitMetricsResponse = {
  propertyAddress: '123 Main St, Miami, FL 33101',
  totalPermits: 5,
  permitsByType: {
    building: 2,
    electrical: 1,
    plumbing: 1,
    roofing: 1,
  },
  totalValue: 125000,
  lastPermitDate: '2024-01-15',
  averageCompletionDays: 45,
  openPermits: 1,
};

/**
 * Mock fetch for Shovels APIs
 */
export function mockShovelsApis() {
  return vi.fn().mockImplementation((url: string) => {
    const urlStr = url.toString();
    
    if (urlStr.includes('api.shovels.ai/permits')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPermitResponse),
      });
    }
    
    if (urlStr.includes('api.shovels.ai/contractors')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockContractorResponse),
      });
    }
    
    if (urlStr.includes('api.shovels.ai/metrics')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPermitMetricsResponse),
      });
    }
    
    return Promise.resolve({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: 'Not found' }),
    });
  });
}

/**
 * Create a custom permit response
 */
export function createPermitResponse(permits: Array<{
  id: string;
  type: string;
  status: string;
  value: number;
}>) {
  return {
    permits: permits.map(p => ({
      id: p.id,
      permitNumber: `BP-2024-${p.id}`,
      type: p.type,
      status: p.status,
      description: `${p.type} permit`,
      issuedDate: '2024-01-01',
      completedDate: p.status === 'completed' ? '2024-02-01' : null,
      estimatedValue: p.value,
      contractor: { name: 'Test Contractor', license: 'TEST123' },
      address: '123 Test St',
    })),
    total: permits.length,
    page: 1,
    pageSize: 25,
  };
}

