import React from 'react';
import { AnalogCountdown } from './AnalogCountdown';

interface TransferCountdownProps {
  targetDate: string;
}

export const TransferCountdown: React.FC<TransferCountdownProps> = ({ targetDate }) => {
  return <AnalogCountdown targetDate={targetDate} />;
};
