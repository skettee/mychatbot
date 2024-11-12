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

		// console.log(chatResponse.body)

		return new Response(chatResponse.body, {
			headers: {
				'Content-Type': 'text/event-stream'
			}
		})
        
    } catch(err) {
        console.error(err)
        return json({ error: 'There was an error processing your request' }, { status: 500 })
    }
}