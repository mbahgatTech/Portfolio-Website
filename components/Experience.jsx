const experiences = require('../utils/experience.json');

const Experience = () => {
    return (
        <>
            {
                experiences?.length &&
                <div className='w-5/6 mx-auto'>
                    <h1 className='text-4xl tracking-tight font-bold text-blue-100 w-full text-center mx-auto mt-16'>My Work Experience</h1>
                    {experiences.map(experience => 
                        <div key={JSON.stringify(experience)} className='max-w-full my-16 mx-auto bg-white rounded-xl shadow-md overflow-hidden justify-center items-center'>
                            <div className='md:flex'>
                                <div className='md:shrink-0'>
                                    <picture>
                                        <source srcSet={experience.image} type="image/webp" />
                                        <img className='w-full h-full md:w-48' src={experience.image} alt={experience.alt} />
                                    </picture>
                                </div>
                                <div className='p-8'>
                                    <div className='uppercase tracking-wide text-sm text-purple-600 font-semibold'>{experience.company}</div>
                                    <p className='block mt-1 text-lg leading-tight font-medium text-black'>{experience.position}</p>
                                    <p className='mt-2 text-slate-500'>{experience.description}</p>
                                </div>
                            </div>
                            
                            {experience?.techStack?.length && 
                            <div className="w-[95%] mx-auto justify-center items-center">
                                <h1 className='block mt-1 w-full text-center text-2xl leading-tight font-medium text-black'>Tech Stack</h1>
                                <div className='mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8 justify-center'>     
                                    {experience.techStack.map(elem =>
                                        <div key={JSON.stringify(experience)} className="max-w-sm rounded overflow-hidden shadow-lg mb-4 mx-auto w-full">
                                            <a href={elem.link}>
                                                <picture>
                                                    <source srcSet={elem.source} type="image/webp" />
                                                    <img className="w-full h-60" src={elem.source} alt={elem.alt} />
                                                </picture>
                                                <div className="px-6 py-4">
                                                    <div className="font-bold text-slate-500 mt-2 text-center text-xl mb-2">{elem.name}</div>
                                                </div>
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>}
                        </div>
                    )}
                </div>
            }
        </>
        
    );
}

export default Experience;
