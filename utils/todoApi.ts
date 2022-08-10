import axios, { AxiosInstance } from 'axios'
import { ApiCacher } from './apiCacher'

export class TodosApi {
    private apiInstance:AxiosInstance

    private apiCacher:ApiCacher

    constructor() {
        this.apiInstance = axios.create({
            baseURL: 'https://jsonplaceholder.typicode.com/todos',
            responseType: 'json',
            timeout: 120000,
            headers: {
                'Accept-Encoding': 'gzip',
                'Access-Control-Allow-Origin': "*"
            }
        })
        this.apiCacher = new ApiCacher();
    }

    get instance() {
        return this.apiInstance
    }

    async getTodo(todoId: string) {
        try {
            const queryString = `/${todoId}`
            const response = await this.apiCacher.fetchApiData(queryString, async () => 
                this.apiInstance.get(queryString,{ params: { }})
            )
            
            return response
        }
        catch(err) {
            throw new Error(`Failed to get todo:, ${todoId}, 'error:', ${err}`)
        }

    }

}

const todosApi = new TodosApi()
export default todosApi