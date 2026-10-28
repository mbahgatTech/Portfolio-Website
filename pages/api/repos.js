import axios from 'axios';
import { withObservability } from '../../utils/server/observability';

/**
 * API route that retrieves a list of all the repositories linked to the 
 * mbahgatTech account and responds with the appropriate list or error message.
 */
const FetchRepos = async (req) => {
    if (req.method !== 'GET') {
        return { status: 405, headers: { Allow: 'GET' }, body: 'Method Not Allowed' };
    }

    try {
        const repos = await axios({
            method: 'get',
            url: 'https://api.github.com/users/mbahgatTech/repos',
            headers: {
                Authorization: 'token ' + process.env.OAuth
            } 
        });
        
        return { status: 200, body: repos?.data };
    } catch (error) {
        return { status: 500, body: 'Failed to fetch user\'s information from github.', error };
    }
}

export default withObservability('/api/repos', FetchRepos);