clubhouse-git
=============



[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/clubhouse-git.svg)](https://npmjs.org/package/clubhouse-git)
[![Downloads/week](https://img.shields.io/npm/dw/clubhouse-git.svg)](https://npmjs.org/package/clubhouse-git)
[![License](https://img.shields.io/npm/l/clubhouse-git.svg)](https://github.com/etler/clubhouse-git/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g clubhouse-git
$ chgit COMMAND
running command...
$ chgit (-v|--version|version)
clubhouse-git/0.0.0 linux-x64 node-v12.16.2
$ chgit --help [COMMAND]
USAGE
  $ chgit COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`chgit hello [FILE]`](#chgit-hello-file)
* [`chgit help [COMMAND]`](#chgit-help-command)

## `chgit hello [FILE]`

describe the command here

```
USAGE
  $ chgit hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ chgit hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/etler/clubhouse-git/blob/v0.0.0/src/commands/hello.ts)_

## `chgit help [COMMAND]`

display help for chgit

```
USAGE
  $ chgit help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.3/src/commands/help.ts)_
<!-- commandsstop -->
