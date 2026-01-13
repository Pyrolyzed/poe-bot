const getRandomValue = (array) => {
    const length = array.length;
    const random = Math.floor(Math.random(length));
    console.log(length)
    console.log(random)
    return array[random];
};

module.exports = { getRandomValue };
