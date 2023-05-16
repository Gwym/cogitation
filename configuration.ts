
import * as fs from 'fs'
import * as path from 'path'

import { dbg } from './gyrus/src/services/logger'
import { ConfigurationInterface } from './gyrus/src/services/dispatcher'

export interface SulcusConfigurationInterface extends ConfigurationInterface {
  sandboxPath: string
}

export var configuration: SulcusConfigurationInterface;

let confFileName = path.resolve(__dirname, '../configuration.json')

dbg.log('loading configuration file: ' + confFileName)

try {
  configuration = <SulcusConfigurationInterface>JSON.parse(fs.readFileSync(confFileName).toString());
  // FIXME (1) : set default value for each missing field if not set in conf file

  //console.assert(typeof configuration.sandboxPath === 'string', 'sandboxPath missing in configuration')
  if (typeof configuration.sandboxPath !== 'string') {
    throw('sandboxPath missing in configuration')
  }

}
catch (e) {  // file not found, parse error, ... => set default
  dbg.warn(<string>e)
  dbg.log('No or bad configuration, using defaults')
  configuration = {

    sandboxPath: 'frontend/sandbox',

    httpIpAddress: '0.0.0.0',
    httpPort: 8080,
    fileServerPath:'./frontend',
    allowRegistration: false,
    doSendRegistrationMail: false,
    mailServer: '',
    mailSecret: '',
    mongoURL: 'mongodb://localhost:27017/cogitation', // mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]
    doCheckCaptcha: false,
    captchaSecret: '',
    doCheckInvitationCode: false,
    doCheckPasswordStrength: false
  }
}

dbg.info(JSON.stringify(configuration))

