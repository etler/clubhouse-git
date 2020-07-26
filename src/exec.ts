import {exec} from 'child_process'

export default async function(command: string): Promise<{stdout: string, stderr: string}> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject({error, stdout, stderr})
      } else {
        resolve({stdout, stderr})
      }
    })
  })
}
