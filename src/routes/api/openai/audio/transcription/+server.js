import { env } from '$env/dynamic/private'
import { json } from '@sveltejs/kit'

export async function POST({request}) {

    const requestData = await request.formData()

    if(!requestData) {
        throw new Error("No request data")
    }

    // console.log(requestData)
    
    const audioResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
			headers: {
                Authorization: `Bearer ${env.OPENAI_API_KEY}`
			},
			method: 'POST',
			body: requestData
    })
    // console.log('response: ', audioResponse)

    const transcription = await audioResponse.json()
    if (audioResponse.ok) {
        // console.log(memory)
        return json(transcription) // Json Response
    }

    return {
        status: audioResponse.status,
        error: new Error('Could not get transcription')
    }
}