import fs from 'fs'

export class ApiCacher {
  /**
   * @returns - A date string, such as: "2022-06-15"
   */
  getTimestamp() {
    const timestampNow = new Date()
    const timestampDate = timestampNow.toLocaleString('en-US', {
      timeZone: 'America/Los_Angeles',
      dateStyle: 'short'
    })
    const dateArray = timestampDate.split('/')
    const isoDate = `20${dateArray[2]}-${
      dateArray[0].length < 2 ? '0' + dateArray[0] : dateArray[0]
    }-${dateArray[1]}`
    return isoDate
  }

  /**
   * @param fileName - The whole file name of a cache file, such as: "api_sports_team_408_2022-06-16.json"
   * @returns - The date string in the file name.
   */
  getTimestampInCache(fileName: string) {
    const nameArray = fileName.split('.')[0].split('_')
    return nameArray[nameArray.length - 1]
  }

  routeStringToPathName(route: string) {
    const fileName = route.replace(/[\W_]/g, '_')
    const pathName = `.next/cache/${fileName.slice(1)}.json`
    return pathName
  }

  /**
   * @returns - A prefix for the to-be-created cache file, such as "api_sports_team_408"
   */
  routeStringToFilePrefix(route: string) {
    const fileName = route.replace(/[\W_]/g, '_')
    return fileName.slice(1)
  }

  /**
   *
   * @param prefix - A prefix of a cache file, such as "api_sports_team_408"
   * @returns - `null` or the whole file name: "api_sports_team_408_2022-06-16.json"
   */
  fileExists(prefix: string): string {
    let file = ''
    
    const files = fs.readdirSync('.next/cache/')
    file += files.find((f) => f.startsWith(prefix))

    return file
  }

  async readFile(fileName: string) {
    return new Promise((resolve, reject) => {
      fs.readFile(`.next/cache/${fileName}`, 'utf8', (error, data) => {
        if (error) {
          reject(error)
        }
        resolve(JSON.parse(data))
      })
    })
  }

  async writeFile(filePrefix: string, data: any) {
    const dataToWrite = JSON.stringify(data)

    // Add a date string when created a cache file
    const timestamp = this.getTimestamp()
    const path = `.next/cache/${filePrefix}_${timestamp}.json`

    await fs.writeFile(path, dataToWrite, (err) => {
      err ? console.error(err) : console.log('files saved to json: ', path)
    })
  }

  async generateCacheFile(prefix: string, callbackFn: any, reqStr: string) {
    try {
      const res = await callbackFn()
      const result = res.data
      await this.writeFile(prefix, result)
      return result
    } catch (e) {
      throw new Error(
        `Failed to fetch API Data with requestString: ${reqStr}, error: ${e}`
      )
    }
  }

  async fetchApiData(requestString, callback) {
    const filePrefix = this.routeStringToFilePrefix(requestString)

    if (
      this.fileExists(filePrefix)) {
      const timestampInCache = this.getTimestampInCache(
        this.fileExists(filePrefix)
      )
      const timestampNow = this.getTimestamp()
      
      if (timestampInCache === timestampNow) {
        const fileReturned = await this.readFile(this.fileExists(filePrefix))
        console.log(`file with ${filePrefix} exists:`, fileReturned)
        return fileReturned
      }
    } else if (!this.fileExists(filePrefix)) {
      //this is being logged despite fileExists() logging showing that it's finding the files so what gives??
      console.log(
        'file with prefix',
        filePrefix,
        'does not exist. writing file now...'
      )

      return await this.generateCacheFile(filePrefix, callback, requestString)
    }
  }
}
