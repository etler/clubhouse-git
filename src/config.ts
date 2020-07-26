import * as Configstore from 'configstore'

type Config = {
  token: string
}

type PackageJson = {
  name: string
}

const packageJson: PackageJson = require('../package.json')
const configDefaults: Config = {token: ''}
const config: Configstore = new Configstore(packageJson.name, configDefaults)

export default config
