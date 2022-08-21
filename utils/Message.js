import axios from 'axios';

const MessageSubmit = async (data) => {    
    return false;
    try {
        await axios({
            method: 'post',
            url: '/api/message',
            data
        });
    } catch(err) {
        return false;
    }

    return true;
}

export { MessageSubmit };