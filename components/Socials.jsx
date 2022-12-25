const Socials = ({ dark }) => {
    return (
        <>
            <div className='mr-4'>
                <a href='https://github.com/mbahgatTech'>
                    <picture>
                        <source srcSet={dark ? '/images/github-dark.svg' : '/images/github.svg'} type='image/webp' />
                        <img 
                            src={dark ? '/images/github-dark.svg' : '/images/github.svg'}
                            alt='Github Logo'
                        />
                    </picture>
                </a>
            </div>

            <div className='ml-4'>
                <a href='https://www.linkedin.com/in/mazen-bahgat/'>
                    <picture>
                        <source srcSet={dark ? '/images/linkedin-dark.svg' : '/images/linkedin.svg'} type='image/webp' />
                        <img 
                            src={dark ? '/images/linkedin-dark.svg' : '/images/linkedin.svg'}
                            alt='Linkedin Logo'
                        />
                    </picture>
                </a>
            </div>
        </>
    );
}

export default Socials;