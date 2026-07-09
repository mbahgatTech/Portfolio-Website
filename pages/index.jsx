import Head from 'next/head';
import Experience from '../components/Experience';
import Socials from '../components/Socials';
import Profile from '../components/Profile';
import Contact from '../components/Contact';
import Modal from '../components/ConfirmModal';
import ScrollProgress from '../components/ui/ScrollProgress';
import { useState } from 'react';

/**
 * Home page: lays out the hero, experience, and contact sections and owns the
 * confirmation-modal state shared by the contact form and the modal.
 */
const Portfolio = () => {
  const [modal, setModal] = useState({visible: false, data: {name: '', email: '', message: ''}});

  return (
    <div className='relative min-h-screen overflow-x-hidden bg-ink-950 text-white'>
      <Head>
        <title>Mazen Bahgat</title>
        <meta name="Mazen Bahgat's Development Portfolio" content='Software Development Skills and Experiences' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <ScrollProgress />

      <main>
        <Profile />
        <Experience />
        <Contact setModal={setModal} />
      </main>

      <Modal modal={modal} setModal={setModal} />

      <footer className='flex justify-center border-t border-white/10 px-8 py-10'>
        <Socials />
      </footer>
    </div>
  );
}

export default Portfolio;