import axios from 'axios';

/**
 * API route that retrieves a list of all the repositories linked to the 
 * mbahgatTech account and responds with the appropriate list or error message.
 */
const FetchRepos = async (req, res) => {
    let repos = [];

    try {
        repos = await axios({
            method: 'get',
            url: 'https://api.github.com/users/mbahgatTech/repos',
            headers: {
                Authorization: 'token ' + process.env.OAuth
            } 
        });
        
        return res.status(200).send(repos?.data);
    } catch (error) {
        return res.status(500).send('Failed to fetch user\'s information from github.');
    }
}

export default FetchRepos;