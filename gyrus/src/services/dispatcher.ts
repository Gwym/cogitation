import * as http from 'http';
import * as https from 'https';
import * as wslib from 'ws';
import * as wsWebSocket from 'ws'; // rename, to take care to not confuse between browser client WebSocket and node ws lib WebSocket
import * as querystring from 'querystring';

import { dbg, LoggerParts } from './logger'
//import { configuration } from '../configuration_model'
import { StaticServer, StaticServerOptions } from './static_server';
import {
  websocketProtocolVersion, XJsonUrl, MessageType, ToStringId, c2s_ChannelMessage, s2c_ChannelMessage,
  UserOptions, UserSessionAck, XRegistrationRequest, XLoginRequest, ErrorMessage, ErrMsg, SessionCheckRequest, XConfigureRegistrationAck, checkPasswordStrenght
} from './shared/messaging'
import { AsyncPersistor } from "./persistor";

// TODO (4) : add json schema to vscode https://code.visualstudio.com/docs/languages/json#_json-schemas-settings
export interface ConfigurationInterface {
  httpPort: number,
  httpIpAddress?: string,
  fileServerPath?: string
  fileServerOptions?: StaticServerOptions
  mongoURL: string,
  allowRegistration: boolean
  doSendRegistrationMail: boolean,
  mailServer: string,
  mailSecret: string,
  doCheckCaptcha: boolean,
  captchaSecret: string,
  doCheckInvitationCode: boolean,
  doCheckPasswordStrength: boolean
}

export enum HttpStatusCode { Ok = 200, BadRequest = 400, Forbidden = 403, NotFound = 404, MethodNotAllowed = 405, PayloadTooLarge = 413, InternalServerError = 500 }

type SessionIdentifier = string

export interface UserSessionInterface {
  sessionId: SessionIdentifier
  userOptions: UserOptions
  connectWs(ws: wsWebSocket): void
  disconnectWs(): void
  send(msg: s2c_ChannelMessage): void
}

// FIXME (5) : cannot use type definition as dictionary index
interface UserSessionDictionary {
  [index: string]: UserSessionInterface | undefined // ~ [index: SessionIdentifier]: UserSessionInterface | undefined 
}

export class UserSession implements UserSessionInterface {

  sessionId: SessionIdentifier
  dh: number
  userOptions: UserOptions
  private ws: wsWebSocket | undefined

  constructor(userOpt: UserOptions) {
    // this.sessionId =  crypto.randomBytes(256).toString('hex');
    this.sessionId = Math.round(Math.random() * Number.MAX_SAFE_INTEGER).toString(16);
    this.dh = Date.now();
    this.userOptions = userOpt;
  }

  connectWs(ws: wsWebSocket): void {
    this.ws = ws;
  }

  disconnectWs(): void {
    delete this.ws;
  }

  send(msg: s2c_ChannelMessage) {
    if (this.ws) {
      this.ws.send(JSON.stringify(msg), (err) => {
        if (err) {
          dbg.error('UserSession.send > err: ' + err);
        }
      });
    }
    else {
      dbg.error('websocket not connected');
    }
  }
}

export class GuestUserSession extends UserSession {
  constructor() {
    super({ name: 'Guest' })
  }
}

export interface UserSyncManager {
  createUser(userReg: XRegistrationRequest): UserSessionAck
  getUserFromLogin(cmd: XLoginRequest): UserOptions
}

export interface UserAsyncManager {
  createUser(userReg: XRegistrationRequest): Promise<UserSessionAck>
  getUserFromLogin(cmd: XLoginRequest): Promise<UserOptions>
}

export interface UserSessionSyncManager {
  createSession(userOptions: UserOptions): UserSessionInterface
  // registerSession(userSession: UserSessionInterface): void
  // getUserFromSession(sessionId: string): UserOptions | undefined
  connectSession(ws: wsWebSocket, sessionId: string): void
  // disconnectWsSession(sessionId: string): void
  unregisterSession(iId: string): void
}

