import Head from 'next/head';
import Image from 'next/image';
import Experience from '../components/Experience';
import Socials from '../components/Socials';
import Profile from '../components/Profile';
import styles from '../styles/Home.module.css';

const Portfolio = () => {
  return (
    <div className='bg-slate-800'>
      <Head>
        <title>Mazen Bahgat</title>
        <meta name="Mazen Bahgat's Development Portfolio" content="Software Development Skills and Experiences" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Profile />

      <h1>Experiences</h1>
      <Experience />

      <footer className={styles.footer}>
        <Socials />
      </footer>
    </div>
  );
}

export default Portfolio;