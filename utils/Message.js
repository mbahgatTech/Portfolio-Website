const MessageSubmit = (data) => {
    axios({
        method: 'post',
        url: '/api/message',
        data
    }).catch(err => {
        alert(err.response.data || err.message);
    });
}

export { MessageSubmit };