export interface UserSessionAsyncManager {
  createSession(userOptions: UserOptions): Promise<UserSessionInterface>
  // registerSession(userSession: UserSessionInterface): Promise<void>
  // getUserFromSession(sessionId: string): Promise<UserOptions | undefined>
  connectSession(ws: wsWebSocket, sessionId: string): Promise<UserSessionInterface>
  // disconnectWsSession(ws: wsWebSocket, sessionId: string): Promise<UserSessionInterface>
  unregisterSession(iId: string): void
}


// Communication
// !!! enum type WebsocketCreate === 0 and WebsocketClose === 1 are used in index.html !!!
export enum MessageTypes { WebsocketCreate, WebsocketClose, RequestState, State, Control, Data, Error, RequestPorts };

export interface MessageConsumer {
  handler: (message: any) => void; // local message type (WebsocketMessage.data)
}

// TODO (2) : one interface per message type ?
export interface WebsocketMessage {

  websocketLog?: string; // websocket/worker debug

  messageType: MessageTypes;

  event?: number; // MessageTypes.Control
  data: {
    path?: string,  // MessageTypes.WebsocketCreate
    code?: number, reason?: string, // MessageTypes.WebsocketClose
    state?: number // MessageTypes.State
    samples?: number[], accel?: number[], count?: number, // MessageTypes.Data
    control?: string, connect_to_ws?: boolean, // MessageTypes.Control 
    ports?: string[], // MessageTypes.RequestPorts 
    error?: string // MessageTypes.Error
  };
}


export interface DispatcherInterface {
  // (arg: WebsocketMessage): void;
}

export abstract class Dispatcher implements UserSessionSyncManager, DispatcherInterface {

  readonly captchaSecret: string
  readonly configuration: ConfigurationInterface

  // xSessions: SessionIdentifier[] = [] // Http "Ajax" sessions
  userSessions: UserSessionDictionary = {} // WebSocket sessions

  // TODO (3) : epigen : BaseDispatcher extends Dispatcher
  // readonly httpIpAddress?: string
  // readonly httpPort?: number
  // readonly wsProtocol?: string
  // readonly fileServerPath?: string
  // readonly fileServerOptions?: any
  // readonly XJsonUrl?: string
  abstract dispatchWsCommand(cmd: c2s_ChannelMessage, user: UserSessionInterface): void
  abstract dispatchBinary(cmd: Buffer | ArrayBuffer | Buffer[], user: UserSessionInterface): void;
  abstract createSession(userOptions: UserOptions): UserSessionInterface

  // WARNING : switching database is only for integration testing, engine cannot manage db change
  getDb() { return this.db }
  setDb(db: AsyncPersistor) { this.db = db }

