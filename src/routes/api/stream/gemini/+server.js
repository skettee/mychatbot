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
					message = 'The request body is malformed.'
					break
                case 403:
                    message = 'Your API key doesn\'t have the required permissions.'
                    break
				case 404:
					message = 'The requested resource wasn\'t found.'
					break
                case 429:
                    message = 'You\'ve exceeded the rate limit.'
                    break
                case 500:
                    message = 'An unexpected error occurred on Google\'s side.'
                    break
                case 503:
                    message = 'The service may be temporarily overloaded or down.'
                    break
                case 504:
                    message = 'The service is unable to finish processing within the deadline.'
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