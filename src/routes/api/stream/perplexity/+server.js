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

		const chatResponse = await fetch('https://api.perplexity.ai/chat/completions', {
			headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${env.PERPLEXITY_API_KEY}`
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
