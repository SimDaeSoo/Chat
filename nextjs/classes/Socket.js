class Client {
    static get instance() {
        if (!this._instance) this._instance = new Client();
        return this._instance;
    }
}

export default Client.instance;