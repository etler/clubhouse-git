import {Command, flags} from '@oclif/command'
import * as inquirer from 'inquirer'
import Clubhouse from 'clubhouse-lib';

import config from '../config'

const promptToken = async () => {
  const existingToken: string = config.get('token')

  if (existingToken !== '') {
    const {updateToken} = await inquirer.prompt([{
      name: 'updateToken',
      message: 'Update API token?',
      type: 'confirm'
    }])
    if (!updateToken) {
      return existingToken
    }
  }

  const {token}: {token: string} = await inquirer.prompt([{
    name: 'token',
    message: 'Input Clubhouse API token',
    type: 'input',
  }])

  config.set('token', token)

  return token
}

export default class Setup extends Command {
  static description = 'Setup your clubhouse token'

  static examples = [
    `$ chgit setup`,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
  }

  async run() {
    const token = await promptToken()
    const client = Clubhouse.create(token)
    const currentMember = await client.getCurrentMember()
    console.log(`Successfully authenticated ${currentMember.name} (${currentMember.mention_name})`)
  }
}
