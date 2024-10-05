(async () => {
    const chai = await import('chai');
    const chaiHttp = await import('chai-http');
    const { default: app } = await import('../app'); // Adjust the path if necessary
    const expect = chai.expect;

    chai.use(chaiHttp);

    describe('GET /', () => {
        it('should return status 200 and the correct title', (done) => {
            chai.request(app)
                .get('/')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.text).to.include('<title>My App</title>');
                    done();
                });
        });
    });
})();