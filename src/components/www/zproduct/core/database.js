import fs from 'fs-extra';
import low from 'lowdb';
import path from 'path';
import FileSync from 'lowdb/adapters/FileSync';

const dbDir = 'db';
const websiteName = 'zproduct';

const getDb = (dir, name, instanse) => {
	if (!fs.pathExistsSync(dir)) {
		fs.mkdirpSync(dir);
	}
	const dbFile = path.join(dir, name);
	const exist = fs.existsSync(dbFile);
	const adapter = new FileSync(dbFile);
	const db = low(adapter);
	if (!exist) {
		db.defaults(instanse).write();
	}
	return db;
};

const connect = {
	main: () => {
		const dir = path.join(dbDir, websiteName);
		return getDb(dir, 'main.json', {
			settings: {
				website: 'http://www.zproduct.by',
				name: 'zproduct',
				speed: 5000,
				imageSpeed: 5000,
				tempFolder: 'temp/zproduct',
				imageFolder: 'images/zproduct',
			},
		});
	},
	categories: () => {
		const dir = path.join(dbDir, websiteName);
		return getDb(dir, 'categories.json', {categories: []});
	},
};

export default connect;
