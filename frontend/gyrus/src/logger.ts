


// logger.ts

interface ClientLogger {
    log(s: any): void
    info(s: string): void
    warn(s: string): void
    error(a: any): void
    attr(s: string): void
    assert(test: boolean, msg: string): void

    // Utility functions
    // toStr(o: any): string // object to string
    // t2d(t: number): string // timestamp to string
}


// TODO (1) : remote dbg : error, assert, throw, catch...

/*var dbg: ClientLogger = {
    log(a: any) {
        console.log(a);
    },
    info(s: string) {
        console.info(s);
    },
    warn(s: string) {
        console.warn(s);
    },
    error(s: string) {
        console.error(s);
    },
    attr(_s: string) {
        //console.log(s);
    },
    assert(test: boolean, msg: string) {
        console.assert(test, msg);
    }
} */