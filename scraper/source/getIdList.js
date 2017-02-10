const fs = require('fs');
const path = require('path');

if (!fs.existsSync(path.join(__dirname, '../lists'))) {
    fs.mkdirSync(path.join(__dirname, '../lists'));
}

const getIdList = () => {
    arr = [];
    parts = [1, 2, 3, 4, 5];
    parts.forEach(part => {
        const file = fs.readFileSync(path.join(__dirname, `../id_data/idheap${part}.json`))
        fs.writeFileSync(path.join(__dirname, '../id_data/id_part.json'), JSON.stringify(JSON.parse(file), null, 4));
        const jFile = JSON.parse(fs.readFileSync(path.join(__dirname, '../id_data/id_part.json')));
        jFile.aaData.forEach(elem => {
            arr.push(elem[0])
        });
    })
    fs.writeFileSync(path.join(__dirname, '../lists/id_list.json'), JSON.stringify(arr, null, 4));
    if (fs.existsSync(path.join(__dirname, '../id_data/id_part.json'))) {
        fs.unlinkSync(path.join(__dirname, '../id_data/id_part.json'));
    }
};

module.exports = getIdList();
