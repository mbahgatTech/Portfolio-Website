import Experience from '../components/Experience';
import Socials from '../components/Socials';
import Profile from '../components/Profile';
import Contact from '../components/Contact';
import Modal from '../components/ConfirmModal';
import ScrollProgress from '../components/ui/ScrollProgress';
import Seo, { absoluteUrl } from '../components/Seo';
import { PROFILE, NAVIGATION, SEO } from '../utils/json/constants';
import { useState } from 'react';

// Structured data (schema.org JSON-LD) telling search engines this site is about a
// person, and which social profiles are theirs. Google can use it for the site name
// and knowledge panel shown in search results.
const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': absoluteUrl('/#website'),
      url: absoluteUrl('/'),
      name: SEO.SITE_NAME,
    },
    {
      '@type': 'Person',
      '@id': absoluteUrl('/#person'),
      name: PROFILE.MAZEN_BAHGAT,
      url: absoluteUrl('/'),
      image: absoluteUrl(SEO.IMAGE.PATH),
      jobTitle: PROFILE.JOB_TITLE,
      sameAs: NAVIGATION.map((item) => item.href),
    },
  ],
};

/**
 * Home page: lays out the hero, experience, and contact sections and owns the
 * confirmation-modal state shared by the contact form and the modal.
 */
const Portfolio = () => {
  const [modal, setModal] = useState({visible: false, data: {name: '', email: '', message: ''}});

  return (
    <div className='relative min-h-screen overflow-x-hidden bg-ink-950 text-white'>
      <Seo
        title={SEO.HOME_TITLE}
        description={SEO.HOME_DESCRIPTION}
        path='/'
        jsonLd={STRUCTURED_DATA}
      />

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