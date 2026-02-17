(()=>{var a={};a.id=786,a.ids=[786],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},28632:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>F,patchFetch:()=>E,routeModule:()=>A,serverHooks:()=>D,workAsyncStorage:()=>B,workUnitAsyncStorage:()=>C});var d={};c.r(d),c.d(d,{POST:()=>z});var e=c(19225),f=c(84006),g=c(8317),h=c(99373),i=c(34775),j=c(24235),k=c(261),l=c(54365),m=c(90771),n=c(73461),o=c(67798),p=c(92280),q=c(62018),r=c(45696),s=c(47929),t=c(86439),u=c(37527),v=c(45592);let w=new(c(31541)).Ay({apiKey:process.env.OPENAI_API_KEY}),x=`You are a German form analyzer with PRECISE field position detection capabilities.

## PRIMARY TASK
Analyze German form images to:
1. Detect all fillable fields (empty OR already filled)
2. Determine EXACT positions where text should be placed
3. Identify any existing content in pre-filled fields

## CRITICAL POSITIONING RULES

The image is divided into a 100x100 grid:
- TOP-LEFT corner = (0, 0)
- BOTTOM-RIGHT corner = (100, 100)
- x increases LEFT to RIGHT
- y increases TOP to BOTTOM

### MEASURING POSITIONS ACCURATELY

**For the INPUT FIELD (not the label!):**

1. **x (left edge)**: Where does the writable area BEGIN horizontally?
   - If field starts at left margin: x ≈ 2-5
   - If field starts after a short label "Name:": x ≈ 15-25
   - If field is in right half of form: x ≈ 50-60
   - If field starts after a long label: x ≈ 30-45

2. **y (top edge)**: Where does the field START vertically from page top?
   - First row of fields after header: y ≈ 12-20
   - Each subsequent row: add 4-8 to previous y
   - Fields near middle of page: y ≈ 40-60
   - Fields near bottom: y ≈ 70-90

3. **width**: How wide is the INPUT AREA (not including label)?
   - Small fields (date, phone): width ≈ 12-20
   - Medium fields (name, city): width ≈ 25-40
   - Large fields (full address): width ≈ 50-75
   - Full-width fields: width ≈ 85-95

4. **height**: How tall is the writable line/box?
   - Single line text: height ≈ 3-5
   - Two-line area: height ≈ 6-8
   - Multi-line textarea: height ≈ 10-20

## DETECTING PRE-FILLED FIELDS

IMPORTANT: Some fields may already contain handwritten or typed text!

For each field, check:
- Is there visible text/writing inside the field area?
- Can you read the existing content?

If a field is pre-filled:
- Set "prefilled": true
- Set "existingValue": "the text you can read"
- The user may not need to fill this field again

## FIELD TYPES
- "text": Single line text input
- "textarea": Multi-line text area  
- "date": Date field (DD.MM.YYYY format)
- "checkbox": Checkable box (may be checked already)
- "number": Numeric input
- "select": Dropdown or choice field

## OUTPUT FORMAT

Return ONLY this JSON (no markdown, no extra text):
{
  "formTitle": "Title of the form",
  "formType": "Type (Anmeldung, Antrag, etc.)",
  "detectedFields": [
    {
      "id": "field_1",
      "germanLabel": "The German label/question",
      "arabicLabel": "Arabic translation",
      "fieldType": "text",
      "required": true,
      "prefilled": false,
      "existingValue": null,
      "inputPosition": {
        "x": 25,
        "y": 18,
        "width": 40,
        "height": 4
      },
      "confidence": "high"
    }
  ]
}

## CONFIDENCE LEVELS
- "high": Clear box/line visible, position is certain
- "medium": Field boundaries somewhat visible
- "low": Guessing based on form layout`,y=`Analyze this German form image with EXTREME PRECISION.

## STEP 1: Understand the Form Layout
- Is it a single-column or multi-column form?
- Where are the labels positioned relative to input fields?
- Are there any already-filled fields?

## STEP 2: For EACH Fillable Field

1. IDENTIFY the INPUT AREA (the blank/filled space for writing, NOT the label)
2. MEASURE its position as percentages:
   - x: left edge (0=far left, 100=far right)  
   - y: top edge (0=top, 100=bottom)
   - width: horizontal size
   - height: vertical size

3. CHECK if the field is already filled:
   - Look for handwritten or typed text inside the field
   - If filled, read the existing content

## STEP 3: Quality Check
- Are your x/y positions for the INPUT AREA, not the label?
- Did you include already-filled fields with their content?
- Are your widths accurate for each field type?

⚠️ COMMON ERRORS TO AVOID:
- Placing position at the LABEL instead of the INPUT FIELD
- Making all fields the same width regardless of actual size
- Missing fields that are already filled in
- Wrong y-position (not measuring from actual input line)

Be extremely precise - these coordinates will overlay text directly on the image!`;async function z(a){try{let b,{imageBase64:c}=await a.json();if(!c)return v.NextResponse.json({success:!1,error:"No image provided"},{status:400});let d=await w.chat.completions.create({model:"gpt-4o",messages:[{role:"system",content:x},{role:"user",content:[{type:"text",text:y},{type:"image_url",image_url:{url:c,detail:"high"}}]}],max_tokens:4e3,temperature:.02}),e=d.choices[0]?.message?.content||"",f=e,g=e.match(/```(?:json)?\s*([\s\S]*?)\s*```/);g&&(f=g[1]);let h=f.match(/\{[\s\S]*\}/);if(!h)return console.error("No JSON found in response:",e),v.NextResponse.json({success:!1,error:"Failed to parse form structure"},{status:500});try{b=JSON.parse(h[0])}catch(a){return console.error("JSON parse error:",a),console.error("Content:",h[0]),v.NextResponse.json({success:!1,error:"Invalid response format"},{status:500})}let i=b.detectedFields||b.fields||[];if(!Array.isArray(i)||0===i.length)return v.NextResponse.json({success:!1,error:"No fields detected in form"},{status:500});let j=i.map((a,b)=>{let c=a.inputPosition||a.position||{},d=Number(c.x)||5,e=Number(c.y)||15+7*b,f=Number(c.width)||40,g=Number(c.height)||4;return d=Math.max(0,Math.min(95,d)),e=Math.max(0,Math.min(95,e)),f=Math.max(5,Math.min(95-d,f)),g=Math.max(2,Math.min(95-e,Math.min(25,g))),d+f>98&&(f=98-d),e+g>98&&(g=98-e),{id:a.id||`field_${b+1}`,germanQuestion:a.germanLabel||a.germanQuestion||`Feld ${b+1}`,arabicQuestion:a.arabicLabel||a.arabicQuestion||`الحقل ${b+1}`,fieldType:a.fieldType||"text",required:!1!==a.required,prefilled:a.prefilled||!1,existingValue:a.existingValue||null,position:{x:d,y:e,width:f,height:g},confidence:a.confidence||"medium"}});return console.log("Detected fields:",j.map(a=>({question:a.germanQuestion,position:a.position,prefilled:a.prefilled,existingValue:a.existingValue}))),v.NextResponse.json({success:!0,formTitle:b.formTitle||"Deutsches Formular",formType:b.formType||"Formular",fields:j})}catch(a){return console.error("Analyze error:",a),v.NextResponse.json({success:!1,error:"Analysis failed"},{status:500})}}let A=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/analyze/route",pathname:"/api/analyze",filename:"route",bundlePath:"app/api/analyze/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"C:\\Users\\yazan\\OneDrive\\Desktop\\dev app\\Ai helper\\formbridge-ai\\src\\app\\api\\analyze\\route.ts",nextConfigOutput:"standalone",userland:d}),{workAsyncStorage:B,workUnitAsyncStorage:C,serverHooks:D}=A;function E(){return(0,g.patchFetch)({workAsyncStorage:B,workUnitAsyncStorage:C})}async function F(a,b,c){A.isDev&&(0,h.addRequestMeta)(a,"devRequestTimingInternalsEnd",process.hrtime.bigint());let d="/api/analyze/route";"/index"===d&&(d="/");let e=await A.prepare(a,b,{srcPage:d,multiZoneDraftMode:!1});if(!e)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:g,params:v,nextConfig:w,parsedUrl:x,isDraftMode:y,prerenderManifest:z,routerServerContext:B,isOnDemandRevalidate:C,revalidateOnlyGenerated:D,resolvedPathname:E,clientReferenceManifest:F,serverActionsManifest:G}=e,H=(0,k.normalizeAppPath)(d),I=!!(z.dynamicRoutes[H]||z.routes[E]),J=async()=>((null==B?void 0:B.render404)?await B.render404(a,b,x,!1):b.end("This page could not be found"),null);if(I&&!y){let a=!!z.routes[E],b=z.dynamicRoutes[H];if(b&&!1===b.fallback&&!a){if(w.experimental.adapterPath)return await J();throw new t.NoFallbackError}}let K=null;!I||A.isDev||y||(K="/index"===(K=E)?"/":K);let L=!0===A.isDev||!I,M=I&&!L;G&&F&&(0,j.setManifestsSingleton)({page:d,clientReferenceManifest:F,serverActionsManifest:G});let N=a.method||"GET",O=(0,i.getTracer)(),P=O.getActiveScopeSpan(),Q={params:v,prerenderManifest:z,renderOpts:{experimental:{authInterrupts:!!w.experimental.authInterrupts},cacheComponents:!!w.cacheComponents,supportsDynamicResponse:L,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:w.cacheLife,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d,e)=>A.onRequestError(a,b,d,e,B)},sharedContext:{buildId:g}},R=new l.NodeNextRequest(a),S=new l.NodeNextResponse(b),T=m.NextRequestAdapter.fromNodeNextRequest(R,(0,m.signalFromNodeResponse)(b));try{let e=async a=>A.handle(T,Q).finally(()=>{if(!a)return;a.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let c=O.getRootSpanAttributes();if(!c)return;if(c.get("next.span_type")!==n.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${c.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=c.get("next.route");if(e){let b=`${N} ${e}`;a.setAttributes({"next.route":e,"http.route":e,"next.span_name":b}),a.updateName(b)}else a.updateName(`${N} ${d}`)}),g=!!(0,h.getRequestMeta)(a,"minimalMode"),j=async h=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!g&&C&&D&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let d=await e(h);a.fetchMetrics=Q.renderOpts.fetchMetrics;let i=Q.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=Q.renderOpts.collectedTags;if(!I)return await (0,p.I)(R,S,d,Q.renderOpts.pendingWaitUntil),null;{let a=await d.blob(),b=(0,q.toNodeOutgoingHttpHeaders)(d.headers);j&&(b[s.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==Q.renderOpts.collectedRevalidate&&!(Q.renderOpts.collectedRevalidate>=s.INFINITE_CACHE)&&Q.renderOpts.collectedRevalidate,e=void 0===Q.renderOpts.collectedExpire||Q.renderOpts.collectedExpire>=s.INFINITE_CACHE?void 0:Q.renderOpts.collectedExpire;return{value:{kind:u.CachedRouteKind.APP_ROUTE,status:d.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:e}}}}catch(b){throw(null==f?void 0:f.isStale)&&await A.onRequestError(a,b,{routerKind:"App Router",routePath:d,routeType:"route",revalidateReason:(0,o.c)({isStaticGeneration:M,isOnDemandRevalidate:C})},!1,B),b}},l=await A.handleResponse({req:a,nextConfig:w,cacheKey:K,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:z,isRoutePPREnabled:!1,isOnDemandRevalidate:C,revalidateOnlyGenerated:D,responseGenerator:k,waitUntil:c.waitUntil,isMinimalMode:g});if(!I)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==u.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});g||b.setHeader("x-nextjs-cache",C?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),y&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,q.fromNodeOutgoingHttpHeaders)(l.value.headers);return g&&I||m.delete(s.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,r.getCacheControlHeader)(l.cacheControl)),await (0,p.I)(R,S,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};P?await j(P):await O.withPropagatedContext(a.headers,()=>O.trace(n.BaseServerSpan.handleRequest,{spanName:`${N} ${d}`,kind:i.SpanKind.SERVER,attributes:{"http.method":N,"http.target":a.url}},j))}catch(b){if(b instanceof t.NoFallbackError||await A.onRequestError(a,b,{routerKind:"App Router",routePath:H,routeType:"route",revalidateReason:(0,o.c)({isStaticGeneration:M,isOnDemandRevalidate:C})},!1,B),I)throw b;return await (0,p.I)(R,S,new Response(null,{status:500})),null}}},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},44870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},78335:()=>{},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},96487:()=>{}};var b=require("../../../webpack-runtime.js");b.C(a);var c=b.X(0,[445,813,541],()=>b(b.s=28632));module.exports=c})();