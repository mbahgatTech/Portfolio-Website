import CaseBoard from '../components/board/CaseBoard';
import Seo, { absoluteUrl } from '../components/Seo';
import { PROFILE, NAVIGATION, SEO } from '../utils/json/constants';
import { getData } from '../utils/Routes';
import experienceList from '../utils/json/experience.json';

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
 * Home page: the portfolio as an evidence board (components/board). Each role's
 * dates come from its case study's front matter.
 */
const Portfolio = ({ experiences }) => {
  return (
    <>
      <Seo
        title={SEO.HOME_TITLE}
        description={SEO.HOME_DESCRIPTION}
        path='/'
        jsonLd={STRUCTURED_DATA}
      />
      <CaseBoard experiences={experiences} />
    </>
  );
}

const getStaticProps = async () => ({
  props: {
    experiences: await Promise.all(experienceList.map(async (experience) => {
      const id = experience.report.replace(/^\//, '');
      const { dateRange = null } = await getData(id);
      return { ...experience, id, dateRange };
    })),
  },
});

export default Portfolio;
export { getStaticProps };