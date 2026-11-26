import {fetchPlaces} from './decentraland.mjs';
export function mountDiscovery(host){
 const root=document.createElement('section');root.className='metaverse-browser';root.setAttribute('aria-label','Decentraland discovery preview');host.append(root);
 const make=(tag,text,parent=root)=>{const e=document.createElement(tag);if(text)e.textContent=text;parent.append(e);return e;};
 make('p','Public Decentraland listings · experimental connection');
 const form=make('form',''),kindLabel=make('label','Destination type',form),kind=make('select','',kindLabel);
 for(const [name,value] of [['Genesis City parcels','parcel'],['Named Worlds','world']])kind.add(new Option(name,value));
 const label=make('label','Search names or places',form),input=make('input','',label);input.type='search';input.maxLength=100;input.placeholder='Gallery, game, or world name';input.autocomplete='off';
 const submit=make('button','Search provider',form);submit.type='submit';
 const status=make('p','Choose a destination type and search.');status.setAttribute('role','status');
 const results=make('div','');results.className='metaverse-results';
 const more=make('button','Load more');more.type='button';more.hidden=true;
 let controller=null,offset=0,active=null,seen=new Set(),total=0;
 const cancel=()=>{controller?.abort();controller=null;submit.disabled=false;more.disabled=false;};
 function link(parent,name,url){const a=make('a',name,parent);a.href=url;if(url.startsWith('https:')){a.target='_blank';a.rel='noopener noreferrer';}return a;}
 async function load(reset){
 if(reset){cancel();offset=0;seen.clear();total=0;results.replaceChildren();active={kind:kind.value,search:input.value.trim()};}
 if(!active||controller)return;
 if(active.search.length>0&&active.search.length<3){status.textContent='Enter at least three characters, or leave the search empty.';more.hidden=true;return;}
 const request=new AbortController();controller=request;let timedOut=false;
 const timeout=setTimeout(()=>{timedOut=true;request.abort();},12000);
 submit.disabled=true;more.disabled=true;status.textContent='Requesting public listings…';
 try{
 const page=await fetchPlaces({...active,offset,limit:25,signal:request.signal});
 if(controller!==request||!root.isConnected)return;
 for(const row of page.records){if(seen.has(row.id))continue;seen.add(row.id);total++;
 const card=make('article','',results);make('strong',row.title,card);
 make('p',[row.kind==='parcel'?'Genesis City '+row.baseParcel:'Named World',row.rating].join(' · '),card);
 if(row.names.length)make('p',row.names.join(', ')+' · provider-reported name, not independently ENS-verified',card);
 if(row.categories.length)make('p',row.categories.join(' · '),card);
 make('small','Source: Decentraland · checked '+row.checkedAt.slice(0,10),card);
 if(row.launchUrl)link(card,'Open in installed Decentraland client',row.launchUrl);
 link(card,'Browse official Places directory',row.sourceUrl);
 }
 offset=page.nextOffset;more.hidden=offset===null;status.textContent=total?total+' eligible unique listings loaded. Not a complete index.':offset===null?'No eligible listings returned.':'No eligible listings on this page; more may be available.';
 }catch(error){if(controller!==request||!root.isConnected)return;status.textContent=timedOut?'Provider request timed out. Try again.':'Provider could not be reached or returned an unexpected response. No results are invented.';more.hidden=true;}
 finally{clearTimeout(timeout);if(controller===request){controller=null;submit.disabled=false;more.disabled=false;}}
 }
 form.addEventListener('submit',e=>{e.preventDefault();load(true);});more.addEventListener('click',()=>load(false));
 return cancel;
}
