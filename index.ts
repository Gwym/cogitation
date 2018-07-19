import { dbg } from "./gyrus/src/services/logger"
import { BaseMongoPersistor } from "./gyrus/src/base/mongodb"
import { configuration } from "./configuration"


// import { Ts2TsProjectTranslator } from "./sulcus/project_translator"
// import { BaseServerEngine } from "./gyrus/src/base/engine"
import { SulcusServerEngine } from "./sulcus/src/sulcus_engine"
import { TestManager } from "./gyrus/src/tests/unittests"

new BaseMongoPersistor().connect(configuration.mongoURL).then((persitor) => {
    dbg.info('Connected to MongoDB at: ' + configuration.mongoURL)

    new SulcusServerEngine(configuration, persitor)

    try {
        // TODO (0) : separate index_test.ts
        dbg.log('RUN UNIT TESTS')
        TestManager.runTests()
       // let unit = new BaseUnitTester()
       // unit.doTests()
    }
    catch (err) {
        console.error(err)
    }
}).catch((err) => {
    console.error('could not connect ')
    console.log(err)
})



