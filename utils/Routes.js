import fs from 'fs';
import matter from 'gray-matter';
import html from 'remark-html';
import { remark } from 'remark';

const experiences = process.cwd() + '/utils/experiences';
const DESCRIPTION_MAX_LENGTH = 160;

/**
 * Builds a plain-text search-result snippet from the first paragraph of a
 * markdown body (skipping headings, images, lists, and quotes), trimmed to about
 * 160 characters on a word boundary.
 */
const toExcerpt = (markdown) => {
    const paragraph = markdown
        .split(/\r?\n\s*\r?\n/)
        .map((block) => block.trim())
        .find((block) => block && !/^(#|!\[|>|[-*+]\s|\d+\.\s|```|\|)/.test(block)) || '';

    const text = paragraph
        .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        .replace(/[*_`]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    if (text.length <= DESCRIPTION_MAX_LENGTH) return text;
    const cut = text.slice(0, DESCRIPTION_MAX_LENGTH - 1);
    return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,;:.]+$/, '')}…`;
};

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
 * and returns a parsed object with the file's metadata, the id, the html content
 * generated from the markdown contents, and a short description for search
 * results. It uses gray-matter to parse the file contents and the result is returned.
 * A `description` field in the file's front matter overrides the generated one.
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
      description: toExcerpt(fileContents.content),
      ...fileContents.data,
    };
};

export { getExperienceRoutes, getData };