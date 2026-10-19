// Offline recovery only. Real secrets must be in an ignored local env file.
const {SUPABASE_URL:base,SUPABASE_SERVICE_ROLE_KEY:key,ADMIN_USER_ID:id,OPUS_NEW_PASSWORD:password}=process.env;
if(!base?.startsWith('https://')||!key||!id||!password||password.length<14)throw new Error('Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_USER_ID, OPUS_NEW_PASSWORD (14+ chars).');
const r=await fetch(base+'/auth/v1/admin/users/'+encodeURIComponent(id),{method:'PUT',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({password,email_confirm:true})});
if(!r.ok)throw new Error('Password reset failed (HTTP '+r.status+'). No secret has been printed.');
console.log('Administrator password reset. Sign in again; review active sessions in Supabase Auth.');
