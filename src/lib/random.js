const getRandomValue = (array) => {
    const length = array.length;
    const random = Math.floor(Math.random(length));

    return array[random];
};

module.exports = { getRandomValue };
