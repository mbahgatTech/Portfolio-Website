import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageSubmit } from '../../utils/Message';
import { MODAL } from '../../utils/json/constants';
import XMarkIcon from '../icons/x-mark.svg';
import CloseIcon from '../icons/close.svg';
import styles from './Board.module.css';

// The contact flow, on the legal pad: the form collects a message, a
// confirmation dialog asks before sending, MessageSubmit (utils/Message.js) POSTs
// it to /api/message, and a pinned slip reports the result.

const STATUS_TIMEOUT_MS = 5000;

/** The draft awaiting confirmation and the send status ('idle' | 'sending' | 'success' | 'failure'). */
export function useMessageFlow() {
  const [draft, setDraft] = useState(null);
  const [status, setStatus] = useState('idle');
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const confirm = useCallback(async () => {
    if (!draft) return;
    const data = draft;
    setDraft(null);
    // A result still showing from a previous send mustn't time out over this one.
    clearTimeout(timer.current);
    setStatus('sending');
    const sent = await MessageSubmit(data);
    setStatus(sent ? 'success' : 'failure');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus('idle'), STATUS_TIMEOUT_MS);
  }, [draft]);

  return {
    draft,
    status,
    confirm,
    request: setDraft,
    cancel: useCallback(() => setDraft(null), []),
    dismiss: useCallback(() => {
      clearTimeout(timer.current);
      setStatus('idle');
    }, []),
  };
}

/**
 * The form. Each label follows its field, so `input:placeholder-shown + label`
 * can rest it on an empty line and lift it clear once there's writing on it.
 */
export function ContactForm({ flow }) {
  const formRef = useRef(null);
  const sending = flow.status === 'sending';

  useEffect(() => {
    if (flow.status === 'success') formRef.current?.reset();
  }, [flow.status]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    flow.request({
      name: String(data.get('name') || '').trim(),
      email: String(data.get('email') || '').trim(),
      message: String(data.get('message') || '').trim(),
    });
  };

  return (
    <form ref={formRef} className={styles.form} onSubmit={handleSubmit} aria-busy={sending || undefined}>
      <div className={styles.fields}>
        <div className={styles.field}>
          <input id="contact-name" name="name" type="text" required autoComplete="name" placeholder=" " className={styles.input} />
          <label htmlFor="contact-name" className={styles.label}>Name</label>
        </div>
        <div className={styles.field}>
          {/* type=email + pattern trigger native validation, so the dialog only opens for a valid email. */}
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder=" "
            pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
            title="Enter a valid email address, e.g. name@example.com"
            className={styles.input}
          />
          <label htmlFor="contact-email" className={styles.label}>Email</label>
        </div>
        <div className={`${styles.field} ${styles.fieldWide}`}>
          <textarea id="contact-message" name="message" required rows={5} placeholder=" " className={`${styles.input} ${styles.textarea}`} />
          <label htmlFor="contact-message" className={styles.label}>Message</label>
        </div>
      </div>
      <div className={styles.actions}>
        <button type="submit" className={styles.submit} disabled={sending}>
          {sending ? 'Sending…' : 'Send Message'}
        </button>
      </div>
    </form>
  );
}

/** Confirmation before sending, as a native <dialog> (focus is trapped; Escape and the backdrop cancel). */
export function ConfirmDialog({ flow }) {
  const ref = useRef(null);
  const open = flow.draft !== null;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || typeof dialog.showModal !== 'function') return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby="confirm-message-title"
      onCancel={(event) => {
        event.preventDefault();
        flow.cancel();
      }}
      onClick={(event) => {
        if (event.target === ref.current) flow.cancel();
      }}
    >
      <div className={styles.panel}>
        <button type="button" onClick={flow.cancel} className={styles.close}>
          <XMarkIcon aria-hidden="true" width="20" height="20" />
          <span className="sr-only">{MODAL.CLOSE_MODAL}</span>
        </button>
        <span className={styles.stamp} aria-hidden="true">Confirm</span>
        <h2 id="confirm-message-title" className={styles.dialogTitle}>{MODAL.CONFIRMATION_PROMPT}</h2>
        <div className={styles.dialogActions}>
          <button type="button" onClick={flow.confirm} className={styles.submit}>
            {MODAL.CONFIRM_OPERATION}
          </button>
          <button type="button" onClick={flow.cancel} className={styles.cancel}>
            {MODAL.CANCEL_OPERATION}
          </button>
        </div>
      </div>
    </dialog>
  );
}

/** Announces the send result; always mounted so screen readers catch the change. */
export function MessageStatus({ flow }) {
  const succeeded = flow.status === 'success';
  return (
    <div role="status" aria-live="polite" className={styles.statusRegion}>
      {(succeeded || flow.status === 'failure') && (
        <div className={`${styles.toast} ${succeeded ? styles.success : styles.failure}`}>
          <span className={styles.statusMessage}>{succeeded ? MODAL.MESSAGE_SUCCESS : MODAL.MESSAGE_FAILURE}</span>
          <button type="button" onClick={flow.dismiss} className={styles.dismiss}>
            <CloseIcon aria-hidden="true" width="14" height="14" />
            <span className="sr-only">Dismiss</span>
          </button>
        </div>
      )}
    </div>
  );
}
