import {Command, flags} from '@oclif/command'
import * as inquirer from 'inquirer'
import Clubhouse from 'clubhouse-lib'

import config from '../config'

export default class Setup extends Command {
  static description = 'Setup your clubhouse token'

  static examples = [
    `$ chgit setup`,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
  }

  async run() {
    const token = await this.promptToken()
    const client = Clubhouse.create(token)
    const currentMember = await client.getCurrentMember()
    await this.promptBranchFormat()
    console.log(`Successfully authenticated ${currentMember.name} (${currentMember.mention_name})`)
  }

  async promptBranchFormat() {
    const existingBranchFormat: string = config.get('branchFormat')

    if (existingBranchFormat !== '') {
      const {updateBranchFormat} = await inquirer.prompt([{
        name: 'updateBranchFormat',
        message: `Update branch format? (${existingBranchFormat})`,
        type: 'confirm',
        default: false,
      }])
      if (!updateBranchFormat) {
        return existingBranchFormat
      }
    }

    const customFormatString = 'Custom Format'

    const {branchFormat}: {branchFormat: string} = await inquirer.prompt([{
      name: 'branchFormat',
      message: 'Choose branch format',
      type: 'list',
      choices: [
        '[owner_username]/[story_id]/[story_name]',
        '[owner_username]-[story_id]-[story_name]',
        '[story_type]/[owner_username]/[story_id]',
        '[story_type]/[story_id]/[story_name]',
        '[story_type]/[story_id]',
        '[story_id]',
        customFormatString,
      ],
    }])

    if (branchFormat === customFormatString) {
      const {customBranchFormat}: {customBranchFormat: string} = await inquirer.prompt([{
        name: 'customBranchFormat',
        message: 'Custom branch format:',
        type: 'input',
        validate: (input) => {
          if (input.includes('[story_id]')) {
            return true
          } else {
            return 'Custom branch format must include [story_id]'
          }
        }
      }])
      config.set({branchFormat: customBranchFormat})
      return customBranchFormat
    }

    config.set({branchFormat})
    return branchFormat
  }

  async promptToken() {
    const existingToken: string = config.get('token')

    if (existingToken !== '') {
      const {updateToken} = await inquirer.prompt([{
        name: 'updateToken',
        message: 'Update API token?',
        type: 'confirm',
        default: false,
      }])
      if (!updateToken) {
        return existingToken
      }
    }

    const {token}: {token: string} = await inquirer.prompt([{
      name: 'token',
      message: 'Clubhouse API token:',
      type: 'password',
    }])

    config.set({token})
    return token
  }
}
