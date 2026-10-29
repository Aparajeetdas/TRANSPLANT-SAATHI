import { useQuery } from '@tanstack/react-query';
import { FINANCIAL_SCHEMES, STATUTORY_DOCUMENTS } from '../lib/mockData';
import { FinancialScheme, StatutoryDocumentRequirement } from '../types';

export interface RegulatoryAgency {
  name: string;
  role: string;
  description: string;
  url: string;
  tollFreeHelpline: string;
  email: string;
  lastAuditedDate: string;
}

export const OFFICIAL_REGULATORY_AGENCIES: RegulatoryAgency[] = [
  {
    name: 'National Organ and Tissue Transplant Organization (NOTTO)',
    role: 'Apex National Regulatory Directorate',
    description: 'Statutory body under the Ministry of Health & Family Welfare (MoHFW) administering the national deceased donor registry, organ allocation rosters, and organ sharing protocols across India.',
    url: 'https://notto.mohfw.gov.in',
    tollFreeHelpline: '1800-11-4770 (24x7 Toll-Free Helpline)',
    email: 'dir-notto@nic.in',
    lastAuditedDate: '2026-03-15'
  },
  {
    name: 'National Health Authority (NHA) — Ayushman Bharat (AB-PMJAY)',
    role: 'Central Health Assurance Directorate',
    description: 'Government health assurance scheme providing up to ₹5,00,000 cashless coverage per eligible family per year for secondary and tertiary care hospitalization including renal, hepatic, and corneal transplant surgeries.',
    url: 'https://pmjay.gov.in',
    tollFreeHelpline: '14555 (National PM-JAY Helpdesk)',
    email: 'support.nha@gov.in',
    lastAuditedDate: '2026-03-01'
  },
  {
    name: 'Rashtriya Arogya Nidhi (RAN) — Ministry of Health & Family Welfare',
    role: 'National Financial Aid Program',
    description: 'Central government financial grant program disbursing up to ₹15,00,000 one-time financial assistance directly to government super-specialty hospitals for life-threatening illnesses requiring major organ replacement in BPL families.',
    url: 'https://mohfw.gov.in',
    tollFreeHelpline: '+91-11-23061438 (Nirman Bhawan Desk)',
    email: 'ran-mohfw@gov.in',
    lastAuditedDate: '2026-02-15'
  },
  {
    name: 'State Organ & Tissue Transplant Organizations (SOTTO / ROTTO)',
    role: 'Regional & State Transplant Registries',
    description: 'State and regional statutory networks (e.g., ROTTO North at PGIMER, SOTTO Maharashtra at KEM, TRANSTAN Tamil Nadu) executing local deceased donor allocations, hospital licensing verifications, and green corridor logistics.',
    url: 'https://transtan.tn.gov.in',
    tollFreeHelpline: '+91-44-25305555 (TRANSTAN)',
    email: 'transtan@tn.gov.in',
    lastAuditedDate: '2026-01-19'
  }
];

export const useOfficialResources = () => {
  return useQuery({
    queryKey: ['official-resources'],
    queryFn: async (): Promise<{
      documents: StatutoryDocumentRequirement[];
      schemes: FinancialScheme[];
      agencies: RegulatoryAgency[];
    }> => {
      // Simulate verified registry data retrieval
      return {
        documents: STATUTORY_DOCUMENTS,
        schemes: FINANCIAL_SCHEMES,
        agencies: OFFICIAL_REGULATORY_AGENCIES
      };
    }
  });
};
