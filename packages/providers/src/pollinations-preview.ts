// Preview-only, authsiz Pollinations görsel sağlayıcısı.
// Yalnız feat/just-chat-preview dalındaki deneysel just uret koşusu için.
import type { AppError, MoneyRange } from '@suite/contracts'
import { ZERO_USD, err, ok } from '@suite/contracts'
import { makeError } from '@suite/kernel'
import type { CapabilityDecl, JobHandle, JobStatus, ProviderAdapter, ProviderInput, ValidatedInput } from './types.js'

const ID='pollinations-preview'
const sonuclar=new Map<string,JobStatus>()
const CAPS: readonly CapabilityDecl[]=[{
  name:'image.generate',
  lanes:['free'],
  supports:{aspect:['4:5'],no_text:[true]},
}]
const hata=(kind:AppError['kind'],code:string,correlationId:string,details:Readonly<Record<string,unknown>>={}):AppError =>
  makeError({kind,code,userMessageKey:`error.provider.${code}`,correlationId:correlationId as AppError['correlationId'],details})
const seedOf=(s:string):number=>{let h=2166136261;for(const ch of s){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return Math.abs(h>>>0)%1000000}

export const pollinationsPreview: ProviderAdapter={
  id:ID,
  title:'Pollinations preview image',
  islerKalici:false,
  capabilities:()=>CAPS,
  validate:(input:ProviderInput)=>{
    if(input.capability!=='image.generate') return err(hata('validation','CAPABILITY_UNSUPPORTED',input.idempotencyKey))
    if(input.lane!=='free') return err(hata('validation','LANE_UNSUPPORTED',input.idempotencyKey))
    if(input.prompt.trim()==='') return err(hata('validation','EMPTY_PROMPT',input.idempotencyKey))
    return ok({...input,_validated:true} as ValidatedInput)
  },
  estimate:(_vi:ValidatedInput):MoneyRange=>({low:ZERO_USD,high:ZERO_USD}),
  available:()=>true,
  start:async(vi,ctx)=>{
    const prompt=encodeURIComponent(vi.prompt)
    const seed=seedOf(vi.idempotencyKey)
    const url=`https://image.pollinations.ai/prompt/${prompt}?width=768&height=960&nologo=true&seed=${seed}`
    let res:Response
    try{res=await fetch(url,{signal:ctx.signal,redirect:'follow'})}
    catch(e){return err(hata('provider_unavailable','POLLINATIONS_FETCH_FAILED',ctx.correlationId,{message:String(e)}))}
    if(!res.ok) return err(hata('provider_bad_response','POLLINATIONS_HTTP',ctx.correlationId,{status:res.status}))
    const bytes=Buffer.from(await res.arrayBuffer())
    if(bytes.length<1000) return err(hata('provider_bad_response','POLLINATIONS_EMPTY',ctx.correlationId,{bytes:bytes.length}))
    const handle:JobHandle={providerId:ID,externalId:vi.idempotencyKey,idempotencyKey:vi.idempotencyKey}
    sonuclar.set(handle.externalId,{state:'succeeded',output:{format:'base64',data:bytes.toString('base64'),width:768,height:960,yapayZeka:true}})
    return ok(handle)
  },
  status:async(h)=>ok(sonuclar.get(h.externalId)??{state:'failed',error:hata('internal','JOB_NOT_RESUMABLE',h.idempotencyKey)}),
  cancel:async(h)=>{sonuclar.set(h.externalId,{state:'cancelled'})},
  actualCost:async()=>ZERO_USD,
}
