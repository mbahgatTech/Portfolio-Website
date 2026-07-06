import { MessageSubmit } from '../utils/Message';
import { useState } from 'react';
import { MODAL } from '../utils/json/constants';

// Shared close (X) glyph for the toast dismiss buttons.
const CloseGlyph = () => (
    <svg className='h-3.5 w-3.5' width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path d='M0.92524 0.687069C1.126 0.486219 1.39823 0.373377 1.68209 0.373377C1.96597 0.373377 2.2382 0.486219 2.43894 0.687069L8.10514 6.35813L13.7714 0.687069C13.8701 0.584748 13.9882 0.503105 14.1188 0.446962C14.2494 0.39082 14.3899 0.361248 14.5321 0.360026C14.6742 0.358783 14.8151 0.38589 14.9468 0.439762C15.0782 0.493633 15.1977 0.573197 15.2983 0.673783C15.3987 0.774389 15.4784 0.894026 15.5321 1.02568C15.5859 1.15736 15.6131 1.29845 15.6118 1.44071C15.6105 1.58297 15.5809 1.72357 15.5248 1.85428C15.4688 1.98499 15.3872 2.10324 15.2851 2.20206L9.61883 7.87312L15.2851 13.5441C15.4801 13.7462 15.588 14.0168 15.5854 14.2977C15.5831 14.5787 15.4705 14.8474 15.272 15.046C15.0735 15.2449 14.805 15.3574 14.5244 15.3599C14.2437 15.3623 13.9733 15.2543 13.7714 15.0591L8.10514 9.38812L2.43894 15.0591C2.23704 15.2543 1.96663 15.3623 1.68594 15.3599C1.40526 15.3574 1.13677 15.2449 0.938279 15.046C0.739807 14.8474 0.627232 14.5787 0.624791 14.2977C0.62235 14.0168 0.730236 13.7462 0.92524 13.5441L6.59144 7.87312L0.92524 2.20206C0.724562 2.00115 0.611816 1.72867 0.611816 1.44457C0.611816 1.16047 0.724562 0.887983 0.92524 0.687069Z' fill='currentColor' />
    </svg>
);

/**
 * Confirmation modal + status toasts (T-007). Presentation is reworked to glass,
 * but the email flow is untouched (D6): confirming calls MessageSubmit(modal.data)
 * (→ POST /api/message via frozen Message.js) and surfaces the MODAL.* result
 * strings; close/cancel reset the modal with setModal(false).
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
                        <CloseGlyph />
                    </button>
                </div>
            </div>}

            {status == 'failure' &&
            <div className='glass-strong fixed left-1/2 top-4 z-[60] mb-3 max-w-xs -translate-x-1/2 rounded-xl border border-rose-400/30 text-sm text-white shadow-glow transition-all duration-300'>
                <div className='flex items-center gap-3 p-4'>
                    <span className='h-2.5 w-2.5 shrink-0 rounded-full bg-rose-400 shadow-[0_0_12px_theme(colors.rose.400)]' />
                    {MODAL.MESSAGE_FAILURE}
                    <button type='button' onClick={() => setStatus('')} className='ml-auto inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-md text-white/50 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-rose-400/60'>
                        <CloseGlyph />
                    </button>
                </div>
            </div>}

            <div className={modal?.visible
                ? 'fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-ink-950/70 p-4 backdrop-blur-sm'
                : 'hidden'}>
                <div className='animate-fade-in-up relative w-full max-w-md'>
                    <div className='glass-strong relative rounded-2xl p-6 shadow-glow-lg'>
                        <button onClick={() => setModal(false)} type='button' className='absolute right-3 top-3 inline-flex items-center rounded-lg p-1.5 text-blue-100/60 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-400/50'>
                            <svg aria-hidden='true' className='h-5 w-5' fill='currentColor' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'><path d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'></path></svg>
                            <span className='sr-only'>{MODAL.CLOSE_MODAL}</span>
                        </button>
                        <div className='p-2 text-center'>
                            <div className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/15 text-brand-300'>
                                <svg aria-hidden='true' className='h-7 w-7' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'></path></svg>
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