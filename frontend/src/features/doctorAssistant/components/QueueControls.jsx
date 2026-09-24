import React from "react";
import { useState } from 'react';
import Field from '../../../components/ui/Field';
import Button from '../../../components/ui/Button';
import { usePauseQueue, useResumeQueue, useSetAverageConsultationMinutes } from '../hooks/useQueueActions';

const QUEUE_STATUS_LABELS = { active: 'Active', paused: 'Paused', closed: 'Closed' };
const QUEUE_STATUS_STYLES = {
  active: 'bg-success/10 text-success',
  paused: 'bg-danger/10 text-danger',
  closed: 'bg-surface text-ink-muted',
};

const QueueStatusPill = ({ status }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
      QUEUE_STATUS_STYLES[status] || 'bg-surface text-ink-muted'
    }`}
  >
    {QUEUE_STATUS_LABELS[status] || status}
  </span>
);

/**
 * Everything about WHICH queue is on screen and its overall state — not
 * an individual patient. Doctor/date pick what useQueue and
 * useQueueLiveUpdates fetch/subscribe to; pause/resume and the average
 * consultation time editor act on the queue as a whole (see
 * doctorAssistant.service.js — pauseQueue/resumeQueue/
 * setAverageConsultationMinutes), which is why they live here rather
 * than on any single patient card.
 */
const QueueControls = ({
  doctors,
  doctorId,
  onDoctorChange,
  date,
  onDateChange,
  queueStatus,
  averageConsultationMinutes,
}) => {
  const [avgInput, setAvgInput] = useState('');
  const pauseMutation = usePauseQueue();
  const resumeMutation = useResumeQueue();
  const avgMutation = useSetAverageConsultationMinutes();

  const handlePauseToggle = () => {
    if (queueStatus === 'paused') {
      resumeMutation.mutate({ doctor: doctorId, date });
    } else {
      pauseMutation.mutate({ doctor: doctorId, date });
    }
  };

  const handleAvgSubmit = (e) => {
    e.preventDefault();
    const minutes = Number(avgInput);
    if (!minutes || minutes < 1) return;
    avgMutation.mutate(
      { doctor: doctorId, date, averageConsultationMinutes: minutes },
      { onSuccess: () => setAvgInput('') }
    );
  };

  return (
    <div className="rounded-lg border border-surface-border bg-surface-card p-4 shadow-soft-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <Field className="sm:w-56" label="Doctor" as="select" value={doctorId} onChange={onDoctorChange}>
            <option value="">Select a doctor</option>
            {doctors?.map((doctor) => (
              <option key={doctor._id} value={doctor._id}>
                Dr. {doctor.user?.fullName} — {doctor.specialization}
              </option>
            ))}
          </Field>
          <Field className="sm:w-44" label="Date" type="date" value={date} onChange={onDateChange} />
        </div>

        {doctorId && (
          <div className="flex items-center gap-3">
            <QueueStatusPill status={queueStatus} />
            <Button
              size="sm"
              variant="secondary"
              isLoading={pauseMutation.isPending || resumeMutation.isPending}
              disabled={queueStatus === 'closed'}
              onClick={handlePauseToggle}
            >
              {queueStatus === 'paused' ? 'Resume Queue' : 'Pause Queue'}
            </Button>
          </div>
        )}
      </div>

      {doctorId && (
        <form onSubmit={handleAvgSubmit} className="mt-4 flex flex-wrap items-end gap-3 border-t border-surface-border pt-4">
          <Field
            className="w-64"
            label={`Average consultation time (currently ${averageConsultationMinutes ?? '—'} min)`}
            type="number"
            min="1"
            max="180"
            placeholder="Minutes"
            value={avgInput}
            onChange={(e) => setAvgInput(e.target.value)}
          />
          <Button type="submit" size="sm" variant="secondary" isLoading={avgMutation.isPending}>
            Update
          </Button>
        </form>
      )}
    </div>
  );
};

export default QueueControls;
