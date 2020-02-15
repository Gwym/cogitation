import { AsyncPersistor, UserDao } from "../services/persistor";
import { XLoginRequest, XRegistrationRequest, UserSessionAck, UserOptions, MessageType, ErrMsg } from "../services/shared/messaging";
import { dbg } from "../services/logger";
import { CollectionId } from "./concept";
import { UserSession } from "../services/dispatcher";


export class MemoryPersistor extends AsyncPersistor {


    //private dbConnection?: Db
    private tracks?: any[]
    private sessions?: any[]
    private users?: any[]

 

    getNow() {
        // TODO (0) : store/load timestamp at shutdown/failed
        return Date.now()
    }

    insertTrack(track: any) {
        if (this.tracks) {
            this.tracks.push(track)
        }
        // TODO (2) : else { connexion pending, store to memory }
    }

    getUserFromLogin(_cmd: XLoginRequest): Promise<UserDao> {

        return new Promise<UserDao>((resolve, _reject) => {

            let userDao: UserDao = {
                iId: '0',
                name: 'Guest'
            }
            resolve(userDao)           
        })
    }

    createUser(userReg: XRegistrationRequest): Promise<UserSessionAck> {

        // TODO (1) : if (credential.expiration <= Date.now() ) or  {credential.expiration: {$lt: Date.now()} }
        //  return this.users.findOneAndReplace({ invitationCode: userReg.code }, { mail: userReg.mail })

        // TODO (2) : checkPasswordStrenght()

        return new Promise<UserSessionAck>((resolve, _reject) => {

          
                    interface UserPrivateDocument extends UserOptions {
                        mail: string
                    }
                    let userDocument: UserPrivateDocument = {
                        name: userReg.name,
                        mail: userReg.mail
                    }

                    // TODO (5) : search, duplicate detection

                    dbg.log('createUser > OK ' + userDocument)
                    let userAck: UserSessionAck = { type: MessageType.User, userOptions: { name: userDocument.name } }
                    resolve(userAck)

                    /*

                    // TODO (1) : check invitation code, reject(ErrMsg.InvalidCode)
                    //  this.users.findOneAndReplace({ invitationCode: userReg.code }, { mail: userReg.mail }, (err, res) => {

                    this.users.insertOne(userDocument, (err, res) => {
                        if (err === null && res.result.ok && res.insertedCount === 1) {
                            dbg.log('createUser > OK ' + userDocument)
                            let userAck: UserSessionAck = { type: MessageType.User, userOptions: { name: userDocument.name } }
                            resolve(userAck)
                        }
                        else {
                            dbg.log(err)

                            // FIXME (4) : typings problem ? err should be a WriteError, not a MongoError for insertOne operation
                            // https://docs.mongodb.com/manual/reference/method/db.collection.insertOne/
                            // example : { WriteError({"code":11000,"index":0,"errmsg":"E11000 duplicate key error collection: yenah.users index: name_1 dup key: { : \"test\" }","op":{"name":"test","mail":"test@test.fr","hash":"$2a$04$rgeUX7eSraGrtaW7S1Lp0O/0XR9Wya0K5.vuv.kFlIsJGoGcz0DMm","_id":"59589321bed74e09da709bcc"}})
                            if (err.code === 11000) {

                                if ((<WriteError><any>err).errmsg.indexOf('index: name') !== -1) {
                                    reject(ErrMsg.DuplicateName)
                                    return
                                }
                                else if ((<WriteError><any>err).errmsg.indexOf('index: mail') !== -1) {
                                    reject(ErrMsg.DuplicateMail)
                                    return
                                }
                            }

                            dbg.error(err)

                            reject(ErrMsg.DatabaseError)
                        }
                    })*/
              


        })
    }

   




    adminDropCollections(collectionsToDrop: CollectionId[]) {

        // TODO (0) :  options { sessions: true, cells: true ... }
        // TODO (1) : disconnect users
        // this.users.drop() 
        if (this.sessions && collectionsToDrop.indexOf(CollectionId.Session) !== -1) {
            this.sessions = []
        }
        if (this.users && collectionsToDrop.indexOf(CollectionId.User) !== -1) {
            this.users = []
        }
    }


    adminGetInformation(_user: UserSession): void {

     /*   dbg.admin('AdminGetInformation ' + user.userOptions.name)

        let info: BaseAdminInformations = {
            type: MessageType.Admin,
            tracks: 0,
            sessions: 0,
            users: 0
        }

        let results: Promise<number>[] = []

       

        if (this.tracks) {
            results.push(this.tracks.count({}))
        }
        if (this.sessions) {
            results.push(this.sessions.count({}))
        }
        if (this.users) {
            results.push(this.users.count({}))
        }

        Promise.all(results).then(values => {

            info.tracks = values[0]
            info.sessions = values[1]
            info.users = values[2]

            dbg.log('AdminGetInformation > ')

            user.send(info)
        }).catch(reason => {
            user.send(reason)
        }) */
    }

    adminCreateUserInvitation(user: UserSession) {

        dbg.admin('adminCreateUserInvitation ' + user.userOptions.name)

        user.send(ErrMsg.UnkownCommand)
        /*


        new Promise<number>((resolve, reject) => {

        }).then(
            
            user.send({}})
        }).catch(reason => {
            user.send({}})
        }) */
    }


}