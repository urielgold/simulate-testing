const MyMocha = require('./MyMocha.js')
const myMocha = new MyMocha();

global.describe =  myMocha.addDesc;
global.it = myMocha.addIt;
global.it.only = myMocha.addItOnly;
global.beforeEach = myMocha.addBeforeEach;

require(process.argv[2]);
myMocha.printAll();