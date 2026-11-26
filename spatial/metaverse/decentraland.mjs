// Public, opt-out-respecting Decentraland Places API. No wallet or account required.
const endpoint='https://places.decentraland.org/api/destinations';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const coordinate=/^-?\d{1,3},-?\d{1,3}$/;
const clean=(v,n)=>typeof v==='string'?v.trim().slice(0,n):'';
export function normalizePlace(row,kind,checkedAt){
 if(!row||!uuid.test(row.id)||row.disabled!==false||row.hidden===true)return null;
 if(!['parcel','world'].includes(kind))return null;
 const name=clean(row.title,100);if(!name)return null;
 const rating=clean(row.content_rating,8);
 // Conservative public preview: omit adult, unrated and gambling-related records.
 const categories=Array.isArray(row.categories)?row.categories.filter(v=>typeof v==='string').slice(0,30):[];
 if(!['E','PR','T'].includes(rating)||/\b(casino|gambl\w*|betting|wager\w*|slots|roulette|poker)\b/i.test([name,row.description,...categories].join(' ')))return null;
 const base=kind==='parcel'&&coordinate.test(row.base_position)?row.base_position:null;
 if(kind==='parcel'&&!base)return null;
 // Never infer an ENS alias from a title or from an owner's wallet.
 return {id:'decentraland:'+row.id.toLowerCase(),provider:'decentraland',kind,sourceId:row.id,title:name,
  categories,rating,baseParcel:base,parcels:kind==='parcel'&&Array.isArray(row.positions)?row.positions.filter(v=>typeof v==='string'&&coordinate.test(v)):[],
  names:[],nameResolution:'unverified',sourceUpdatedAt:clean(row.updated_at,64)||null,checkedAt,
  sourceUrl:'https://places.decentraland.org/',launchUrl:base?'decentraland://?position='+base:null,
  verification:'provider-listed-not-ownership-verified'};
}
export async function fetchPlaces({kind='parcel',limit=50,offset=0,fetcher=globalThis.fetch,signal}={}){
 if(!['parcel','world'].includes(kind)||!Number.isInteger(limit)||limit<1||limit>100||!Number.isInteger(offset)||offset<0)throw new Error('Invalid page');
 const url=new URL(endpoint);url.searchParams.set(kind==='parcel'?'only_places':'only_worlds','true');url.searchParams.set('limit',String(limit));url.searchParams.set('offset',String(offset));
 const res=await fetcher(url,{signal,credentials:'omit',headers:{Accept:'application/json'}});if(!res.ok)throw new Error('Provider request failed: '+res.status);
 const result=await res.json();if(result.ok!==true||!Array.isArray(result.data))throw new Error('Unexpected provider response');
 const checkedAt=new Date().toISOString(),records=result.data.map(row=>normalizePlace(row,kind,checkedAt)).filter(Boolean);
 return {records,checkedAt,providerTotal:Number.isInteger(result.total)?result.total:null,nextOffset:result.data.length===limit?offset+limit:null,rawCount:result.data.length};
}
