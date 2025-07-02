import { Transfer } from '@/types/transfer';

interface TransferLog {
  id: string;
  timestamp: Date;
  action: 'added' | 'updated' | 'confirmed';
  playerName: string;
  fromClub: string;
  toClub: string;
  source: string;
}

export class TransferTracker {
  private static STORAGE_KEY = 'transfer_logs';
  private static LAST_CHECK_KEY = 'last_transfer_check';

  static logTransfer(transfer: Transfer, action: 'added' | 'updated' | 'confirmed'): void {
    const logs = this.getLogs();
    const newLog: TransferLog = {
      id: transfer.id,
      timestamp: new Date(),
      action,
      playerName: transfer.playerName,
      fromClub: transfer.fromClub,
      toClub: transfer.toClub,
      source: transfer.source
    };

    logs.unshift(newLog); // Add to beginning
    
    // Keep only last 100 logs
    if (logs.length > 100) {
      logs.splice(100);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
  }

  static getLogs(): TransferLog[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return [];
    
    try {
      return JSON.parse(stored).map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp)
      }));
    } catch {
      return [];
    }
  }

  static checkForNewTransfers(currentTransfers: Transfer[]): {
    newTransfers: Transfer[];
    updatedTransfers: Transfer[];
  } {
    const lastCheck = localStorage.getItem(this.LAST_CHECK_KEY);
    const lastCheckTime = lastCheck ? new Date(lastCheck) : new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const logs = this.getLogs();
    const recentLogs = logs.filter(log => log.timestamp > lastCheckTime);
    
    const newTransfers = currentTransfers.filter(transfer => {
      const hasRecentLog = recentLogs.some(log => 
        log.id === transfer.id && log.action === 'added'
      );
      return hasRecentLog;
    });

    const updatedTransfers = currentTransfers.filter(transfer => {
      const hasRecentUpdate = recentLogs.some(log => 
        log.id === transfer.id && (log.action === 'updated' || log.action === 'confirmed')
      );
      return hasRecentUpdate;
    });

    // Update last check time
    localStorage.setItem(this.LAST_CHECK_KEY, new Date().toISOString());

    return { newTransfers, updatedTransfers };
  }

  static getRecentActivity(hours: number = 24): TransferLog[] {
    const logs = this.getLogs();
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    return logs.filter(log => log.timestamp > cutoff);
  }

  static clearLogs(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.LAST_CHECK_KEY);
  }
}
