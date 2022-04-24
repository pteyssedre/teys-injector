import {Inject, Injector} from "../index";
import {assert} from "chai";

class TestInject {

    @Inject('inject-name')
    private domain: string;

    test() {
        return this.domain
    }
}


describe("Inject", () => {

    before(() => {
        Injector.Register("inject-name", "domain.com");
    });
    it("Should work", () => {
        const d = new TestInject();
        assert.equal(d.test(), "domain.com", "not equal")
    })
});