  constructor(config: ConfigurationInterface, protected db: AsyncPersistor) {

    this.configuration = config

    dbg.log('fileServerPath:' + config.fileServerPath + ' Options:' + config.fileServerOptions);

    //  this.httpIpAddress = config.httpIpAddress; 
    //  this.httpPort = config.httpPort;
    //  this.wsProtocol = config.wsProtocol;
    //  this.fileServerPath = config.fileServerPath;
    this.captchaSecret = config.captchaSecret;

    let fileServer = new StaticServer(config.fileServerPath, config.fileServerOptions);

    let server = http.createServer((req, res) => {

      // req.headers.url = <string>req.url;
      // req.headers.ip = req.socket.remoteAddress;

      /* try {
         let col = db.collection('tracks');
         col.insert({ date: Date.now(), req: req.headers });
       }
       catch (e) {dispatchXCommand
         dbg.error(e);
       } */

      if (req.method === 'GET') {
        (req.on('end', () => {

          // dbg.log('GET url: ' + req.url, LoggerParts.Filename);

          if (req.url) {
            if (req.url === '/ready') { // readinessProbe
              // TODO (1) : check => Promise.all(HttpServer, WsServer, Persitor, FileServer)
              dbg.log('ready');
              res.writeHead(HttpStatusCode.Ok, { 'Content-Type': 'text/html' });
              res.end('<!DOCTYPE html><html><head><head><body>ready</body></html>');
            }
            else if (req.url.indexOf(XJsonUrl) === 0) {

              this.dispatchXCommand(req.url.substring(XJsonUrl.length), (ack: s2c_ChannelMessage) => {
                res.writeHead(HttpStatusCode.Ok, { 'Content-Type': 'text/html' });
                res.end(JSON.stringify(ack));
              });
            }
            else if (req.url.indexOf('/db') === 0) {
              dbg.log(req.headers);
              try {
                db.insertTrack({ date: Date.now(), req: req.headers });
              }
              catch (e) {
                dbg.error(e);
              }
            }
            else {
              // TODO (1) : i18n, parse browser language, redirect

              fileServer.serve(req, res);
              /*dbg.info(dbg.toStr(req.headers));
              dbg.log(err);
              dbg.log(result);
              dbg.error(err);
              res.writeHead(err.status, err.headers);
              res.end('<!DOCTYPE html><html><head><head><body>404 : ressource not found.</body></html>');*/
            }
          }
          else {
            console.error('no req.url');
            res.end();
          }

        })).resume();
      }
      /*  else if (req.method === 'POST') {
      
              req.on('data', function(data: string) {
                  jsonString += data;
                  if (jsonString.length > 1e6) {
                      jsonString = "";
                      res.writeHead(HttpStatusCode.PayloadTooLarge, {'Content-Type': 'text/plain'});
                      res.end();
                      req.abort();
                  }
              });
      
              req.on('end', function() {
                try {
                  let gist = JSON.parse(jsonString);
                  // do something with post data...
                }
                catch(e) {
                  logger.error(e);
                  logger.info(jsonString);
                  res.writeHead(HttpStatusCode.BadRequest, {'Content-Type': 'text/plain'});
                  res.end();
                }
              });
      
        } */
      else {
        dbg.error('Method not allowed ' + dbg.toStr(req.headers));
        res.writeHead(HttpStatusCode.MethodNotAllowed, { 'Content-Type': 'text/plain' });
        res.end();
      }

    }).listen(config.httpPort, config.httpIpAddress);

    dbg.log(Date() + ': Node server started on ' + config.httpIpAddress + ':' + config.httpPort);

    let wsOptions: wslib.ServerOptions = { server: server, clientTracking: false };

    let WebSocketServer = wslib.Server;

    let wss = new WebSocketServer(
      wsOptions, // TODO (2) : verify client
      function () {
        dbg.log('WS > listen callback ');
      });

    // TODO (2) : nodeObserver

    wss.on('connection', (ws: wsWebSocket) => {

      //let user: UserWrapper; // Hex ObjectId of the user owner of this session

      if (websocketProtocolVersion !== undefined && ws.protocol !== websocketProtocolVersion) {
        dbg.log('WS > bad protocol, closing ' + dbg.toStr(ws));
        ws.close();
        return;
      }

      if (wss.clients) {
        dbg.log('ws.onconnection > clients ' + wss.clients.size, LoggerParts.Filename);
      }
      else {
        dbg.warn('ws.onconnection > clients manager not enabled in wss');
      }

      ws.on('error', (e) => {
        dbg.log('WS ERROR' + e);
      });

      ws.on('close', (ws) => {
        dbg.log('WS CLOSE' + ws);
      });

      // TODO (2) : hearthbeat, 'ping' 'pong' see https://github.com/websockets/ws 

      // #IFDEF MEMORY_SESSIONS
      ws.once('message', (sessionId: string) => {

        dbg.log('ws.once auth > received: ' + sessionId);

        let candidateWsu = this.connectSession(ws, sessionId);

        if (candidateWsu === undefined) { // TODO if guest && not guest allowed
          dbg.log('ws > user session not found :' + sessionId + ', closing ws');

          // code 4000–4999 	  	Available for use by applications.
          ws.close((4000 + ToStringId.SessionError), JSON.stringify(ErrMsg.SessionError));
          return;
        }

        let wsu: UserSessionInterface = candidateWsu;

        ws.on('message', (message: wsWebSocket.Data) => {

          if (typeof message === 'string') {
            try {
              let c2s_m: c2s_ChannelMessage = JSON.parse(message)
              dbg.log('ws.onmessage > ' + message)
              // dispatch(user[ws.userID]) or ws.dispatch( ?=)
              this.dispatchWsCommand(c2s_m, wsu)
            }
            catch (e) {
              dbg.log('ws.onmessage > Error ' + e + ', closing ' + dbg.toStr(ws))
              // this.destroyWsSession(wsu.iId);
              ws.close()
            }
          }
          else {
            this.dispatchBinary(message, wsu)
          }
        })

        dbg.log('User  ' + wsu.userOptions.name + ' connected, sending UserGist')
        let ackUser: UserSessionAck = { type: MessageType.User, userOptions: wsu.userOptions }

        ws.send(JSON.stringify(ackUser), (err) => {
          if (err) {
            dbg.log('ws.once > ws.send err:' + err)
          }
        })
        dbg.log('sent  ' + JSON.stringify(ackUser))
      }) // auth once
      // #ENDIFDEF MEMORY_SESSIONS

      /* #IFDEF PERSISTOR_SESSIONS
        ws.once('message', function (sessionId: string) {
      
          dbg.log('ws.once auth > received: %s', sessionId);
      
          db.getUserFromSession(sessionId).then((userDocument) => {
      
            //  if (userSessionDao && userSessionDao[0] && userSessionDao[0]) {
            //    let userDocument = userSessionDao[0].userDoc[0];
      
            dbg.log('ok userDocument');
            dbg.log(userDocument);
            wsu = new WsSessionUser(ws, userDocument);
            wsUsers[wsu.iId] = wsu;
      
            ws.on('message', (message: string) => {
      
              try {
      
                let c2s_m: c2s_ChannelMessage = JSON.parse(message);
                dbg.log('ws.onmessage > ' + message);
                // dispatch(user[ws.userID]) or ws.dispatch( ?=)
                dispatchWsCommand(c2s_m, wsu);
      
              }
              catch (e) {
                dbg.log('ws.onmessage > Error ' + e + ', closing ' + toStr(ws));
                delete wsUsers[wsu.iId];
                ws.close();
              }
            });
      
            dbg.log('User  ' + userDocument.name + ' (' + userDocument.iId + ') connected, sending UserGist');
            let ackUser: UserSessionAck = { type: MessageType.User, name: userDocument.name };
      
            ws.send(JSON.stringify(ackUser), (err) => {
              if (err) {
                dbg.log('ws.once > send err:' + err);
              }
      
            });
            dbg.log('sent  ' + JSON.stringify(ackUser) + ', getting piloted...');
            return db.getPiloted(userDocument.iId);
            //  } else { dbg.log('ws > user session not found :' + sessionId + ', closing '); ws.close(); } 
      
          })
            .then((pilotedArray) => {
              dbg.log('pilotedArray :');
              dbg.log(pilotedArray);
      
              let zpg: PilotAck = { type: MessageType.ReqPilot, piloted: pilotedArray }
              ws.send(JSON.stringify(zpg));
      
            })
            .catch((e) => {
              dbg.error(e);
              dbg.log('catch > WS > Error in session:' + sessionId + ', closing ');
              ws.close();
            });
      
        }); // auth once
      #ENDIFDEF PERSISTOR_SESSIONS */

      // ws.send('who?');
    });
  }

