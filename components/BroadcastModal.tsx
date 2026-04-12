'use client';

import { useState } from 'react';
import { X, Radio, Send } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';

interface Props {
  onClose: () => void;
}

export default function BroadcastModal({ onClose }: Props) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const { addToast } = useToast();

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'broadcasts'), {
        message: message.trim(),
        sentBy: user?.uid,
        sentAt: serverTimestamp(),
      });
      addToast('Broadcast sent to all volunteers.', 'success');
      onClose();
    } catch (err) {
      addToast('Failed to send broadcast.', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--overlay-dark)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ width: '480px', padding: '28px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(239,68,68,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Radio size={18} color="var(--urgency-high)" />
            </div>
            <div>
              <h3
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                Urgent Broadcast
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Sends to all active volunteers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Message Input */}
        <label className="label-muted" style={{ display: 'block', marginBottom: '8px' }}>
          BROADCAST MESSAGE
        </label>
        <textarea
          className="textarea-field"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe the urgent situation requiring immediate volunteer response..."
          style={{ minHeight: '120px' }}
        />

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
          <button className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleSend}
            disabled={sending || !message.trim()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: !message.trim() ? 0.5 : 1,
            }}
          >
            <Send size={14} />
            {sending ? 'Sending...' : 'Send Broadcast'}
          </button>
        </div>
      </div>
    </div>
  );
}
