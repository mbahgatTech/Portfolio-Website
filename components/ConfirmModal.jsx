import { MessageSubmit } from '../utils/Message';
import { useState } from 'react';
import { MODAL } from '../utils/json/constants';
import CloseIcon from './icons/close.svg';
import XMarkIcon from './icons/x-mark.svg';
import AlertCircleIcon from './icons/alert-circle.svg';

/**
 * Confirmation dialog plus success/failure toasts. Confirming calls MessageSubmit
 * (utils/Message.js), which POSTs the message to /api/message, then shows a toast
 * with the result. Closing or cancelling just hides the dialog.
 */
const Modal = ({ modal, setModal }) => {
    const [status, setStatus] = useState('');

    return (
        <>
            {status == 'success' &&
            <div className='glass-strong fixed left-1/2 top-4 z-[60] mb-3 max-w-xs -translate-x-1/2 rounded-xl border border-emerald-400/30 text-sm text-white shadow-glow transition-all duration-300 ease-in-out'>
                <div className='flex items-center gap-3 p-4'>
                    <span className='h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_12px_theme(colors.emerald.400)]' />
                    {MODAL.MESSAGE_SUCCESS}
                    <button type='button' onClick={() => setStatus('')} className='ml-auto inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-md text-white/50 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/60'>
                        <CloseIcon className='h-3.5 w-3.5' />
                    </button>
                </div>
            </div>}

            {status == 'failure' &&
            <div className='glass-strong fixed left-1/2 top-4 z-[60] mb-3 max-w-xs -translate-x-1/2 rounded-xl border border-rose-400/30 text-sm text-white shadow-glow transition-all duration-300'>
                <div className='flex items-center gap-3 p-4'>
                    <span className='h-2.5 w-2.5 shrink-0 rounded-full bg-rose-400 shadow-[0_0_12px_theme(colors.rose.400)]' />
                    {MODAL.MESSAGE_FAILURE}
                    <button type='button' onClick={() => setStatus('')} className='ml-auto inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-md text-white/50 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-rose-400/60'>
                        <CloseIcon className='h-3.5 w-3.5' />
                    </button>
                </div>
            </div>}

            <div className={modal?.visible
                ? 'fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-ink-950/70 p-4 backdrop-blur-sm'
                : 'hidden'}>
                <div className='animate-fade-in-up relative w-full max-w-md'>
                    <div className='glass-strong relative rounded-2xl p-6 shadow-glow-lg'>
                        <button onClick={() => setModal(false)} type='button' className='absolute right-3 top-3 inline-flex items-center rounded-lg p-1.5 text-blue-100/60 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-400/50'>
                            <XMarkIcon className='h-5 w-5' />
                            <span className='sr-only'>{MODAL.CLOSE_MODAL}</span>
                        </button>
                        <div className='p-2 text-center'>
                            <div className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/15 text-brand-300'>
                                <AlertCircleIcon className='h-7 w-7' />
                            </div>
                            <h3 className='mb-6 text-lg font-normal text-blue-100/80'>{MODAL.CONFIRMATION_PROMPT}</h3>
                            <button onClick={async () => {
                                setModal(prev => { return { ...prev, visible: false }; });
                                let response = await MessageSubmit(modal.data);

                                if (response) setStatus('success');
                                else setStatus('failure');

                                setTimeout(() => setStatus(''), 3000);
                            }} type='button' className='mr-2 inline-flex items-center rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-glow transition-shadow duration-300 hover:shadow-glow-lg focus:outline-none focus:ring-2 focus:ring-brand-300'>
                                {MODAL.CONFIRM_OPERATION}
                            </button>
                            <button onClick={() => setModal(false)} type='button' className='rounded-full border border-white/15 bg-white/[0.03] px-6 py-2.5 text-sm font-medium text-blue-100/70 transition-colors hover:bg-white/10 hover:text-white focus:z-10 focus:outline-none focus:ring-2 focus:ring-white/20'>{MODAL.CANCEL_OPERATION}</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Modal;