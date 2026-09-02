import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Plus, Search, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Avatar } from '../../components/shared/Avatar';
import { MessageTimestamp } from '../../components/shared/MessageTimestamp';

export const PatientMessages: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { conversations, messages, sendMessage, doctors, createConversation } = useData();

  const [activeConvId, setActiveConvId] = useState<string>(conversations[0]?.id || '');
  const [inputText, setInputText] = useState<string>('');
  const [sendError, setSendError] = useState<string>('');
  const [showNewChat, setShowNewChat] = useState<boolean>(false);
  const [doctorSearch, setDoctorSearch] = useState<string>('');
  const [creating, setCreating] = useState<boolean>(false);

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];
  const activeMessages = messages.filter((m) => m.conversationId === activeConvId);

  const filteredDoctors = doctors.filter((d) => {
    const q = doctorSearch.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.specialty.toLowerCase().includes(q)
    );
  });

  const handleNewConversation = async (doctorId: string) => {
    setCreating(true);
    try {
      const conv = await createConversation(doctorId);
      setActiveConvId(conv.id);
      setShowNewChat(false);
      setDoctorSearch('');
    } catch {
      // conversation may already exist — find it and activate
      const existing = conversations.find((c) => c.participantId === doctorId);
      if (existing) {
        setActiveConvId(existing.id);
        setShowNewChat(false);
        setDoctorSearch('');
      }
    } finally {
      setCreating(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;
    try {
      await sendMessage(activeConv.id, user.id, 'patient', activeConv.participantId, inputText.trim());
      setInputText('');
      setSendError('');
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden h-[calc(100vh-140px)] flex flex-col md:flex-row">
      {/* Left Conversations Sidebar */}
      <div className="w-full md:w-80 border-r border-border flex flex-col bg-page/50">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-heading">{t('patientMessages.sidebar.title')}</h2>
            <p className="text-[11px] text-muted">{t('patientMessages.sidebar.subtitle')}</p>
          </div>
          <button
            onClick={() => setShowNewChat(true)}
            className="p-2 bg-primary hover:bg-primary-hover text-white rounded-xl transition-colors"
            title={t('patientMessages.button.newConversation')}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 divide-y divide-border">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setActiveConvId(conv.id)}
              className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                activeConvId === conv.id
                  ? 'bg-primary-tint border-l-4 border-l-primary rtl:border-r-4 rtl:border-r-primary rtl:border-l-0'
                  : 'hover:bg-neutral-bg'
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

      {/* Right Chat Thread View */}
      {activeConv ? (
        <div className="flex-1 flex flex-col bg-surface">
          {/* Thread Header */}
          <div className="p-4 border-b border-border flex items-center justify-between bg-neutral-bg/30">
            <div className="flex items-center gap-3">
              <Avatar src={activeConv.participantAvatar} name={activeConv.participantName} size="md" status="online" />
              <div>
                <h3 className="text-sm font-bold text-heading" dir="auto">{activeConv.participantName}</h3>
                <span className="text-xs text-primary font-semibold Capitalize">
                  {t('patientMessages.chatHeader.badge')}
                </span>
              </div>
            </div>
          </div>

          {/* Message History */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-neutral-bg/20">
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
                    <MessageTimestamp sentAt={msg.sentAt} isMine={isMine} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Message Input Box */}
          <form onSubmit={handleSend} className="p-3 border-t border-border flex flex-col gap-2">
            {sendError && (
              <div className="text-[11px] text-danger font-bold bg-danger-bg border border-danger-bg rounded-lg px-2 py-1">
                {sendError}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t('patientMessages.inputPlaceholder')}
                className="flex-1 px-3 py-2 text-xs bg-neutral-bg border border-border rounded-xl text-heading focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t('patientMessages.button.send')}</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-xs text-muted">
          {t('patientMessages.emptyState')}
        </div>
      )}

      {/* New Conversation Modal */}
      {showNewChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowNewChat(false)}>
          <div
            className="bg-surface rounded-2xl border border-border shadow-lg w-full max-w-md mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-heading">{t('patientMessages.newConversation.title')}</h3>
              <button onClick={() => setShowNewChat(false)} className="p-1 hover:bg-neutral-bg rounded-lg transition-colors">
                <X className="w-4 h-4 text-muted" />
              </button>
            </div>

            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                <input
                  type="text"
                  value={doctorSearch}
                  onChange={(e) => setDoctorSearch(e.target.value)}
                  placeholder={t('patientMessages.newConversation.searchPlaceholder')}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-bg border border-border rounded-xl text-heading focus:outline-none focus:border-primary"
                  autoFocus
                />
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto divide-y divide-border">
              {filteredDoctors.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted">{t('patientMessages.newConversation.noResults')}</div>
              ) : (
                filteredDoctors.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => handleNewConversation(doc.id)}
                    disabled={creating}
                    className="w-full p-3 flex items-center gap-3 hover:bg-neutral-bg transition-colors text-left disabled:opacity-50"
                  >
                    <Avatar src={doc.profilePicture} name={doc.name} size="md" />
                    <div className="flex-1 overflow-hidden">
                      <h4 className="text-xs font-bold text-heading truncate" dir="auto">{doc.name}</h4>
                      <p className="text-[11px] text-muted truncate">{doc.specialty}</p>
                    </div>
                    <span className="text-[10px] text-primary font-bold whitespace-nowrap">{t('patientMessages.newConversation.startChat')}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
