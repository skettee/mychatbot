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

        const model = requestBody.model

        const generateContent = requestBody.generateContent

		const chatResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${env.GEMINI_API_KEY}`, {
			headers: {
                'Content-Type': 'application/json',
			},
			method: 'POST',
			body: JSON.stringify(generateContent)
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