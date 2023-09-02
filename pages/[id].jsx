import Link from 'next/link';
import Head from 'next/head';
import Socials from '../components/Socials';
import { getExperienceRoutes, getData} from '../utils/Routes';

const Experience = ({ data }) => {
    return (
        <div className='bg-gray-100 min-h-full pt-6 w-screen content-center items-center justify-center'>
            <Head>
                <title>Mazen Bahgat</title>
                <meta name="Mazen Bahgat's Development Portfolio" content="Software Development Skills and Experiences" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            
            <div className='items-center content-center justify-center h-full w-[95%] sm:w-[80%] md:w-[70%] max-w-md self-center mx-auto bg-gray-100'>
                <div className='w-full h-full md:w-48 mx-auto aspect-square p-3 rounded-full mb-7 top-7'>
                    <picture>
                        <source srcSet={data.image} type="image/png" />
                        <img className='w-full h-full md:w-48 mx-auto' src={data.image} alt={`${data.company} Logo`} />
                    </picture>
                </div>
                <h1 className='text-2xl font-bold text-purple-600 sm:pr-12'>{data.company}</h1>
                <h1 className='text-2xl font-bold text-purple-600 sm:pr-12'>{data.role}</h1>
                <h1 className='text-lg text-gray-500 mb-5 '>{data.dateRange}</h1>
                <div className='text-gray-900 prose' dangerouslySetInnerHTML={{ __html: data.htmlContent }} />
                <div className='my-3'>
                    <Link href="/">
                        <a className='text-sky-600 hover:text-sky-400 font-bold'>← Back to home</a>
                    </Link>
                </div>
            </div>
            <footer className='flex px-8 py-8 justify-center border-inherit border-t border-slate-300'>
                <Socials dark={true} />
            </footer>
        </div>
    );
};

const getStaticPaths = async () => {
    let paths = getExperienceRoutes();
    
    return {
        paths,
        fallback: false
    };
};

const getStaticProps = async ({ params }) => {
    let data = await getData(params.id);

    return { 
        props: {
            data
        }
    };
};

export default Experience;
export { getStaticPaths, getStaticProps };