(()=>{var a={};a.id=173,a.ids=[173],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},44870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},70551:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>E,patchFetch:()=>D,routeModule:()=>z,serverHooks:()=>C,workAsyncStorage:()=>A,workUnitAsyncStorage:()=>B});var d={};c.r(d),c.d(d,{POST:()=>y});var e=c(19225),f=c(84006),g=c(8317),h=c(99373),i=c(34775),j=c(24235),k=c(261),l=c(54365),m=c(90771),n=c(73461),o=c(67798),p=c(92280),q=c(62018),r=c(45696),s=c(47929),t=c(86439),u=c(37527),v=c(45592);let w=new(c(31541)).Ay({apiKey:process.env.OPENAI_API_KEY}),x=`You are an expert CV writer and career consultant specializing in the German job market. 
Your task is to take user input (provided in Arabic) and transform it into a professional, ATS-optimized German CV (Lebenslauf).

## Guidelines:
1.  **Language:** Translate all content from Arabic to professional business German.
2.  **Script:** Ensure ALL text is in Latin script. Transliterate proper names (e.g., "محمد" -> "Mohammed") if they are not already in Latin script.
3.  **Formatting:** Ensure standard German CV formatting conventions (e.g., dates in MM/YYYY format).
4.  **Optimization:** Use strong action verbs and professional terminology suitable for ATS systems.
5.  **Structure:** Return the result as a strict JSON object.

## Output JSON Structure:
{
  "personalInfo": {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "address": "string",
    "linkedIn": "string (optional)",
    "xing": "string (optional)",
    "jobTitle": "string (target job title)"
  },
  "summary": "string (professional summary in German)",
  "experience": [
    {
      "title": "string (job title)",
      "company": "string",
      "location": "string",
      "startDate": "string (MM/YYYY)",
      "endDate": "string (MM/YYYY or 'Aktuell')",
      "description": "string (bullet points or paragraph describing responsibilities)"
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string",
      "description": "string (optional)"
    }
  ],
  "skills": ["string", "string"],
  "languages": [
    {
      "language": "string",
      "level": "string (e.g., Muttersprache, C1, B2)"
    }
  ]
}

Ensure the JSON is valid and contains no markdown code blocks.`;async function y(a){try{let b,{personalInfo:c,experience:d,education:e,skills:f,languages:g,summary:h}=await a.json();if(!c)return v.NextResponse.json({success:!1,error:"Missing personal info"},{status:400});let i=JSON.stringify({personalInfo:c,summary:h,experience:d,education:e,skills:f,languages:g}),j=await w.chat.completions.create({model:"gpt-4o",messages:[{role:"system",content:x},{role:"user",content:`Please create a professional German CV from this data:

${i}`}],temperature:.3,response_format:{type:"json_object"}}),k=j.choices[0]?.message?.content||"{}";try{b=JSON.parse(k)}catch(a){return console.error("Failed to parse OpenAI response",k),v.NextResponse.json({success:!1,error:"Failed to generate valid JSON"},{status:500})}return v.NextResponse.json({success:!0,cvData:b})}catch(a){return console.error("CV Generation error:",a),v.NextResponse.json({success:!1,error:"Internal Server Error"},{status:500})}}let z=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/cv/generate/route",pathname:"/api/cv/generate",filename:"route",bundlePath:"app/api/cv/generate/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"C:\\Users\\yazan\\OneDrive\\Desktop\\dev app\\Ai helper\\formbridge-ai\\src\\app\\api\\cv\\generate\\route.ts",nextConfigOutput:"standalone",userland:d}),{workAsyncStorage:A,workUnitAsyncStorage:B,serverHooks:C}=z;function D(){return(0,g.patchFetch)({workAsyncStorage:A,workUnitAsyncStorage:B})}async function E(a,b,c){z.isDev&&(0,h.addRequestMeta)(a,"devRequestTimingInternalsEnd",process.hrtime.bigint());let d="/api/cv/generate/route";"/index"===d&&(d="/");let e=await z.prepare(a,b,{srcPage:d,multiZoneDraftMode:!1});if(!e)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:g,params:v,nextConfig:w,parsedUrl:x,isDraftMode:y,prerenderManifest:A,routerServerContext:B,isOnDemandRevalidate:C,revalidateOnlyGenerated:D,resolvedPathname:E,clientReferenceManifest:F,serverActionsManifest:G}=e,H=(0,k.normalizeAppPath)(d),I=!!(A.dynamicRoutes[H]||A.routes[E]),J=async()=>((null==B?void 0:B.render404)?await B.render404(a,b,x,!1):b.end("This page could not be found"),null);if(I&&!y){let a=!!A.routes[E],b=A.dynamicRoutes[H];if(b&&!1===b.fallback&&!a){if(w.experimental.adapterPath)return await J();throw new t.NoFallbackError}}let K=null;!I||z.isDev||y||(K="/index"===(K=E)?"/":K);let L=!0===z.isDev||!I,M=I&&!L;G&&F&&(0,j.setManifestsSingleton)({page:d,clientReferenceManifest:F,serverActionsManifest:G});let N=a.method||"GET",O=(0,i.getTracer)(),P=O.getActiveScopeSpan(),Q={params:v,prerenderManifest:A,renderOpts:{experimental:{authInterrupts:!!w.experimental.authInterrupts},cacheComponents:!!w.cacheComponents,supportsDynamicResponse:L,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:w.cacheLife,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d,e)=>z.onRequestError(a,b,d,e,B)},sharedContext:{buildId:g}},R=new l.NodeNextRequest(a),S=new l.NodeNextResponse(b),T=m.NextRequestAdapter.fromNodeNextRequest(R,(0,m.signalFromNodeResponse)(b));try{let e=async a=>z.handle(T,Q).finally(()=>{if(!a)return;a.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let c=O.getRootSpanAttributes();if(!c)return;if(c.get("next.span_type")!==n.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${c.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=c.get("next.route");if(e){let b=`${N} ${e}`;a.setAttributes({"next.route":e,"http.route":e,"next.span_name":b}),a.updateName(b)}else a.updateName(`${N} ${d}`)}),g=!!(0,h.getRequestMeta)(a,"minimalMode"),j=async h=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!g&&C&&D&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let d=await e(h);a.fetchMetrics=Q.renderOpts.fetchMetrics;let i=Q.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=Q.renderOpts.collectedTags;if(!I)return await (0,p.I)(R,S,d,Q.renderOpts.pendingWaitUntil),null;{let a=await d.blob(),b=(0,q.toNodeOutgoingHttpHeaders)(d.headers);j&&(b[s.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==Q.renderOpts.collectedRevalidate&&!(Q.renderOpts.collectedRevalidate>=s.INFINITE_CACHE)&&Q.renderOpts.collectedRevalidate,e=void 0===Q.renderOpts.collectedExpire||Q.renderOpts.collectedExpire>=s.INFINITE_CACHE?void 0:Q.renderOpts.collectedExpire;return{value:{kind:u.CachedRouteKind.APP_ROUTE,status:d.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:e}}}}catch(b){throw(null==f?void 0:f.isStale)&&await z.onRequestError(a,b,{routerKind:"App Router",routePath:d,routeType:"route",revalidateReason:(0,o.c)({isStaticGeneration:M,isOnDemandRevalidate:C})},!1,B),b}},l=await z.handleResponse({req:a,nextConfig:w,cacheKey:K,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:A,isRoutePPREnabled:!1,isOnDemandRevalidate:C,revalidateOnlyGenerated:D,responseGenerator:k,waitUntil:c.waitUntil,isMinimalMode:g});if(!I)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==u.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});g||b.setHeader("x-nextjs-cache",C?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),y&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,q.fromNodeOutgoingHttpHeaders)(l.value.headers);return g&&I||m.delete(s.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,r.getCacheControlHeader)(l.cacheControl)),await (0,p.I)(R,S,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};P?await j(P):await O.withPropagatedContext(a.headers,()=>O.trace(n.BaseServerSpan.handleRequest,{spanName:`${N} ${d}`,kind:i.SpanKind.SERVER,attributes:{"http.method":N,"http.target":a.url}},j))}catch(b){if(b instanceof t.NoFallbackError||await z.onRequestError(a,b,{routerKind:"App Router",routePath:H,routeType:"route",revalidateReason:(0,o.c)({isStaticGeneration:M,isOnDemandRevalidate:C})},!1,B),I)throw b;return await (0,p.I)(R,S,new Response(null,{status:500})),null}}},78335:()=>{},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},96487:()=>{}};var b=require("../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[445,813,541],()=>b(b.s=70551));module.exports=c})();