  // TODO (3) : index 'hint' parameter ?
  getUserFromSession(sessionId: string): UserOptions | undefined {
    let userSession = this.userSessions[sessionId];

    if (userSession === undefined) {
      return; // throw ErrMsg.SessionError;
    }
    return userSession.userOptions;
  }

  connectSession(ws: wsWebSocket, sessionId: string): UserSessionInterface | undefined {

    let userSession = this.userSessions[sessionId]

    if (userSession === undefined) {
      console.log('connect guest session')
      userSession = new GuestUserSession()
    }

    userSession.connectWs(ws)

    return userSession
  }

  /*
    connectSession(ws: wsWebSocket, sessionId: string): UserSessionInterface | undefined {
  
      let userSession = this.userSessions[sessionId];
  
      if (userSession === undefined) {
        return; // throw ErrMsg.SessionError;
      }
  
      userSession.connectWs(ws);
  
      return userSession;
    } */

  /* disconnectWsSession(sessionId: string): void {
 
     let userSession = this.userSessions[sessionId];
 
     if (userSession === undefined) {
       dbg.error('disconnectSession > No session ' + sessionId);
       return; //throw ErrMsg.SessionError;
     }
 
     userSession.disconnectWs();
   } */

  unregisterSession(sessionId: SessionIdentifier) {

    if (this.userSessions[sessionId]) {
      delete this.userSessions[sessionId];
    }
    else {
      dbg.error('unregisterSession > No session ' + sessionId);
    }
  }


