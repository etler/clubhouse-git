import {Command, flags} from '@oclif/command'

export default class Review extends Command {
  static description = 'Start a pull request for the story linked to the current branch'

  static examples = [
    `$ chgit review`,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
  }

  async run() {
    const {args, flags} = this.parse(Review)
  }
}
