const gpt = require('./gpt-api-client.js');
const fs = require('node:fs');
const prompt = fs.readFileSync('../assets/prompt.txt').toString();
const util = require('./utils.js');
const config = require('../config.json');

const google = require('googlethis');
const axios = require('axios');

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
	generate = async (message) => {
		if (this.init) {
			this.add({ role: 'system', content: prompt });
			this.init = false;
			this.add({
				role: 'info',
				content: `Current time is ${util.getCurrentTime()}`
			});
		}
		this.add({
			role: 'user',
			content: message
		});
		const text = await gpt.generate(JSON.stringify(this.history), this.model);
		const res = JSON.parse(text);
		console.log(res);
		if (res.type === 'conversation') {
			this.add({
				role: 'assistant',
				content: res.content
			});
			return res.content;
		} else if (res.type === 'search') {
			console.log(res.keyword);
			console.log('Search is not implemented.');
		} else if (res.type === 'action') {
			if (res.action === 'weather') {
				if (res.when === 'current') {
					const current = await axios.get(`https://api.weatherapi.com/v1/current.json?key=${config.tokens.weather}&q=${res.place}&lang=ja`);
				} else {
					const forecast = await axios.get(`https://api.weatherapi.com/v1/forecast.json?key=${config.tokens.weather}&q=${res.place}&dt=${res.when}`);
					let temp = {
						date: forecast.data.forecast.forecastday[0].date,
						day: forecast.data.forecast.forecastday[0].day,
						astro: forecast.data.forecast.forecastday[0].astro
					};
					this.add({
						role: 'weather',
						content: temp
					});
					const finalResult = await gpt.generate(JSON.stringify(this.history), this.model);
					const finalResponse = JSON.parse(finalResult);
					this.add({
						role: 'assistant',
						content: finalResponse.content
					});
					console.log(finalResponse);
					return finalResponse.content;
				}
			}
		}
	};
}

module.exports = { gpts, userGPT };