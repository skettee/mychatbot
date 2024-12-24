/** @type {import('@sveltejs/kit').PageServerLoad} */
export const load = async ({ locals: { supabase, user } }) => {
    const { data: workflows } = await supabase.from('workflows').select('id, name, desc, user_id').limit(100).order('created_at')
    if( user ) {
        const { data: member } = await supabase.from('members').select('id, user_id, name, profile, workflow').eq('user_id', user.id)
        if( !member[0] ) {
            const { data: newMember } = await supabase.from('members').insert({ user_id: user.id, name: 'User'}).select()
            return { workflows: workflows ?? [], member: newMember ?? [] }
        }
        return { workflows: workflows ?? [], member: member ?? [] }
    }
    return { workflows: workflows ?? [], member: [] }
}