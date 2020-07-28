import {Command, flags} from '@oclif/command'
import * as inquirer from 'inquirer'
import Clubhouse from 'clubhouse-lib'

import config from '../config'
import exec from '../exec'

const token: string = config.get('token')
const branchFormat: string = config.get('branchFormat')
const mentionName: string = config.get('mentionName')
const client = Clubhouse.create(token)

type StoryOptions = {all: boolean, owned: boolean, unowned: boolean, iteration: boolean, search: string | undefined}

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
    search: flags.string({char: 's'}),
    all: flags.boolean({char: 'a'}),
    owned: flags.boolean({char: 'o'}),
    unowned: flags.boolean({char: 'u'}),
    iteration: flags.boolean({char: 'i'}),
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

  async getStories(owner: string, {all, owned, unowned, iteration, search}: StoryOptions) {
    // Set default values
    if ((all ?? owned ?? unowned ?? iteration ?? search) === undefined) {
      owned = true
      unowned = false
      iteration = true
    } else if (all === true) {
      owned = owned ?? true
      unowned = unowned ?? true
      iteration = iteration ?? false
    } else if (iteration === true && (owned ?? unowned) === undefined) {
      owned = owned ?? true
      unowned = unowned ?? true
    }
    owned = owned ?? false
    unowned = unowned ?? false
    iteration = iteration ?? false

    const iterationsPromise = iteration === true ? client.listIterations() : undefined
    const ownedStorySearchPromise = owned ? client.searchStories(`is:unstarted owner:${owner}`) : undefined
    const unownedStorySearchPromise = unowned ? client.searchStories(`is:unstarted !has:owner`) : undefined
    const customStorySearchPromise = search ? client.searchStories(`is:unstarted ${search}`) : undefined
    const [iterations, ownedStorySearch, unownedStorySearch, customStorySearch] =
      await Promise.all(
        [iterationsPromise, ownedStorySearchPromise, unownedStorySearchPromise, customStorySearchPromise]
      )

    const ownedStories = ownedStorySearch?.data ?? []
    const unownedStories = unownedStorySearch?.data ?? []
    const customStories = customStorySearch?.data ?? []
    const stories = (() => {
      if (customStories.length && (ownedStories.length || unownedStories.length)) {
        const customStoryIds = customStories.map(({id}) => id)
        return [...ownedStories, ...unownedStories].filter(({id}) => customStoryIds.includes(id))
      } else if (customStories.length) {
        return customStories
      } else {
        return [...ownedStories, ...unownedStories]
      }
    })()
    const currentIterationsIds = iterations?.filter(
      (iteration) => iteration.status === 'started').map(({id}) => id
    )
    if (currentIterationsIds === undefined) {
      return stories
    } else {
      return stories.filter(
        ({iteration_id}) => iteration_id ? currentIterationsIds.includes(iteration_id) : false
      )
    }
  }
}
