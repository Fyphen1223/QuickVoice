const { userGPT } = require('./gpt-client');

async function main() {
    const gpt = new userGPT('A', 5);
    console.log(await gpt.generate("1週間後の天気を教えてください。"));
    console.log(await gpt.generate("何故ですか？"));
}

main();