  // TODO (0) : replace callbacks by promises in all commands
  dispatchXCommand(jsonString: string, callback: (ack: s2c_ChannelMessage) => void): void {

    var cmd: c2s_ChannelMessage;
    var jsonString = decodeURIComponent(jsonString);
    dbg.log(jsonString);

    try {
      cmd = JSON.parse(jsonString);

      if (cmd.type === MessageType.Login) {
        let seq = new LoginSequence(this.db, this);
        seq.login(<XLoginRequest>cmd, callback);
      }
      else if (cmd.type === MessageType.SessionCheck) {
        this.syncSessionCheck((<SessionCheckRequest>cmd), callback);
      }
      else if (cmd.type === MessageType.Registration) {

        if (this.configuration.allowRegistration) {
          let seq = new RegistrationSequence(this.db, this.captchaSecret, this.configuration);
          seq.registration(<XRegistrationRequest>cmd, callback);
        }
        else {
          dbg.error('Unallowed registration from client');
          callback(ErrMsg.ServerError);
        }
      }
      else if (cmd.type === MessageType.ConfigureRegistration) {

        let xConfigureRegistrationAck: XConfigureRegistrationAck = {
          type: MessageType.ConfigureRegistration,
          allowRegistration: this.configuration.allowRegistration,
          doSendRegistrationMail: this.configuration.doSendRegistrationMail,
          doCheckCaptcha: this.configuration.doCheckCaptcha,
          doCheckInvitationCode: this.configuration.doCheckInvitationCode,
          doCheckPasswordStrength: this.configuration.doCheckPasswordStrength
        }
        callback(xConfigureRegistrationAck);
      }
      else {
        dbg.error('dispatchXCommand > Unknown type ' + cmd.type);
        callback(ErrMsg.UnkownCommand);
      }

    }
    catch (e) {

      if (e instanceof Error) {
        dbg.error('dispatchXCommand > Parse error ' + e.message );
      } else {
        dbg.error('dispatchXCommand > Error ' + e );
      }

      
      callback(ErrMsg.UnkownCommand);
    }
  }

  protected syncSessionCheck(cmd: SessionCheckRequest, callback: (ack: UserSessionAck | ErrorMessage) => void) {
    let sessionId = cmd.sessionId;
    dbg.log('session check ' + cmd.sessionId);
    let userDocument = this.getUserFromSession(sessionId);
    if (userDocument) {

      let sessionUserAck: UserSessionAck = {
        type: MessageType.User,
        userOptions: userDocument,
        // sessionId: 
      };

      if (cmd.doClose) {
        this.unregisterSession(sessionId);
        sessionUserAck.closed = true;
      }

      callback(sessionUserAck);
    }
    else {
      dbg.error('dispatchXCommand > user session not found');
      callback(<ErrorMessage>ErrMsg.SessionError);
    }
  }
}

/*
export abstract class AsyncDispatcher implements UserSessionAsyncManager {

  protected asyncSessionCheck(db: UserSessionAsyncManager, sessionId: string) {
     let userDocument = this.getUserFromSession((<SessionCheckRequest>cmd).sessionId);
     if (userDocument) {
       let sessionUserAck: UserSessionAck = {
         type: MessageType.User,
         name: userDocument.name
         // ,sessionId: undefined
       };
       callback(sessionUserAck);
     }
     else {
       dbg.error('dispatchXCommand > user session not found');
       callback(<s2c_ChannelMessage>{ type: MessageType.Error, toStringId: ToStringId.SessionError });
     } 

           db.getUserFromSession(sessionId)
               .then((userDocument) => {
                   // TODO (1) : refresh server's session expiration
                   let sessionUserAck: UserSessionAck = {
                       type: MessageType.User,
                       name: userDocument.name
                       // ,sessionId: undefined
                   };
   
                   callback(sessionUserAck);
               })
               .catch((err) => {
                   if (err && err.type === MessageType.Error) {
                       callback(err);
                   }
                   else { 
                       let err: ErrorMessage = { type: MessageType.Error, toStringId: ToStringId.ServerError };
                       callback(err);
                   }
               });

  }
}
*/




