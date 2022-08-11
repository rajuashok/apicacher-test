import fs from 'fs'

export class ApiCacher {
  /**
   * @returns - A date string, such as: "2022-06-15"
   */
  getTodayDate() {
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
  getCacheFileDate(fileName: string) {
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
  async getFileWithPrefix(prefix: string): Promise<string> {
    let promise = new Promise<string>((resolve, reject) => {
      fs.readdir('.next/cache/', (err, files) => {
        if (err) {
          console.warn("No cache file found", err)
          resolve(null)
        }

        const foundFile = files.find((f) => f.startsWith(prefix))
        return resolve(foundFile)
      })
    })

    return promise
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
    console.log(data)

    // Add a date string when created a cache file
    const timestamp = this.getTodayDate()
    const path = `.next/cache/${filePrefix}_${timestamp}.json`
    console.log("WRiting File")

    await fs.writeFile(path, dataToWrite, (err) => {
      err ? console.error(err) : console.log('files saved to json: ', path)
    })
  }

  async generateCacheFile(prefix: string, callbackFn: any, reqStr: string) {
    try {
      console.log("generate cache file")
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

    const fileName = await this.getFileWithPrefix(filePrefix);
    if (fileName != null) {
      const cacheFileDate = this.getCacheFileDate(fileName)
      const todayDate = this.getTodayDate()

      if (cacheFileDate === todayDate) {
        const fileReturned = await this.readFile(fileName)
        // console.log(`file with ${filePrefix} exists:`, fileReturned)
        return fileReturned
      }
    } else if (!this.getFileWithPrefix(filePrefix)) {
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
