import rp from 'request-promise';
import Item from './item';
import crud from './../core/crud';
import CategoryAbstract from './../../../core/models/CategoryAbstract';
import helper from './../../../core/helper';

class Category extends CategoryAbstract {
	constructor(json) {
		super(json);

		this.pageTitle = 'Microlife Medical';
	}

	getPages() {
		return Promise.all([rp(this.uri, 'GET')])
			.then((response) => {
				const pages = this.getSelectorAll(response, '.navigation-pages a');
				this.pages = pages.length ? pages.length + 1 : 1;
				this.error = '';
			})
			.catch((err) => {
				this.pages = 1;
				this.error += err.message;
			});
	}

	getItems() {
		const settings = crud.get.main.settings();
		const tasks = [];
		for (let page = 1; page <= this.pages; page++) {
			tasks.push(helper.requestWithTimer(this.uri + '?PAGEN_1=' + page, 'GET', null, settings.speed || 1000));
		}
		return Promise.all(tasks)
			.then((result) => {
				result.forEach((page) => {
					let urls = this.getSelectorAll(page, 'article.overview-card:not(.active)');
					// костыль, что бы работала категория "расходные материалы"
					if (urls.length === 0) {
						urls = this.getSelectorAll(page, 'article.thermometer-card');
					}
					const items = [];
					urls.forEach((uri) => {
						const item = {
							uri: uri.getAttribute('data-href').startsWith('http')
								? uri.getAttribute('data-href') // // костыль, что бы работала категория "расходные материалы"
								: 'https://microlife.by/' + uri.getAttribute('data-href'),
							appCategory: this.name,
						};
						items.push(new Item(item));
					});
					this.items.push(...items);
				});
				this.error = '';
			})
			.catch((err) => {
				this.error += err.message;
			});
	}
};

export default Category;
