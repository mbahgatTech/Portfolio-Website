import Head from 'next/head';
import Experience from '../components/Experience';
import Socials from '../components/Socials';
import Profile from '../components/Profile';
import Contact from '../components/Contact';

const Portfolio = () => {
  return (
    <div className='bg-slate-800'>
      <Head>
        <title>Mazen Bahgat</title>
        <meta name="Mazen Bahgat's Development Portfolio" content='Software Development Skills and Experiences' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <Profile />
      
      <section className='bg-gray-100 h-full w-screen py-5'>
        <Experience />
      </section>
      
      <Contact />

      <footer className='flex px-8 py-8 justify-center border-inherit border-t border-slate-300'>
        <Socials />
      </footer>
    </div>
  );
}

export default Portfolio;