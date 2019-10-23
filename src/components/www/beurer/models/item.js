import _ from 'lodash';
import jsdom from 'jsdom';

import helper from './../../../core/helper';
import ItemAbstract from './../../../core/models/ItemAbstract';
import valuesHelper from '../../../utils/values';
import documentHelper from '../../../utils/document';

const JSDOM = jsdom.JSDOM;

const prefixes = {
	uri: 'https://microlife.by',
	article: 'MC',
};

class Item extends ItemAbstract {
	constructor(json) {
		super(json);

		this.model = json.model || '';
	};

	getName(document) {
		const name = document.querySelector('#pagetitle').textContent;

		return name;
	}

	getPrice(document) {
		const price = document.querySelector('.curr-price-notiker');
		// get textContent method
		return price ? price.textContent : '';
	}

	getArticle(document) {
		const article = document.querySelector('.article').textContent;

		return valuesHelper.removeIncorrectSymbols(article);
	}

	getWarranty(document) {
		return document.querySelector('.GUARANTEE_MONTH span').textContent;
	}

	getBreadCrumbs(document) {
		return document.querySelector('#navigation');
	}

	getDocumentation(document) {
		const linkElement = document.querySelector('.files-docs-item');
		return linkElement ? prefixes.uri + linkElement.getAttribute('href') : '';
	}

	getFeatures(document) {
		const featuresElement = document.querySelector('.tabs__box');
		return featuresElement ? featuresElement.innerHTML : '';
	}

	getImage(document) {
		const result = [];
		const mainImageElement = document.querySelector('.catalog-detail-picture img');
		if (mainImageElement) {
			const imageUri = mainImageElement.getAttribute('src');

			result.push(`${prefixes.uri}${imageUri}`);
		}
		const additionalImages = document.querySelectorAll('.more_photo img');
		if (additionalImages) {
			additionalImages.forEach((img) => {
				const imageUri = img.getAttribute('src');
				result.push(`${prefixes.uri}${imageUri}`);
			})
		}

		return result;
	}

	getDescription(document) {
		const description = this.getTextContent(document, '[itemprop="description"]');

		return valuesHelper.removeIncorrectSymbols(description);
	}

	getFullInformation(document) {
		const tabs = document.querySelectorAll('.tabs__box');
		const information = tabs[1];
		const result = information ? information.innerHTML : '';
		return valuesHelper.removeIncorrectSymbols(result);
	}


	getItem(timeout, parrent) {
		const options = {method: 'GET'};
		const task = helper.requestWithTimer(this.uri, options, parrent, timeout);
		return Promise.all([task])
			.then((result) => {
				const doc = new JSDOM(result).window.document;

				this.name = this.getName(doc);
				this.price = this.getPrice(doc);
				this.article = this.getArticle(doc);
				this.image = this.getImage(doc);
				this.warranty = this.getWarranty(doc);
				this.documentation = this.getDocumentation(doc);
				this.features = this.getFeatures(doc);

				this.category = this.getBreadCrumbs(doc);
				this.description = this.getDescription(doc);
				this.fullInformation = this.getFullInformation(doc);

				this.error = '';
			})
			.catch((err) => {
				this.error = err.message;
			});
	}
};

module.exports = Item;
