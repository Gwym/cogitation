import * as path from 'path'
import { SulcusConfigurationInterface } from '../../configuration'
import { dbg } from '../../gyrus/src/services/logger'

// import * as png from 'pngjs'

export class SystemOperator {

    readonly sandboxPath: string

    constructor(config: SulcusConfigurationInterface) {

        this.sandboxPath = path.normalize(path.resolve(config.sandboxPath))
    }

    protected resolvePath(relPath: string) {
        return path.resolve(path.join(this.sandboxPath, relPath))
    }

    saveToPNG(filename: string, _buffer: Buffer, _width: number, _height: number) {

        // filename += '.png'
        filename = this.resolvePath(filename + '.png')

        dbg.log('TODO (4) : non invasive pngjs and robotjs')

      /*  let pngImage = new png.PNG({ width: width, height: height })

        // ~clone 
        pngImage.data = Buffer.from(buffer)

        dbg.log('writing ' + filename + ' pngImage.data ' + pngImage.data.length)

        pngImage.pack()
            .pipe(fs.createWriteStream(filename).on('error', function (e) {
                dbg.error('stream error ' + e)
            }).on('finish', function () {
                dbg.log('Written ' + filename)
            })
            )

            */
    }


}