// import path from 'path';
// import dotenv from 'dotenv';
// dotenv.config({ path: path.join('~/','.env') })

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

		const chatResponse = await fetch('https://api.anthropic.com/v1/messages', {
			headers: {
				'anthropic-version': '2023-06-01',
				'x-api-key': `${env.ANTHROPIC_API_KEY}`,
				'content-type': 'application/json',
				'anthropic-beta': 'pdfs-2024-09-25, prompt-caching-2024-07-31'
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
				case 400:
					message = 'There was an issue with the format or content of your request.'
					break
                case 401:
                    message = 'There\'s an issue with your API key.'
                    break
                case 403:
                    message = 'Your API key does not have permission to use the specified resource.'
                    break
				case 404:
					message = 'The requested resource was not found.'
					break
				case 413:
					message = 'Request exceeds the maximum allowed number of bytes.'
					break
                case 429:
                    message = 'Your account has hit a rate limit.'
                    break
                case 500:
                    message = 'An unexpected error has occurred internal to Anthropic\'s systems.'
                    break
                case 529:
                    message = 'Anthropic\'s API is temporarily overloaded.'
                    break
                default:
                    message = `${chatResponse.status} error: ${chatResponse.statusText}`
                    break
            }
            return new Response(`event: error\ndata:{"error": {"message": "${message}", "type": "${chatResponse.statusText}"}}\n\n`, {
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
