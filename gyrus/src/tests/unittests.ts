import { dbg } from "../services/logger"

// TODO (1) : remove assert from Logger and add it To TestLogger ?
// add this.assert() ... => client report

interface TestIdentifier {
    id: number
    alias: string
}

export class TestManager {

    static testPool: BaseUnitTester[] = []

    // TODO (3) : i18n alias
    static register(test: BaseUnitTester): TestIdentifier {

        dbg.log('register ' + test.constructor.name)
        this.testPool.push(test)

        return {
            id: this.testPool.length - 1,
            alias: test.constructor.name
        }
    }

    static runTests() {
        // TODO : new ... ?
        for (let test of this.testPool) {
            test.doTests()
        }
    }
}

export abstract class BaseUnitTester {

    id: TestIdentifier

    constructor() {
        this.id = TestManager.register(this)
    }

    log(s: string) {
        dbg.log(s)
    }

    abstract doTests(): void 
}

class TestUser extends BaseUnitTester {

    doTests() {
        dbg.log ('TEST ' + this.id.alias)
        dbg.log('TODO testUser')
    }
}
new TestUser()
