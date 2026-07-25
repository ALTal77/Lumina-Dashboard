import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, MessageSquare, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Avatar } from '../../components/shared/Avatar';

export const DoctorMessages: React.FC = () => {
  const { user } = useAuth();
  const { conversations, messages, sendMessage } = useData();
  const { t } = useTranslation();

  const [activeConvId, setActiveConvId] = useState<string>(conversations[0]?.id || 'conv-1');
  const [inputText, setInputText] = useState<string>('');

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];
  const activeMessages = messages.filter((m) => m.conversationId === activeConvId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;
    sendMessage(user.id, 'doctor', activeConv.participantId, inputText.trim());
    setInputText('');
  };

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden h-[calc(100vh-140px)] flex flex-col md:flex-row">
      <div className="w-full md:w-80 border-r rtl:border-l rtl:border-r-0 border-border flex flex-col bg-page">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-bold text-heading">{t('doctorMessages.sidebar.title')}</h2>
          <p className="text-[11px] text-muted">{t('doctorMessages.sidebar.subtitle')}</p>
        </div>

        <div className="overflow-y-auto flex-1 divide-y divide-border">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setActiveConvId(conv.id)}
              className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                activeConvId === conv.id
                  ? 'bg-primary-tint border-l-4 border-l-primary rtl:border-r-4 rtl:border-r-primary rtl:border-l-0'
                  : 'hover:bg-neutral-bg/60'
              }`}
            >
              <Avatar src={conv.participantAvatar} name={conv.participantName} size="md" />
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between mb-0.5">
                  <h4 className="text-xs font-bold text-heading truncate" dir="auto">{conv.participantName}</h4>
                  <span className="text-[10px] text-muted">{conv.lastMessageTime}</span>
                </div>
                <p className="text-[11px] text-muted truncate">{conv.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {activeConv ? (
        <div className="flex-1 flex flex-col bg-surface">
          <div className="p-4 border-b border-border flex items-center justify-between bg-page">
            <div className="flex items-center gap-3">
              <Avatar src={activeConv.participantAvatar} name={activeConv.participantName} size="md" status="online" />
              <div>
                <h3 className="text-xs font-bold text-heading" dir="auto">{activeConv.participantName}</h3>
                <span className="text-[10px] text-success font-semibold uppercase">
                  {t('doctorMessages.chatHeader.badge')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-page/20">
            {activeMessages.map((msg) => {
              const isMine = msg.senderId === user.id;

              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end rtl:justify-start' : 'justify-start rtl:justify-end'}`}>
                  <div
                    className={`max-w-xs md:max-w-md p-3 rounded-2xl text-xs shadow-2xs ${
                      isMine
                        ? 'bg-primary text-white rounded-br-xs rtl:rounded-bl-xs rtl:rounded-br-none'
                        : 'bg-neutral-bg text-heading rounded-bl-xs rtl:rounded-br-xs rtl:rounded-bl-none'
                    }`}
                  >
                    <p className="leading-relaxed" dir="auto">{msg.content}</p>
                    <span
                      className={`text-[9px] mt-1 block text-right rtl:text-left ${
                        isMine ? 'text-primary' : 'text-muted'
                      }`}
                    >
                      {msg.sentAt}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-border flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t('doctorMessages.inputPlaceholder')}
              className="flex-1 px-3 py-2 text-xs bg-page border border-border rounded-xl text-heading focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t('doctorMessages.button.send')}</span>
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-xs text-muted">
          {t('doctorMessages.emptyState')}
        </div>
      )}
    </div>
  );
};
