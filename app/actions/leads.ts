'use server'

import { whopsdk } from '@/lib/whop-sdk';
import { Whop } from '@whop/sdk';

export type Lead = Whop.LeadCreateResponse;
export type CreateLeadParams = Whop.LeadCreateParams;

// export async function fetchAllLeads(companyId: string): Promise<Lead[]> {
//   const leads: Lead[] = [];
//   try {
//     for await (const lead of whopsdk.leads.list({ company_id: companyId, first: 100 })) {
//         leads.push(lead as Lead);
//     }
//   } catch (error) {
//     console.error('Error fetching leads:', error);
//     throw error;
//   }
//   return leads;
// }

export async function createNewLead(params: CreateLeadParams): Promise<Lead> {
  try {
     const lead = await whopsdk.leads.create(params);
     return lead;
  } catch (error) {
    console.error('Error creating lead:', error);
    throw error;
  }
}