interface captchaResponse {
  success: true | false,
  challenge_ts: string,  // timestamp of the challenge load (ISO format yyyy-MM-dd'T'HH:mm:ssZZ)
  hostname: string,         // the hostname of the site where the reCAPTCHA was solved
  'error-codes'?: any[]        // optional
}

class RegistrationSequence {

  // TODO (2) : config from UserManager ?
  configuration: ConfigurationInterface

  constructor(protected userManager: UserAsyncManager, protected captchaSecret: string, config: ConfigurationInterface) {

    this.configuration = config

  }

  /* async registration(cmd: XRegistrationRequest, callback: (ack: UserSessionAck) => void) {
 
     dbg.log(" ---- start registration sequence ----");
 
     try {
       // await this.checkCaptcha(cmd.response);
       // await this.checkCode(code); // TODO : db.checkCode(code) and  get auth  then((arg ?))
       let userAck: UserSessionAck = await this.userManager.createUser(cmd);
       await this.sendRegistrationMail(cmd.mail);
       dbg.log(" ---- registration sequence done  ----");
       callback(userAck);
     }
     catch (e) {
       dbg.error(e);
       dbg.log(" ---- registration sequence failed  ----");
       callback(e);
 
     }
   } */

  registration(cmd: XRegistrationRequest, callback: (ack: UserSessionAck) => void) {

    dbg.log(" ---- start registration sequence ----");

    let userAck: UserSessionAck;

    this.checkCaptcha(cmd.captchaResponse)
      .then(() => {
        return this.checkCode(cmd.invitationCode);
      })
      .then(() => {
        return this.checkPasswordStrength(cmd.password);
      })
      .then(() => {
        return this.userManager.createUser(cmd);
      })
      .then((userData) => {
        dbg.log('then ' + userData);
        userAck = userData;
        return this.sendRegistrationMail(cmd.mail);
      })
      .then(() => {
        dbg.log(" ---- registration sequence done  ----");
        //callback({ type: MessageType.Registration, status: Status.Ok });
        dbg.log('send ');
        callback(userAck);
      })
      .catch((e) => {
        dbg.error(e);
        dbg.log(" ---- registration sequence failed  ----");
        callback(e);
      });
  }

