const gpt = require('./gpt-api-client.js');
const fs = require('node:fs');
const intialPrompt = fs.readFileSync('./assets/prompt.txt').toString();

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
	}
	history = null;
	generate = async function (message) {
		this.history = `${this.history || JSON.stringify({ role: 'system', content: intialPrompt })}, {role: 'user', content: ${message}}, `;
		const text = await gpt.generate(this.history, this.model);
		const res = JSON.parse(text);
		if (res.type === 'conversation') {
			this.history = `${this.history}${text}`;
			return res.content;
		} else if (res.type === 'search') {
			//search and format JSON, pass as info role.
		}
	};
}

module.exports = { gpts, userGPT };