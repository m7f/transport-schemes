const fs = require('fs');

if (!fs.existsSync('./lists')) {
    fs.mkdirSync('./lists');
}

const getIdList = () => {
    arr = [];
    parts = [1, 2, 3, 4, 5];
    parts.forEach(part => {
        const file = fs.readFileSync('./id_data/idheap' + part + '.json')
        fs.writeFileSync('./id_data/id_part.json', JSON.stringify(JSON.parse(file), null, 4));
        const jFile = JSON.parse(fs.readFileSync('./id_data/id_part.json'));
        jFile.aaData.forEach(elem => {
            arr.push(elem[0])
        });
    })
    fs.writeFileSync('./lists/id_list.json', JSON.stringify(arr, null, 4));
    if (fs.existsSync('./id_data/id_part.json')) {
        fs.unlinkSync('./id_data/id_part.json');
    }
};

module.exports = getIdList();
