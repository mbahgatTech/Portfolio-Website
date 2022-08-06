const Experience = () => {
    return (
        <div className='w-5/6 mx-auto'>
            <h1 className='text-4xl tracking-tight font-bold text-blue-100 w-full text-center mx-auto mt-16'>My Work Experience</h1>
            <div className='max-w-full my-16 mx-auto bg-white rounded-xl shadow-md overflow-hidden'>
                <div className='md:flex'>
                    <div className='md:shrink-0'>
                        <img className='w-full h-full md:w-48' src='/images/scalesLogo.webp' alt='Scales Logo' />
                    </div>
                    <div className='p-8'>
                        <div className='uppercase tracking-wide text-sm text-purple-600 font-semibold'>Scales Nature Park</div>
                        <p className='block mt-1 text-lg leading-tight font-medium text-black'>Full Stack Application Developer</p>
                        <p className='mt-2 text-slate-500'>Led a small team through the whole development lifecycle of full stack mobile and desktop applications used for wildlife conservation purposes. Acquired hands on experience facing different software development challenges including system design, UI/UX design, new developer oboarding to chosen tech stack and source control.</p>
                    </div>
                </div>

                {/* <h1 className='block mt-1 w-full text-center text-lg leading-tight font-medium text-black'>Tech Stack</h1>
                <div className='mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8'>     
                    {[{
                        
                    }, {
                        
                    }].map(product =>
                    <div className="group relative">
                        <div className="w-full min-h-80 bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75 lg:h-80 lg:aspect-none">
                            <img
                                src='/images/scales'
                                alt='scales'
                                className="w-full h-full object-center object-cover lg:w-full lg:h-full"
                            />
                        </div>
                        <div className="mt-4 flex justify-between">
                            <div>
                                <h3 className="text-sm text-gray-700">
                                    <a href='#'>
                                        <span aria-hidden="true" className="absolute inset-0" />
                                        React Native
                                    </a>
                                </h3>
                            </div>
                            <p className="text-sm font-medium text-gray-900">dsds</p>
                        </div>
                    </div>)}
                </div>

                <div className='w-full flex flex-row items-center justify-center my-2'>
                    <div className='relative ml-[5%]'>
                        <img 
                            src='/images/phone.svg'
                            alt='Phone Device'
                        />
                    
                        <div className='absolute top-[6%] left-[5%] w-full h-full mx-auto'>
                            <img 
                                src='/images/scalesPhoneApp.png'
                                alt='Phone App'
                            />
                        </div>
                    </div>

                    <div className='relative ml-[5%]'>
                        <img 
                            src='/images/desktop.svg'
                            alt='Desktop Device'
                        />
                        
                        <div className='absolute top-[9.5%] left-[19.5%]'>
                            <img 
                                src='/images/scalesDesktopApp.png'
                                alt='Desktop App'
                            />
                        </div>
                    </div>
                </div> */}
            </div>
        </div>
        
    );
}

export default Experience;