import Store from './controllers/Store.js';

class App {
  async run() {
    const store = new Store();
    await store.run();
  }
}

export default App;