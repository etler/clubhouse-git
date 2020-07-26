import {Command, flags} from '@oclif/command'
import * as inquirer from 'inquirer'
import Clubhouse from 'clubhouse-lib'

import config from '../config'
import exec from '../exec'

const token: string = config.get('token')
const branchFormat: string = config.get('branchFormat')
const mentionName: string = config.get('mentionName')
const client = Clubhouse.create(token)

export default class Start extends Command {
  static description = 'Create a git branch from a list of stories'

  static examples = [
    `$ chgit start`,
  ]

  static args = [
    {name: 'title'}
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    all: flags.boolean({char: 'a'})
  }

  async run() {
    const {args, flags} = this.parse(Start)

    const currentMember = await client.getCurrentMember()
    const owner = currentMember.mention_name

    const stories = await this.getStories(owner, flags)
    const storyChoices = stories.map(
      ({name, id}) => ({name: `[${id}] ${name}`, value: id})
    )

    if (storyChoices.length === 0) {
      console.log('No unstarted stories found')
      return
    }

    let responses: any = await inquirer.prompt([{
      name: 'story',
      message: 'Select a story to start',
      type: 'list',
      choices: storyChoices,
    }])

    const selectedStoryId = responses.story
    const selectedStory = stories.find(story => story.id === selectedStoryId)!

    const sanitizeString = (string: string) => {
      const maxLength = 50
      const sanitized = string.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
      if (sanitized.length > maxLength) {
        return sanitized.slice(0, 50).replace(/-\w*$/, '')
      } else {
        return sanitized
      }
    }

    const branchNameOwner = sanitizeString(owner)
    const branchNameStoryId = `ch${selectedStory.id.toString()}`
    const branchNameStoryType = selectedStory.story_type
    const defaultBranchNameStoryName = sanitizeString(selectedStory.name)

    const {inputBranchNameStoryName}: {inputBranchNameStoryName: string} = await inquirer.prompt([{
      name: 'inputBranchNameStoryName',
      message: 'Branch Story Name:',
      type: 'input',
      default: defaultBranchNameStoryName,
    }])

    const branchNameStoryName = sanitizeString(inputBranchNameStoryName)

    const branchName = branchFormat
      .replace('[owner_username]', branchNameOwner)
      .replace('[story_id]', branchNameStoryId)
      .replace('[story_type]', branchNameStoryType)
      .replace('[story_name]', branchNameStoryName)

    console.log(`Creating branch: ${branchName}`)

    const { stdout: stdoutCheckout, stderr: stderrCheckout } = await exec(`git checkout -b ${branchName}`)
    console.log(stdoutCheckout, stderrCheckout)
    const { stdout: stdoutPush, stderr: stderrPush } = await exec(`git push -u`)
    console.log(stdoutPush, stderrPush)
  }

  async getStories(owner: string, {all}: {all: boolean}) {
    const iterationsPromise = client.listIterations()
    const storySearchPromise = client.searchStories(`is:unstarted owner:${owner}`)
    const [iterations, storySearch] = await Promise.all([iterationsPromise, storySearchPromise])
    const stories = storySearch.data
    if (all === true) {
      return stories
    }
    const currentIterationsIds = iterations.filter(
      (iteration) => iteration.status === 'started').map(({id}) => id
    )
    const currentStories = stories.filter(
      ({iteration_id}) => iteration_id ? currentIterationsIds.includes(iteration_id) : false
    )
    return currentStories
  }
}
