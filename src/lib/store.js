import { writable } from 'svelte/store';

export const chatMessages = writable([])
export const userInfo = writable({id: null, user_id: null, name: null, profile: null})
// export const workflows = writable([])
