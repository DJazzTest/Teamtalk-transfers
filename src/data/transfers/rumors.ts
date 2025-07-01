
import { Transfer } from '@/types/transfer';

// Official rumors from trusted sources only (populated by scraping system)
// This will be updated by the TransferIntegrationService when scraping official sources
export const latestRumors: Transfer[] = [];

// Function to update rumors from official sources
export const updateRumorsFromOfficialSources = (newRumors: Transfer[]) => {
  // Clear existing rumors and add new ones from official sources
  latestRumors.length = 0;
  latestRumors.push(...newRumors.filter(rumor => rumor.status === 'rumored'));
  console.log(`Updated ${latestRumors.length} official rumors from trusted sources`);
};

// Function to get current official rumors
export const getOfficialRumors = (): Transfer[] => {
  return [...latestRumors];
};
