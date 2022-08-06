const navigation = [
  { name: 'GitHub', href: 'https://github.com/mbahgatTech' },
  { name: 'Linkedin', href: 'https://www.linkedin.com/in/mazen-bahgat/' },
]

const Profile = () => {
  return (
    <div className="relative bg-slate-800 overflow-hidden sm:min-h-[600px] lg:min-h-[400px] h-screen">
        <div className="max-w-7xl mx-auto">
            <div className="relative lg:h-screen z-10 pb-8 bg-slate-800 sm:pb-16 sm: md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
                <svg
                    className="hidden lg:block absolute right-0 inset-y-0 sm:min-h-[600px] lg:min-h-[400px] h-full w-48 text-slate-800 transform translate-x-1/2"
                    fill="currentColor"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                >
                    <polygon points="50,0 100,0 50,100 0,100" />
                </svg>

                <nav className="relative flex items-center justify-between sm:h-10 lg:justify-start" aria-label="Global">
                    <div className="block ml-10 pr-4 space-x-8">
                        {navigation.map(item => (
                            <a key={item.name} href={item.href} className="font-medium text-blue-100 hover:text-blue-100">
                                {item.name}
                            </a>
                        ))}
                    </div>
                </nav>

                <div className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                    <div className="sm:text-center lg:text-left">
                        <h1 className="text-4xl tracking-tight font-extrabold text-blue-100 sm:text-5xl md:text-6xl">
                            <span className="block xl:inline">Mazen Bahgat</span>{' '}<br className="hidden xl:visible"/><br className="hidden lg:visible xl:visible 2xl:visible" />
                        </h1>
                        <h1 className="text-4xl tracking-tight font-extrabold text-blue-100 sm:text-5xl md:text-6xl">
                            <span className="block text-purple-600 xl:inline">Full Stack Developer</span>
                        </h1>
                        <p className="mt-3 text-base text-blue-100 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                            I am a software engineer based in Ontario, Canada. I enjoy building web, mobile and desktop applications.
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <div className="h-full lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
            <img
                className="object-cover object-top w-full bottom-0 h-full lg:w-full"
                src="/images/profile.jpg"
                alt="Photo of Mazen"
            />
        </div>
    </div>
  );
}

export default Profile;