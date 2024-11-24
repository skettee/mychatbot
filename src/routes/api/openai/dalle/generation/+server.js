import { env } from '$env/dynamic/private'
import { json } from '@sveltejs/kit'

export const POST = async({request}) => {
    try {
        const requestBody = await request.json()
        if(!requestBody) {
            throw new Error("No request body")
        }

        // console.log(requestBody)

		const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
			headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${env.OPENAI_API_KEY}`
			},
			method: 'POST',
			body: JSON.stringify(requestBody)
		})


        const image = await imageResponse.json()
        if (imageResponse.ok) {
            return json(image) // Json Response
        }
    
        return {
            status: imageResponse.status,
            error: new Error('Could not generate image')
        }

    } catch(err) {
        console.error(err)
        return json({ error: 'There was an error processing your request' }, { status: 500 })
    }
}