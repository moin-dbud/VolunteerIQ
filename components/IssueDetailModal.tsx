'use client';

import { useState } from 'react';
import { X, MapPin, User, Send } from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Issue, User as UserType } from '@/lib/types';
import { useToast } from '@/lib/toast-context';

interface Props {
  issue: Issue;
  volunteers: UserType[];
  onClose: () => void;
}

export default function IssueDetailModal({ issue, volunteers, onClose }: Props) {
  const [selectedVolunteer, setSelectedVolunteer] = useState('');
  const [assigning, setAssigning] = useState(false);
  const { addToast } = useToast();

  const handleAssign = async () => {
    if (!selectedVolunteer) return;
    setAssigning(true);
    try {
      await updateDoc(doc(db, 'issues', issue.issueId!), {
        status: 'assigned',
        assignedTo: selectedVolunteer,
        updatedAt: serverTimestamp(),
      });
      addToast('Volunteer assigned successfully.', 'success');
      onClose();
    } catch {
      addToast('Failed to assign volunteer.', 'error');
    } finally {
      setAssigning(false);
    }
  };

  const priority = issue.suggestedPriority || issue.urgency;
  const priorityClass =
    priority === 'urgent' ? 'badge-urgent' :
    priority === 'high' ? 'badge-high' :
    priority === 'medium' ? 'badge-medium' : 'badge-low';

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
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '16px',
          width: '520px',
          maxHeight: '80vh',
          overflowY: 'auto',
          padding: '28px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <span className={priorityClass} style={{ marginBottom: '8px', display: 'inline-block' }}>
              {priority?.toUpperCase()}
            </span>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '8px' }}>
              {issue.title}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Meta Row */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'var(--bg-elevated)', padding: '4px 10px', borderRadius: '6px' }}>
            {issue.suggestedCategory || issue.category}
          </span>
          <span className={`status-badge status-${issue.status}`} style={{ fontSize: '12px' }}>
            <span className="status-dot" />
            {issue.status?.toUpperCase()}
          </span>
        </div>

        {/* Description */}
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
          {issue.description}
        </p>

        {/* AI Priority Reason */}
        {issue.priorityReason && (
          <div
            style={{
              background: 'rgba(147,51,234,0.08)',
              border: '1px solid rgba(147,51,234,0.2)',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              marginBottom: '16px',
            }}
          >
            <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>AI Triage: </span>
            {issue.priorityReason}
          </div>
        )}

        {/* Location */}
        {issue.location && (
          <div
            style={{
              background: 'var(--bg-elevated)',
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
            }}
          >
            <MapPin size={14} color="var(--text-muted)" />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{issue.location}</span>
          </div>
        )}

        {/* Assign Volunteer (if pending) */}
        {issue.status === 'pending' && (
          <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '20px' }}>
            <label className="label-muted" style={{ display: 'block', marginBottom: '8px' }}>
              ASSIGN VOLUNTEER
            </label>
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <select
                className="select-field"
                value={selectedVolunteer}
                onChange={(e) => setSelectedVolunteer(e.target.value)}
              >
                <option value="">Select a volunteer...</option>
                {volunteers
                  .filter((v) => v.availabilityStatus === 'available' || !v.availabilityStatus)
                  .map((v) => (
                    <option key={v.uid} value={v.uid}>
                      {v.name} — {v.skills?.slice(0, 2).join(', ') || 'No skills listed'}
                    </option>
                  ))}
              </select>
            </div>
            <button
              className="btn-gradient"
              onClick={handleAssign}
              disabled={assigning || !selectedVolunteer}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: !selectedVolunteer ? 0.5 : 1 }}
            >
              <Send size={14} />
              {assigning ? 'Assigning...' : 'Assign Volunteer'}
            </button>
          </div>
        )}

        {/* Already assigned */}
        {issue.assignedTo && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-assigned)', fontSize: '13px', marginTop: '8px' }}>
            <User size={14} />
            Volunteer already assigned
          </div>
        )}
      </div>
    </div>
  );
}
