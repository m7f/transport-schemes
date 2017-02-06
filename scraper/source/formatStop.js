formatStop = (stop) => {
    result = '';
    iter = 0;
    while (iter != stop.length) {
        if (stop[iter] === '\"') {
            result += '\\';
        }
        result += stop[iter];
        iter += 1;
    };
    return result;
};

module.exports = formatStop;
