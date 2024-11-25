import { env } from '$env/dynamic/private'

export const POST = async({request}) => {
    try {
        const requestBody = await request.json()
        if(!requestBody) {
            throw new Error("No request body")
        }

        // console.log(requestBody)

		const speechResponse = await fetch('https://api.openai.com/v1/audio/speech', {
			headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${env.OPENAI_API_KEY}`
			},
			method: 'POST',
			body: JSON.stringify(requestBody)
		})

        const speech = await speechResponse.blob()
        return new Response(speech)

    } catch(err) {
        console.error(err)
    }
}