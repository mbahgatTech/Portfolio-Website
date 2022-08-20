import { getExperienceRoutes, getData} from '../utils/Routes';

const Experience = ({ data }) => {
    return (
        <div>
            {data.company}
            <br />
            {data.dateRange}
            <br />
            {data.dateRange}
            <br />
            <div dangerouslySetInnerHTML={{ __html: data.htmlContent }} />
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