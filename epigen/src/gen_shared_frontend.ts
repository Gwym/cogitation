// convert imports and exports from module:'commonjs' to default in server/shared for direct use in webapp/shared.gen.ts

// TODO (4) : make out files readonly ?
// TODO (5) : epigenetics.ts as "configuration" file

import * as fs from "fs";
import * as path from "path";

interface EpigenConfigurationInterface {
    shared: string[]
    outfilename: string
}


// FIXME (0) : path may be relative to .ts or to .js (__dirname) !! Make relative to config file path ?
// path relative to built .js, ie. to workspace/epigen
console.log(__dirname);

let epigenConfigFile = path.resolve(__dirname, 'epigenconfig.json')

console.log('Reading epigen configuration from ' + epigenConfigFile + '...')

try {
    let configString = fs.readFileSync(epigenConfigFile).toString()
    let config = <EpigenConfigurationInterface>JSON.parse(configString)
    console.log(config.shared);
    if (! config.shared || (!(config.shared instanceof Array))) {
        console.error(configString);
        throw 'Epigen configuration file error';
    }

    let inFiles = config.shared

    if (! config.outfilename || (typeof(config.outfilename) !== 'string')) {
        console.error(configString);
        throw 'Epigen configuration file error';
    }

    let outFilename = path.resolve(__dirname, config.outfilename)

    var outContent = '// WARNING : GENERATED FILE, DO NOT MODIFY (modify server shared files ' + "\n"
        + '// and run node build/epigen/gen_shared_frontend.js from workspace root directory' + "\n\n";

    for (let inFile of inFiles) {

        console.log('Read ' + inFile)

        let inFilename = path.resolve(__dirname, inFile)

        console.log('Read ' + inFilename)

        let inContent = fs.readFileSync(inFilename, 'utf8');
        inContent = inContent.replace(/export /g, '') + "\n\n";
        // TODO (1) : group use of "" and ''
        inContent = inContent.replace(/import {[^}]*} from '([^']*)';*/g, "// import '$1'");
        inContent = inContent.replace(/import {[^}]*} from "([^"]*)";*/g, "// import '$1'");

        outContent += "\n// " + inFilename + "\n" + inContent;

        console.log('Read ' + path.resolve(inFilename));
    }

    fs.writeFileSync(outFilename, outContent, 'utf8');

    console.log('Wrote ' + path.resolve(outFilename));
}
catch (e) {  // file not found, parse error, ... => set default
    console.error(e);
}




