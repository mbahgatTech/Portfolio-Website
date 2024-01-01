import { PROFILE, NAVIGATION } from '../utils/json/constants';

const Profile = () => {
  return (
    <div className="relative h-screen bg-gray-900 overflow-hidden min-h-[800px] md:min-h-[1200px] lg:min-h-[700px]">
        <div className="max-w-7xl mx-auto">
            <div className="relative lg:h-screen z-10 pb-8 bg-gray-900 sm:pb-16 sm: md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
                <nav className="relative flex items-center justify-between sm:h-16 lg:justify-start" aria-label="Global">
                    <div className="block ml-10 pr-4 space-x-8">
                        {NAVIGATION.map(item => (
                            <a key={item.name} href={item.href} className="relative pb-1 font-medium text-blue-100 hover:text-purple-500 group transform transition-all duration-700 hover:scale-110">
                                {item.name}
                                <span className="absolute h-1 left-0 bottom-0 w-full bg-gradient-to-r from-purple-400 via-purple-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
                            </a>
                        ))}
                    </div>
                </nav>

                <div className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28 flex flex-col">
                    <div className="sm:text-center lg:text-left">
                        <h1 className="text-4xl tracking-tight font-extrabold text-blue-100 sm:text-5xl md:text-6xl">
                            <span className="block xl:inline">{PROFILE.MAZEN_BAHGAT}</span>{' '}<br className="hidden xl:visible"/><br className="hidden lg:visible xl:visible 2xl:visible" />
                        </h1>
                        <h1 className="text-4xl tracking-tight font-extrabold text-blue-100 sm:text-5xl md:text-6xl">
                            <span className="block text-purple-600 xl:inline">{PROFILE.JOB_TITLE}</span>
                        </h1>
                        {PROFILE.BRIEF.map(sentence => 
                            <p className="mt-3 text-base text-blue-100 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                                {sentence}
                            </p>
                        )}
                    </div>
                    <div className="mt-8 sm:mt-10 lg:mt-16 xl:mt-20 w-full flex">
                        <a  href="/resume.pdf"
                            className="inline-block py-3 px-8 font-bold mx-auto text-center w-full md:w-3/5 lg:mx-0 lg:w-2/4 leading-none rounded-full text-blue-100 hover:scale-105 bg-purple-700 hover:bg-purple-600 active:bg-purple-800 active:scale-100 self-end transition ease-in-out duration-700"
                            download
                        >
                            {PROFILE.RESUME_BUTTON}
                        </a>
                    </div>
                </div>
            </div>
        </div>
        <div className="h-full lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
            <svg
                className="hidden lg:block absolute left-0 inset-y-0 h-full w-48 text-gray-900 transform min-h-[600px] md:min-h-[800px] lg:min-h-[400px]"
                fill="currentColor"
                viewBox="0 0 150 150"
                preserveAspectRatio="none"
                aria-hidden="true"
            >
                <polygon points="0,0 150,0 120,150 0,150" />
            </svg>
            <picture>
                <source srcSet='/images/profile.jpg' type="image/webp" />
                <img
                    className="object-cover object-top lg:object-left-top w-full bottom-0 h-full lg:w-full"
                    src="/images/profile.jpg"
                    alt="Photo of Mazen"
                />
            </picture>
        </div>
    </div>
  );
}

export default Profile;