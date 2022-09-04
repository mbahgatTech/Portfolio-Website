import Head from 'next/head';
import Experience from '../components/Experience';
import Socials from '../components/Socials';
import Profile from '../components/Profile';
import Contact from '../components/Contact';
import Modal from '../components/ConfirmModal';
import { useState } from 'react';

const Portfolio = () => {
  const [modal, setModal] = useState({visible: false, data: {name: '', email: '', message: ''}});

  return (
    <div className='bg-slate-800 overflow-x-hidden'>
      <Head>
        <title>Mazen Bahgat</title>
        <meta name="Mazen Bahgat's Development Portfolio" content='Software Development Skills and Experiences' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <Profile />
      
      <section className='bg-gray-100 h-full w-screen py-5'>
        <Experience />
      </section>
      
      <Contact setModal={setModal} />
      <Modal modal={modal} setModal={setModal} />

      <footer className='flex px-8 py-8 justify-center'>
        <Socials />
      </footer>
      
    </div>
  );
}

export default Portfolio;