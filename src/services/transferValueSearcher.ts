import { Transfer } from '@/types/transfer';

interface TransferValueResponse {
  success: boolean;
  fee?: string;
  error?: string;
}

export class TransferValueSearcher {
  private static API_KEY_STORAGE_KEY = 'perplexity_api_key';

  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
    console.log('Perplexity API key saved successfully');
  }

  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }

  static async searchTransferValue(
    playerName: string, 
    fromClub: string, 
    toClub: string, 
    date: string
  ): Promise<TransferValueResponse> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'API key not found' };
    }

    try {
      const year = new Date(date).getFullYear();
      const query = `What was the exact transfer fee for ${playerName} from ${fromClub} to ${toClub} in ${year}? Include any add-ons or bonuses. If it was a free transfer, loan, or release, specify that.`;

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are a football transfer expert. Provide only the exact transfer fee in British pounds (£) format. If multiple sources give different amounts, use the most reliable source (BBC, Sky Sports, ESPN, official club websites). For free transfers, loans, or releases, state that clearly with the reason. Be precise and concise.'
            },
            {
              role: 'user',
              content: query
            }
          ],
          temperature: 0.2,
          top_p: 0.9,
          max_tokens: 200,
          return_images: false,
          return_related_questions: false,
          search_recency_filter: 'year',
          frequency_penalty: 1,
          presence_penalty: 0
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const fee = data.choices?.[0]?.message?.content?.trim();

      if (fee) {
        console.log(`Found transfer value for ${playerName}: ${fee}`);
        return { success: true, fee };
      } else {
        return { success: false, error: 'No transfer value found' };
      }
    } catch (error) {
      console.error(`Error searching transfer value for ${playerName}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to search transfer value' 
      };
    }
  }

  static async batchUpdateTransferValues(transfers: Transfer[]): Promise<Transfer[]> {
    const updatedTransfers: Transfer[] = [];
    
    for (const transfer of transfers) {
      // Skip if already has a proper monetary value
      if (transfer.fee.includes('£') && !transfer.fee.includes('Released') && !transfer.fee.includes('Loan') && !transfer.fee.includes('End of loan')) {
        updatedTransfers.push(transfer);
        continue;
      }

      console.log(`Searching value for ${transfer.playerName}...`);
      
      const result = await this.searchTransferValue(
        transfer.playerName,
        transfer.fromClub,
        transfer.toClub,
        transfer.date
      );

      if (result.success && result.fee) {
        updatedTransfers.push({
          ...transfer,
          fee: result.fee
        });
      } else {
        updatedTransfers.push(transfer);
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return updatedTransfers;
  }
}