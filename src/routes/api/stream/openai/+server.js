import { env } from '$env/dynamic/private'
import { json } from '@sveltejs/kit'

export const POST = async({request}) => {
    try {
        const requestData = await request.json()

        if(!requestData) {
            throw new Error("No request data")
        }

        const requestBody = requestData.body
        if(!requestBody) {
            throw new Error("No messages provided")
        }

        // console.log(requestMessages)

		const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
			headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${env.OPENAI_API_KEY}`
			},
			method: 'POST',
			body: JSON.stringify(requestBody)
		})

		// console.log(chatResponse)

        if(chatResponse.ok) {
            return new Response(chatResponse.body, {
                headers: {
                    'Content-Type': 'text/event-stream'
                }
            })
        }
        else {
            let message = ''
            switch(chatResponse.status) {
                case 401:
                    message = 'The requesting API key is not correct.'
                    break
                case 403:
                    message = 'You are accessing the API from an unsupported country, region, or territory.'
                    break
                case 429:
                    message = 'You have run out of credits or hit your maximum monthly spend.'
                    break
                case 500:
                    message = 'The server had an error while processing your request.'
                    break
                case 503:
                    message = 'The engine is currently overloaded, please try again later.'
                    break
                default:
                    message = `${chatResponse.status} error: ${chatResponse.statusText}`
                    break
            }
            return new Response(`event: error\ndata:{"error": {"message": "⚠️ ${message}", "type": "${chatResponse.statusText}"}}\n\n`, {
                headers: {
                    'Content-Type': 'text/event-stream'
                }
            })
        }
    } catch(err) {
        console.error(err)
        return json({ error: 'There was an error processing your request' }, { status: 500 })
    }
}
