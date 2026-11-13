import bookHandler from './[bookId].js';

export default async function handler(req, res) {
  return bookHandler(req, res);
}

