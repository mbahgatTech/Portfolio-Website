import axios from 'axios';

const MessageSubmit = async (data) => {    
    try {
        await axios({
            method: 'post',
            url: '/api/message',
            data
        });
    } catch(err) {
        alert(err.response.data || err.message);
    }
}

export { MessageSubmit };