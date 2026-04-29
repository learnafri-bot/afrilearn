import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://syfckweucwdpfgtpymeg.supabase.co'
const supabaseKey = 'sb_publishable_FSXgbdmhHAH19NS6Z3fqKQ__tT8CGRz'

export const supabase = createClient(supabaseUrl, supabaseKey)
