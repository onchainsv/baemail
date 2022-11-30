
//import * as nimble from '@runonbitcoin/nimble'

const nimble = require('@runonbitcoin/nimble')

interface InvisibleMoneyButton {   
  swipe: Function;
}

interface Message {

}

interface CryptoOperation {
  name: string;
  method: string;
  data: string;
  dataEncoding: string;
  key: string;
  algorithm: string;
  paymail?: string;
}

interface CreateMessage {
  imb: InvisibleMoneyButton;
  to: string;
  fromName: string;
  fromPaymail: string;
  fromPki: string;
  subject: string;
  html: string;
  amount: number;
}

export async function createMessage (params: CreateMessage): Promise<Message> {

  const { amount, html, to, subject, fromName, fromPaymail, fromPki, imb } = params

    try {
        const numount = Number(amount)
        const strimount = String(amount)
        const baemail = {body: {time: Date.now(), blocks: html, version: '3.0.0'}}
        const dataToEncrypt = JSON.stringify(baemail)
        const baemailData = JSON.stringify({
            summary: 'Baemail',
            amountUsd: numount,
            to: to,
            cc: [],
            subject: subject,
            salesPitch: '',
            from: {
                name: fromName,
                primaryPaymail: fromPaymail,
                pki: fromPki
            }
        })

        const biscuit = nimble.functions.sha256(Buffer.from('1BAESxZMweg2mG4FG2DEZmB1Ury2ruAr9K' + baemailData)).toString('hex')
        let cryptoOperations: CryptoOperation[] = [
            {
                name: 'mySignature',
                method: 'sign',
                data: biscuit,
                dataEncoding: 'utf8',
                key: 'identity',
                algorithm: 'bitcoin-signed-message'
            }
        ]

        cryptoOperations.push({
            name: 'baemailData',
            method: 'encrypt',
            paymail: 'baemail@moneybutton.com',
            data: baemailData,
            dataEncoding: 'utf8',
            key: 'identity',
            algorithm: 'electrum-ecies'
        })

        cryptoOperations.push({
            name: 'privateBaemail',
            method: 'encrypt',
            paymail: fromPaymail,
            data: dataToEncrypt,
            dataEncoding: 'utf8',
            key: 'identity',
            algorithm: 'electrum-ecies'
        })


        cryptoOperations.push({
            name: 'privateSent',
            method: 'encrypt',
            paymail: to,
            data: dataToEncrypt,
            dataEncoding: 'utf8',
            key: 'identity',
            algorithm: 'electrum-ecies'
        })

        const response = await imb.swipe({
            cryptoOperations: cryptoOperations
        })

        let OP_RETURN = ['1BAESxZMweg2mG4FG2DEZmB1Ury2ruAr9K']
        OP_RETURN.push(response.cryptoOperations.find((x: any) => x.name === 'baemailData').value)
        OP_RETURN.push(response.cryptoOperations.find((x: any) => x.name === 'privateBaemail').value)
        OP_RETURN.push(response.cryptoOperations.find((x: any) => x.name === 'privateSent').value)
        OP_RETURN.push('|', '15igChEkUWgx4dsEcSuPitcLNZmNDfUvgA', biscuit, response.cryptoOperations.find((x: any) => x.name ==='mySignature').value, fromPki, fromPaymail)

        let outputs = []
        outputs.push({
            script: nimble.Script.buildSafeDataOut(OP_RETURN).toASM(),
            amount: '0',
            currency: 'USD'
        })
        outputs.push({
            to: to,
            amount: strimount,
            currency: 'USD'
        })
        outputs.push({
            to: '1BaemaiLK15EnJyFEhwLbrYJmRjqYoBMTe',
            amount: '0.01',
            currency: 'USD'
        })
        return {
            outputs: outputs,
            buttonData: baemailData
        }
    } catch (error) {

      console.error('baemail.buildMessage.error', error)

      throw error
    }
}

