import fs from 'fs';
import matter from 'gray-matter';
import html from 'remark-html';
import { remark } from 'remark';

const experiences = process.cwd() + '/utils/experiences';

/**
 * Function that gets reads the file names in the experiences directory and 
 * removes their .md extensions then returns a list of objects with a 
 * params element containing the id of each object (file name). This function
 * gets called from getStaticPaths in /pages/[id].jsx for creating statically rendered
 * dynamic pages. 
*/
const getExperienceRoutes = () => {
    let fileNames = fs.readdirSync(experiences);
    
    let routeObjs = fileNames.map(fileName => {
        return {
          params: {
            id: fileName.replace(/\.md$/, ''),
          },
        };
    });

    return routeObjs;
};

/**
 * Function parses the markdown file with given id name in the experiences folder
 * and returns a parsed object with the file's metadata, the id and the html content
 * generated from the markdown contents. It uses gray-matter to parse the file
 * contents and the result is returned.
 */
const getData = async (id) => {
    const file = fs.readFileSync(`${experiences}/${id}.md`, 'utf8');
  
    // Use gray-matter to parse the file metadata section
    const fileContents = matter(file);

    // Use remark to convert markdown into HTML string
    const processedContent = await remark().use(html).process(fileContents.content);
    const htmlContent = processedContent.toString();
  
    return {
      id,
      htmlContent,
      ...fileContents.data,
    };
};

export { getExperienceRoutes, getData };