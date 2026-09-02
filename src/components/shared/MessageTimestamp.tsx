import React from 'react';
import { Clock } from 'lucide-react';

interface MessageTimestampProps {
  sentAt: string;
  isMine: boolean;
}

export const MessageTimestamp: React.FC<MessageTimestampProps> = ({ sentAt, isMine }) => {
  return (
    <span
      className={`mt-1.5 flex items-center justify-end gap-1 text-[11px] font-medium tabular-nums leading-none tracking-wide ${
        isMine ? 'text-white/70' : 'text-muted'
      }`}
    >
      <Clock className={`w-3 h-3 shrink-0 ${isMine ? 'opacity-70' : 'opacity-60'}`} />
      <time dateTime={sentAt}>{sentAt}</time>
    </span>
  );
};
