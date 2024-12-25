import { redirect } from '@sveltejs/kit'

const OAUTH_PROVIDERS = ['github', 'discord']

/** @type {import('@sveltejs/kit').Actions} */
export const actions = {
  signup: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData()
    const email = formData.get('email')
    const password = formData.get('password')

    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      console.error(error)
      redirect(303, '/auth/error')
    } else {
      redirect(303, '/')
    }
  },
  login: async ({ request, url, locals: { supabase } }) => {
    const provider = url.searchParams.get('provider')
    if( provider ) {
      if( !OAUTH_PROVIDERS.includes(provider) ) {
        console.error('Invalid provider')
        redirect(303, '/auth/error')
        return
      }

      const { data, error } = await supabase.auth.signInWithOAuth(
        { 
          provider,
          options: {
          redirectTo: 'http://localhost:3001/auth/callback',
          } 
        })
      if (error) {
        console.error(error)
        redirect(303, '/auth/error')
      } else {
        redirect(303, data.url)
      }
      return
    }
    const formData = await request.formData()
    const email = formData.get('email')
    const password = formData.get('password')

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      console.error(error)
      redirect(303, '/auth/error')
    } else {
      redirect(303, '/')
    }
  },
}