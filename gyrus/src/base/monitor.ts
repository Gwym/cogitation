
import { AsyncPersistor } from '../services/persistor'
import { QueryFilter } from '../services/shared/messaging'
// TODO (1) : put check monitor in shared file messaging for client side filter pre-checks ?

class EngineMonitor {

    toRangedInteger(value: any) {

        if (typeof value === "number" &&
            isFinite(value) &&
            Math.floor(value) === value &&
            value > 0 &&
            value <= AsyncPersistor.MAX_FILTER_LIMIT) {
            return value
        }
        else {
            //  TODO (1) : monitor.log( input failed )
            return AsyncPersistor.DEFAULT_FILTER_LIMIT
        }
    }

    checkFilter(inFilter: any): QueryFilter {

        let filter: QueryFilter = {
            limit: this.toRangedInteger(inFilter.limit)
        }
        return filter
    }
}


export var monitor = new EngineMonitor()

