const gpt = require('./gpt-api-client.js');
const fs = require('node:fs');
const prompt = fs.readFileSync('./assets/prompt.txt').toString();

const google = require('googlethis');

const googleOptions = {
	page: 0,
	safe: true,
	parse_ads: false,
};

class gpts {
	users = {};
	add(user, model) {
		let temp = {
			[user]: {
				model: model
			}
		};
		this.users = { ...this.users, ...temp };
		this.users[user] = new userGPT(user, model || 1);
		return;
	}
}

class userGPT {
	constructor(user, model) {
		this.username = user;
		this.model = model;
		this.history = [];
		this.init = true;
	}
	add = function (data) {
		this.history.push(data);
		return this.history;
	};
	generate = async function (message) {
		if (this.init) {
			this.add({ role: 'system', content: prompt });
			this.init = false;
		}
		this.add({
			role: 'user',
			content: message
		});
		const text = await gpt.generate(JSON.stringify(this.history), this.model);
		console.log(this.history);
		const res = JSON.parse(text);
		if (res.type === 'conversation') {
			this.add({
				role: 'assistant',
				content: res.content
			});
			return res.content;
		} else if (res.type === 'search') {
			console.log(res.keyword);
			console.log(await google.search('google', googleOptions));
			//search and format JSON, pass as info role.
			console.log('Search is not implemented.');
		}
	};
}

module.exports = { gpts, userGPT };