import { MessageSubmit } from '../utils/Message';

const Contact = ({ setModal }) => {
    return (
        <div className='flex items-center justify-start bg-slate-600 py-40 w-screen'> 
            <div className='mx-auto w-[95%] max-w-lg'>
                <h1 className='text-4xl font-medium'>Get in Touch</h1>

                <form className='mt-10' onSubmit={event => {
                    console.log('fdsfsd');
                    event.preventDefault();
                    setModal(true);
                }}>
                    <div className='grid gap-6 sm:grid-cols-2'>
                        <div className='relative z-0'>
                            <input type='text' name='name' className='peer block w-full appearance-none border-0 border-b border-gray-500 bg-transparent py-2.5 px-0 text-sm text-white focus:border-blue-600 focus:outline-none focus:ring-0' />
                            <label className='absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-white duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-blue-600 peer-focus:dark:text-blue-500'>Name</label>
                        </div>
                        <div className='relative z-0'>
                            <input type='text' name='email' className='peer block w-full appearance-none border-0 border-b border-gray-500 bg-transparent py-2.5 px-0 text-sm text-white focus:border-blue-600 focus:outline-none focus:ring-0' />
                            <label className='absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-white duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-blue-600 peer-focus:dark:text-blue-500'>Email</label>
                        </div>
                        <div className='relative z-0 col-span-2'>
                            <textarea name='message' rows='5' className='peer block w-full appearance-none border-0 border-b border-gray-500 bg-transparent py-2.5 px-0 text-sm text-white focus:border-blue-600 focus:outline-none focus:ring-0'></textarea>
                            <label className='absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-white duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-blue-600 peer-focus:dark:text-blue-500'>Message</label>
                        </div>
                    </div>
                    <button type='submit' className='mt-5 rounded-md bg-gray-900 hover:bg-gray-800 px-10 py-2 text-white right-0'>Send Message</button>
                </form>
            </div>
        </div>
    );
};

export default Contact;