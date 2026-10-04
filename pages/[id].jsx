import CaseFile from '../components/board/CaseFile';
import Seo from '../components/Seo';
import { getExperienceRoutes, getData} from '../utils/Routes';
import { SEO } from '../utils/json/constants';

/**
 * Builds a unique search-result title, e.g.
 * "Back-end Developer at NCR Corporation (2022–2023) | Mazen Bahgat". The years
 * keep the two Microsoft internship pages from sharing a title.
 */
const pageTitle = ({ role, company, dateRange }) => {
    const years = [...new Set(dateRange?.match(/\d{4}/g))].join('–');
    return `${role} at ${company}${years ? ` (${years})` : ''} | ${SEO.SITE_NAME}`;
};

/**
 * Experience detail page: one experience's markdown case study as a case file
 * (components/board/CaseFile). Page data comes from getStaticProps (see utils/Routes.js).
 */
const Experience = ({ data }) => {
    return (
        <>
            <Seo title={pageTitle(data)} description={data.description} path={`/${data.id}`} />
            <CaseFile data={data} />
        </>
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