import {Command, flags} from '@oclif/command'

export default class Start extends Command {
  static description = 'Create a git branch from a list of stories'

  static examples = [
    `$ chgit start`,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
  }

  async run() {
    const {args, flags} = this.parse(Start)
  }
}
