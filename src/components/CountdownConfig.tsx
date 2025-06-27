
import React from 'react';
import { CountdownSettings } from './CountdownSettings';

interface CountdownConfigProps {
  countdownTarget: string;
  setCountdownTarget: (target: string) => void;
}

export const CountdownConfig: React.FC<CountdownConfigProps> = ({
  countdownTarget,
  setCountdownTarget
}) => {
  return (
    <CountdownSettings
      targetDate={countdownTarget}
      onDateChange={setCountdownTarget}
    />
  );
};
