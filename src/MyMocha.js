const tab = '  ';
const getIndent = level => Array(level).fill(tab).join('');

class MyMocha {

    constructor() {
        this.failing = 0; // Responsible of tracking the number of failures tests
        this.success = 0; // Responsible of tracking the number of Success tests
        this.errors = {}; // Will aggregate the exceptions and their index
        this.anchor = {level: 1, it: [], describe: [], beforeEach: []}; // The anchor of the tree of all the mocha's nodes
        this.refs = [this.anchor]; // Will track the current path in the tree
    }

    getCurrent = () => this.refs[this.refs.length - 1];

    addIt = (description, fn, only) => this.getCurrent().it.push({description, fn, only});

    addItOnly = (description, fn) => {
        this.refs.forEach(ref => ref.only = true);
        this.addIt(description, fn, true)
    };

    addDesc = (title, fn) => {
        const newDesc = {title, level: this.getCurrent().level + 1, it: [], describe: [], beforeEach: []};
        this.getCurrent().describe.push(newDesc);
        this.refs.push(newDesc);
        fn();
        this.refs.pop();
    };

    addBeforeEach = fn => this.getCurrent().beforeEach.push(fn);

    testIt = async (description, callback) => {
        try {
            await callback();
            this.success++;
            return `✓ ${description}`;
        } catch(e) {
            this.failing++;
            this.errors[this.failing] = {description, error: e.toString()};
            return `${this.failing}) ${description}`;
        }
    };

    printTree = async (anchor = this.anchor, beforeEach = []) => {
        for (let {description, fn, only} of (anchor.it || [])) {
            if (!this.anchor.only || only) {
                await Promise.all([...beforeEach, ...anchor.beforeEach].map(async fn => await fn()));
                const result = await this.testIt(description, fn);
                console.log(getIndent(anchor.level) + result);
            }
        }

        for(let desc of (anchor.describe)) {
            if (!this.anchor.only || desc.only) {
                console.log(getIndent(anchor.level) + desc.title);
                beforeEach.push(...anchor.beforeEach);

                await this.printTree(desc, beforeEach);
            }
        }
    };

    printSum = () => {
        console.log(`${tab}${this.success} passing`);
        if (this.failing) {
            console.log(`${tab}${this.failing} failing\n`);
        }
    }

    printErrors = () => {
        Object.entries(this.errors).forEach(([key, {description, error}]) => {
            console.log(`${tab}${key}) ${description}:\n\n${tab}${tab}${tab}${error}\n`);
        });
    }

    printAll = () => {
        this.printTree().then(() => {
            console.log('');
            this.printSum();
            this.printErrors();
        });
    }
}

module.exports = MyMocha;