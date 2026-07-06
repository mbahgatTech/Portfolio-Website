import Link from 'next/link';
import Head from 'next/head';
import { motion } from 'framer-motion';
import Socials from '../components/Socials';
import { fadeUp, staggerContainer } from '../components/ui/motion';
import { getExperienceRoutes, getData} from '../utils/Routes';

/**
 * Experience detail page: renders one experience's company, role, date range,
 * logo, and markdown body. Page data comes from getStaticProps (see utils/Routes.js).
 */
const Experience = ({ data }) => {
    return (
        <div className='relative min-h-screen w-full overflow-hidden bg-ink-950 pt-16'>
            <Head>
                <title>Mazen Bahgat</title>
                <meta name="Mazen Bahgat's Development Portfolio" content="Software Development Skills and Experiences" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className='pointer-events-none absolute inset-0 bg-aurora opacity-70' aria-hidden='true' />
            <div className='pointer-events-none absolute inset-0 bg-grid [background-size:44px_44px] opacity-[0.4]' aria-hidden='true' />

            <motion.article
                variants={staggerContainer}
                initial='hidden'
                animate='show'
                className='relative mx-auto w-[92%] max-w-3xl'
            >
                <motion.div variants={fadeUp} className='mx-auto mb-8 flex justify-center'>
                    <div className='glass-strong flex h-32 w-32 items-center justify-center rounded-3xl p-5'>
                        <picture>
                            <img className='max-h-full max-w-full object-contain' src={data.image} alt={`${data.company} Logo`} />
                        </picture>
                    </div>
                </motion.div>

                <motion.header variants={fadeUp} className='text-center'>
                    <h1 className='font-display text-3xl font-bold tracking-tight text-gradient sm:text-4xl'>{data.company}</h1>
                    <h2 className='mt-2 font-display text-xl font-semibold text-white sm:text-2xl'>{data.role}</h2>
                    <p className='mt-2 text-sm uppercase tracking-widest text-blue-100/50'>{data.dateRange}</p>
                </motion.header>

                <motion.div variants={fadeUp} className='glass mt-10 rounded-3xl p-6 shadow-inset-hair sm:p-10'>
                    <div
                        className='prose prose-invert max-w-none prose-headings:font-display prose-headings:text-white prose-a:text-brand-300 hover:prose-a:text-brand-200 prose-strong:text-white prose-img:rounded-xl'
                        dangerouslySetInnerHTML={{ __html: data.htmlContent }}
                    />
                    <div className='mt-10'>
                        {/* Next.js Link without a nested anchor. */}
                        <Link href="/" className='inline-flex items-center gap-2 font-semibold text-brand-300 transition-colors hover:text-brand-200'>
                            <span aria-hidden='true'>←</span> Back to home
                        </Link>
                    </div>
                </motion.div>
            </motion.article>

            <footer className='relative mt-16 flex justify-center border-t border-white/10 px-8 py-8'>
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