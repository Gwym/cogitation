
import * as fs from 'fs'

import { dbg } from './gyrus/src/services/logger'
import { ConfigurationInterface } from './gyrus/src/services/dispatcher'

interface SulcusConfigurationInterface extends ConfigurationInterface {
  sandboxPath: string
}

export var configuration: SulcusConfigurationInterface;

try {
  configuration = <SulcusConfigurationInterface>JSON.parse(fs.readFileSync('configuration.json').toString());
  // FIXME (1) : set default value for each missing field if not set in conf file
}
catch (e) {  // file not found, parse error, ... => set default
  dbg.warn(e);
  dbg.log('No or bad configuration, using defaults');
  configuration = {

    sandboxPath: 'frontend/sandbox',

    httpIpAddress: '0.0.0.0',
    httpPort: 8080,
    fileServerPath:'./frontend',
    allowRegistration: false,
    doSendRegistrationMail: false,
    mailServer: '',
    mailSecret: '',
    mongoURL: 'mongodb://localhost:27017/sulcus', // mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]
    doCheckCaptcha: false,
    captchaSecret: '',
    doCheckInvitationCode: false,
    doCheckPasswordStrength: false
  }
}

dbg.info(JSON.stringify(configuration));

