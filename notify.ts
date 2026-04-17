
const encoder = new TextEncoder()

const CHANIFY_TOKEN = process.env.CHANIFY_TOKEN!

export default async function(title: string, text: string){
    try {

        const data = { title, text }

        const req = await fetch(`https://api.chanify.net/v1/sender/${CHANIFY_TOKEN}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: encoder.encode(JSON.stringify(data))
        })

    }catch(e){
        console.error(e)
    }
}