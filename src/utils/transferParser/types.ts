
export interface ParsedTransferData {
  playerName: string;
  fromClub: string;
  toClub: string;
  fee: string;
  confidence: number;
  verificationStatus: 'confirmed' | 'unverified' | 'rumored';
}
