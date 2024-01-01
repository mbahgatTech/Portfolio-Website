const Contact = ({ setModal }) => {
    return (
        <div className='flex items-center justify-start bg-slate-600 py-40 w-screen'> 
            <div className='mx-auto w-[95%] max-w-lg'>
                <h1 className='text-4xl font-medium'>Get in Touch</h1>

                <form className='mt-10' onSubmit={event => {
                    event.preventDefault();
                    
                    // set modal to be visible and add form data to it
                    let name = event.target.name.value;
                    let email = event.target.email.value;
                    let message = event.target.message.value;
                    setModal({data: {name, email, message}, visible: true});
                }}>
                    <div className='grid gap-6 sm:grid-cols-2'>
                        <div className='relative z-0'>
                            <input type='text' required name='name' placeholder='' className='peer block mt-1 w-full appearance-none border-0 border-b border-gray-500 bg-transparent py-3 px-0 text-sm text-white rounded-sm focus:border-purple-500 focus:outline-none focus:ring-0 hover:ring-2 hover:ring-purple-500 group transform transition-all duration-500 ease-in-out' />
                            <label className='absolute top-2 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-white duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-purple-500 peer-focus:dark:text-purple-400'>Name</label>
                        </div>
                        <div className='relative z-0'>
                            <input type='text' required name='email' placeholder='' className='peer block mt-1 w-full appearance-none border-0 border-b border-gray-500 bg-transparent py-3 px-0 text-sm text-white rounded-sm focus:border-purple-500 focus:outline-none focus:ring-0 hover:ring-2 hover:ring-purple-500 transition-all duration-500' />
                            <label className='absolute top-2 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-white duration-300 peer-placeholder-shown:translate-y-0  peer-placeholder-shown:mb-1 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-purple-500 peer-focus:dark:text-purple-400'>Email</label>
                        </div>
                        <div className='relative z-0 col-span-2'>
                            <textarea name='message' placeholder='' required rows='5' className='peer block mt-1 w-full appearance-none border-0 border-b border-gray-500 bg-transparent py-3 px-0 text-sm text-white rounded-sm focus:border-purple-500 focus:outline-none focus:ring-0 hover:ring-2 hover:ring-purple-500 transition-all duration-500'></textarea>
                            <label className='absolute top-2 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-white duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-purple-500 peer-focus:dark:text-purple-400'>Message</label>
                        </div>
                    </div>
                    <button type='submit' className='mt-5 rounded-md bg-gray-900 hover:bg-gray-800 px-10 py-2 text-white duration-700'>Send Message</button>
                </form>
            </div>
        </div>
    );
};

export default Contact;