  private checkCaptcha(response: string) {

    return new Promise<void>((resolve, reject) => {

      if (this.configuration.doCheckCaptcha) {

        dbg.log('Checking Captcha ');

        let postData = querystring.stringify({
          secret: this.captchaSecret,
          response: response
          //,remoteip: remoteIp, // optional
        });

        let postOptions = {
          hostname: 'www.google.com',
          path: '/recaptcha/api/siteverify',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
          }
        };

        dbg.log('POST https captcha request');
        dbg.log(postData);

        let req = https.request(postOptions, function (res) {

          dbg.log('statusCode:' + res.statusCode);

          // TODO (4) : check statusCode else resume ? 

          res.setEncoding('utf8');
          let rawData = '';
          res.on('data', (chunk: string) => { rawData += chunk; dbg.log('chunck ' + chunk); });
          res.on('end', (arg: any) => {

            dbg.log('end ' + arg);
            dbg.log(rawData);
            let captchAck: captchaResponse = JSON.parse(rawData);
            dbg.log(captchAck);
            if (captchAck.success === true) {
              resolve();
            }
            else {
              dbg.error('captcha failed');
              reject(ErrMsg.InvalidCaptcha);
            }
          });
        });
        req.write(postData);
        req.end();
        req.on('error', (e) => {
          dbg.error(e); // TODO (4) : req.resume ?
          reject(<s2c_ChannelMessage>{ type: MessageType.Error, toStringId: ToStringId.ServerError });
        });

      }
      else {
        dbg.log('Skip checking Captcha, configuration.doCheckCaptcha:' + this.configuration.doCheckCaptcha);
        resolve();
      }
    });
  } 

  private checkCode(code: string): Promise<void> {

    return new Promise<void>((resolve, reject) => {

      if (this.configuration.doCheckInvitationCode) {

        dbg.log('Checking invitation code ');

        if (isNaN(parseInt(code))) {
          dbg.info('checkCode > invalid code'); // TODO (5) : check code from database
          reject(ErrMsg.InvalidCode);
        }
        else {
          dbg.log('code ok');
          resolve();
        }
      }
      else {
        dbg.log('Skip checking invitation code, configuration.doCheckInvitationCode:' + this.configuration.doCheckInvitationCode);
        resolve();
      }
    });
  }

  private checkPasswordStrength(password: string): Promise<void> {

    return new Promise<void>((resolve, reject) => {

      if (this.configuration.doCheckPasswordStrength) {

        dbg.log('Checking password strength ');

        if (checkPasswordStrenght(password)) {
          dbg.log('password ok');
          resolve();
        }
        else {
          dbg.info('checkPasswordStrength > invalid code');
          reject(ErrMsg.WeakPassword);
        }
      }
      else {
        dbg.log('Skip checking pasword strength, configuration.doCheckPasswordStrength:' + this.configuration.doCheckPasswordStrength);
        resolve();
      }
    });
  }

  private sendRegistrationMail(dstMail: string) {

    dbg.log('Sending registration mail : ' + this.configuration.doSendRegistrationMail);

    return new Promise<void>((resolve, reject) => {

      if (typeof dstMail !== 'string') {  // TODO (1) : email checker
        dbg.info('sendRegistrationMail > invalid mail'); // TMP
        reject(ErrMsg.InvalidMail);
        return;
      }

      if (this.configuration.doSendRegistrationMail) {

        let password = Math.round(Math.random() * 10000).toString(); // TODO (1) : password generator

        let uri = this.configuration.mailServer + '?sec=' + encodeURIComponent(this.configuration.mailSecret)
          + '&dst=' + encodeURIComponent(dstMail)
          + '&kind=1&lang=1&pwd=' + encodeURIComponent(password);

        dbg.log(uri); // TMP

        // TODO (1) : https.request
        // var lib = uri.indexOf('https') === 0 ? https : http;

        http.get(uri, (res) => {
          // const statusCode = res.statusCode; // TODO (2) : statuscode
          res.setEncoding('utf8');
          var rawData = '';

          res.on('data', (chunk: string) => { rawData += chunk });
          res.on('end', () => {
            dbg.log(rawData);
            let mailAck = JSON.parse(rawData);
            dbg.log(mailAck);

            if (mailAck.status === 'ok') { // TODO (1) : public interface for mail send ack
              resolve();
            }
            else {
              dbg.error('sendmail failed');
              reject(mailAck);
            }
          });

        }).on('error', (e) => {
          dbg.error(e);
          reject(ErrMsg.ServerError);
        });
      }
      else {
        console.info('Skip sending registration mail');
        resolve();
      }
    });
  }
}

export class LoginSequence {

  constructor(protected userManager: UserAsyncManager, protected sessionManager: UserSessionSyncManager) { }

  login(cmd: XLoginRequest, callback: (ack: UserSessionAck) => void) {

    dbg.log(" ---- start login sequence ----");

    let userName: string;

    this.userManager.getUserFromLogin(cmd)
      .then((userDocument) => {
        userName = userDocument.name;

        // #IFDEF MEMORY_SESSIONS
        let userSession = this.sessionManager.createSession(userDocument);
        // #ENDIFDEF MEMORY_SESSIONS
        // #IFDEF PERSISTOR_SESSIONS
        /*                return db.generateSessionId(userDocument.iId); // TODO (1) : toHexString()
                    })
                    .then((sessionId) => { */
        // #ENDIFDEF PERSISTOR_SESSIONS
        let userSessionAck: UserSessionAck = { type: MessageType.User, userOptions: { name: userName }, sessionId: userSession.sessionId };
        dbg.log(' ---- login sequence done :' + userSession.sessionId + ' ----');
        dbg.log(userSessionAck);
        callback(userSessionAck);
      })
      .catch((e) => {
        dbg.error(e);
        dbg.log(" ---- login sequence failed  ----");
        callback(e);
      });
  }
}





