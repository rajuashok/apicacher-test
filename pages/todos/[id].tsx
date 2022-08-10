import { GetStaticPaths, GetStaticProps } from "next";
import todosApi from "../../utils/todoApi";
import fs from 'fs'
import ids from '../../utils/ids.json'



const Page =({data}) => {

    return (
        <div>
            <pre>
                    {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    )
}

export default Page

export const getStaticProps:GetStaticProps = async (context) => {
    const id = context.params.id.toString().match(/\d+/g)[0]
    const data = await todosApi.getTodo(id)
     
    return {
        props: {
            data
        }
    }
}

export const getStaticPaths:GetStaticPaths = () => {

    const numbers:string[] = []

    for(let i = 100; i < 200; i++) {
        numbers.push(i.toString())
    }
    
    const numbersToWrite = JSON.stringify(numbers, null, 2)

    fs.writeFile('./utils/ids.json', numbersToWrite, (err) => {
        err ? console.error(err) : console.log('numbers written to json')
    }) 


    return {
        paths: ids.map((id) => {
            return {  
                params: {
                    id: id
                }
              }
        }),
        fallback: true
    }
}