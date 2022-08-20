import Link from 'next/link';
import Head from 'next/head';
import Socials from '../components/Socials';
import { getExperienceRoutes, getData} from '../utils/Routes';

const Experience = ({ data }) => {
    return (
        <div className='bg-slate-800 min-h-screen'>
            <Head>
                <title>Mazen Bahgat</title>
                <meta name="Mazen Bahgat's Development Portfolio" content="Software Development Skills and Experiences" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            
            <div className='w-5/6 items-center justify-center h-full'>
                <h1>{data.role}</h1>
                <h1>{data.company}</h1>
                <picture>
                    <source srcSet={data.image} type="image/webp" />
                    <img className='w-full h-full md:w-48' src={data.image} alt={`${data.company} Logo`} />
                </picture>
                <div dangerouslySetInnerHTML={{ __html: data.htmlContent }} />
                <div>
                    <Link href="/">
                        <a className='text-sky-600 hover:text-sky-400'>← Back to home</a>
                    </Link>
                </div>
            </div>
            <footer className='flex px-8 py-8 justify-center border-inherit border-t border-slate-300'>
                <Socials />
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