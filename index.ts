import { dbg } from "./gyrus/src/services/logger"
import { configuration } from "./configuration"


// import { Ts2TsProjectTranslator } from "./sulcus/project_translator"
// import { BaseServerEngine } from "./gyrus/src/base/engine"
import { SulcusServerEngine } from "./sulcus/src/sulcus_engine"
import { MemoryPersistor } from "./gyrus/src/base/nodb";

/*
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
})*/

try {

    dbg.log('Run persistorless server')

    let persistor = new MemoryPersistor()

    new SulcusServerEngine(configuration, persistor)


}
catch(error) {
    console.log(error)
}
