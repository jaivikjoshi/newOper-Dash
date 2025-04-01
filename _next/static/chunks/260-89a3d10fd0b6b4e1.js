"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[260],{7260:function(e,t,r){r.r(t),r.d(t,{UserProvider:function(){return l},useUser:function(){return c}});var o=r(7437),n=r(2265),a=r(1223),i=r(3604);let s=(0,n.createContext)(void 0),l=e=>{let{children:t}=e,[r,l]=(0,n.useState)(null),[c,m]=(0,n.useState)([]),[u,d]=(0,n.useState)(!0),[g,S]=(0,n.useState)(null),[f,h]=(0,n.useState)(!1);(0,n.useEffect)(()=>{let e=localStorage.getItem("isAuthenticated");"true"===e&&h(!0)},[]),(0,n.useEffect)(()=>{let e=async()=>{try{d(!0),S(null);try{let e=await i.UL(a.t.SHEETS.USER_PROFILES);e.length>0&&l(e[0])}catch(t){console.error("Error loading user profile from Google Sheets, falling back to localStorage:",t);let e=localStorage.getItem("userProfile");if(e)l(JSON.parse(e));else{let e={id:"1",name:"Jake Smith",email:"jake.smith@example.com",phone:"+1 (555) 123-4567",profilePicture:"",role:"owner",businessName:"State Farm Co",businessType:"Insurance",website:"https://statefarm.example.com",location:"123 Main St, Anytown, USA",plan:"free",notificationSettings:{announcements:!0,polls:!0,mentions:!0,teamUpdates:!0,shiftChanges:!0},createdAt:new Date().toISOString(),metadata:{onboardingCompleted:!1}};l(e),localStorage.setItem("userProfile",JSON.stringify(e))}}try{let e=await i.UL(a.t.SHEETS.ANNOUNCEMENTS),t=e.map(e=>{let t=[];if(e.attachments)try{"string"==typeof e.attachments?t=JSON.parse(e.attachments):Array.isArray(e.attachments)&&(t=e.attachments)}catch(t){console.warn("Could not parse attachments:",e.attachments)}return{...e,isActive:"true"===e.isActive||!0===e.isActive,isPremium:"true"===e.isPremium||!0===e.isPremium,type:e.type||"basic",attachments:t}});m(t)}catch(t){console.error("Error loading announcements from Google Sheets, falling back to localStorage:",t);let e=localStorage.getItem("announcements");if(e)m(JSON.parse(e));else{let e=[{id:"1",title:"Welcome to our platform",content:"Thank you for joining our platform. We are excited to have you on board!",createdAt:new Date(Date.now()-6048e5).toISOString(),isActive:!0,type:"basic",attachments:[]},{id:"2",title:"New features coming soon",content:"We are working on exciting new features that will be released next month.",createdAt:new Date(Date.now()-2592e5).toISOString(),isActive:!0,type:"scheduled",scheduledFor:new Date(Date.now()+12096e5).toISOString()}];m(e),localStorage.setItem("announcements",JSON.stringify(e))}}}catch(e){console.error("Error loading user data:",e),S("Failed to load user data. Please try again later.")}finally{d(!1)}};e()},[]);let E=async e=>{try{if(!r)return!1;try{let t=await i.RQ(a.t.SHEETS.USER_PROFILES,r.id,e);if(t){let t={...r,...e};return l(t),!0}}catch(e){console.error("Error updating profile in Google Sheets, falling back to localStorage:",e)}let t={...r,...e};return l(t),localStorage.setItem("userProfile",JSON.stringify(t)),!0}catch(e){return console.error("Error updating user profile:",e),!1}},p=async e=>{try{if(!r)return!1;let l={name:e.firstName&&e.lastName?"".concat(e.firstName," ").concat(e.lastName):r.name,email:e.email||r.email,phone:e.phone?String(e.phone):r.phone,profilePicture:e.profilePicture||r.profilePicture,role:e.role||r.role,businessName:e.businessName||r.businessName,businessType:"other"===e.businessType?e.otherBusinessType:e.businessType||r.businessType,website:e.website&&""!==e.website.trim()?e.website:r.website,location:e.location||r.location,plan:e.plan||r.plan,notificationSettings:e.notificationSettings||r.notificationSettings,metadata:{...r.metadata||{},role:e.role,locationCount:e.locationCount,employeeCount:e.employeeCount,onboardingCompleted:!0,onboardingCompletedAt:new Date().toISOString()}};try{var t,o,n,s;let e={...l,website:l.website||"",phone:l.phone?"'".concat(String(l.phone)):"",role:(null===(t=l.metadata)||void 0===t?void 0:t.role)||"",locationCount:(null===(o=l.metadata)||void 0===o?void 0:o.locationCount)||"",employeeCount:(null===(n=l.metadata)||void 0===n?void 0:n.employeeCount)||"",onboardingCompleted:!0,onboardingCompletedAt:(null===(s=l.metadata)||void 0===s?void 0:s.onboardingCompletedAt)||new Date().toISOString()};Object.keys(e).forEach(t=>{void 0===e[t]&&delete e[t]}),await i.RQ(a.t.SHEETS.USER_PROFILES,r.id,e)}catch(e){console.error("Error updating Google Sheets directly:",e)}return await E(l)}catch(e){return console.error("Error saving onboarding data:",e),!1}},w=async e=>{try{let t={...e,createdAt:new Date().toISOString()};try{let e={...t,isActive:String(t.isActive),isPremium:void 0!==t.isPremium?String(t.isPremium):void 0,attachments:t.attachments&&t.attachments.length?JSON.stringify(t.attachments):void 0},r=await i.SA(a.t.SHEETS.ANNOUNCEMENTS,e),o={...r,isActive:"true"===r.isActive||!0===r.isActive,isPremium:"true"===r.isPremium||!0===r.isPremium,attachments:r.attachments?"string"==typeof r.attachments?JSON.parse(r.attachments):r.attachments:[]};return m(e=>[...e,o]),o}catch(e){console.error("Error adding to Google Sheets, falling back to localStorage:",e)}let r=Date.now().toString(),o={...t,id:r};return m(e=>[...e,o]),localStorage.setItem("announcements",JSON.stringify([...c,o])),o}catch(e){throw console.error("Error adding announcement:",e),Error("Failed to add announcement. Please try again later.")}},y=async(e,t)=>{try{try{let r={...t};t.hasOwnProperty("isActive")&&(r.isActive=String(t.isActive)),t.hasOwnProperty("isPremium")&&(r.isPremium=String(t.isPremium)),t.attachments&&(r.attachments=JSON.stringify(t.attachments));let o=await i.RQ(a.t.SHEETS.ANNOUNCEMENTS,e,r);if(o)return m(r=>r.map(r=>r.id===e?{...r,...t,isActive:t.hasOwnProperty("isActive")?!!t.isActive:r.isActive,isPremium:t.hasOwnProperty("isPremium")?!!t.isPremium:r.isPremium}:r)),!0}catch(e){console.error("Error updating in Google Sheets, falling back to localStorage:",e)}return m(r=>r.map(r=>r.id===e?{...r,...t}:r)),localStorage.setItem("announcements",JSON.stringify(c.map(r=>r.id===e?{...r,...t}:r))),!0}catch(e){return console.error("Error updating announcement:",e),!1}},A=async e=>{try{try{let t=await i.qK(a.t.SHEETS.ANNOUNCEMENTS,e);if(t)return m(t=>t.filter(t=>t.id!==e)),!0}catch(e){console.error("Error deleting from Google Sheets, falling back to localStorage:",e)}let t=c.filter(t=>t.id!==e);return m(t),localStorage.setItem("announcements",JSON.stringify(t)),!0}catch(e){return console.error("Error deleting announcement:",e),!1}},N=async(e,t)=>{try{d(!0),S(null);let r=[];try{r=await i.UL(a.t.SHEETS.USER_PROFILES)}catch(t){console.error("Error loading user profiles from Google Sheets:",t);let e=localStorage.getItem("userProfiles");e&&(r=JSON.parse(e))}let o=r.find(t=>t.email===e);if(!o||o.passwordHash!==t)return S("Invalid email or password"),!1;return h(!0),localStorage.setItem("isAuthenticated","true"),l(o),localStorage.setItem("userProfile",JSON.stringify(o)),!0}catch(e){return console.error("Login error:",e),S("Login failed. Please try again."),!1}finally{d(!1)}};return(0,o.jsx)(s.Provider,{value:{userProfile:r,announcements:c,loading:u,error:g,updateUserProfile:E,saveOnboardingData:p,addAnnouncement:w,updateAnnouncement:y,deleteAnnouncement:A,login:N,logout:()=>{h(!1),localStorage.removeItem("isAuthenticated")},isAuthenticated:f},children:t})},c=()=>{let e=(0,n.useContext)(s);if(void 0===e)throw Error("useUser must be used within a UserProvider");return e}},1223:function(e,t,r){r.d(t,{t:function(){return o}});let o={SHEET_ID:"14fxw5LHPiKwozImXX8ZwTGvQzNtLmlq-WD6CrNNNpiU",SHEETS:{MEMBERS:"Members",ORGANIZATION_UNITS:"OrganizationUnits",USER_PROFILES:"UserProfiles",ANNOUNCEMENTS:"Announcements"},CLIENT_EMAIL:"knowbie-back-user@get-knowbie-dash-test-back.iam.gserviceaccount.com",PRIVATE_KEY:"-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDRrechywkh+TMk\nfZgNTkUsnr3uxEqbOzAy7GlgA21TCjtU8bQrsfmcqI3GPfndss0wzbc8HfNJjy+m\nf8d1wAfC92pY3rrwM/tR1lEZ0xALfJl+Hm9Fyg1EhSxwWgPdhTUu0iGwIn6cczwH\n8D8xls9Qe/rkAgaNGm/dbJPRbP2xEaw/PoL95lbN/biToTCmGy17pH7U7DCtAp5P\nLFK79x6PggW//xSKHPlqdKV3q/IlnTJWgUSigxSbWWT/RiNoYM5T9r7H1fREzQIQ\nhmNMKGhTsdeAcwaRf+mgy+DcpgqfGOGmDld8LfJEcmwcjoSBvHsms4LAseLDx/If\nwH2AfYNVAgMBAAECggEACitXguWQf1PRPatTtQ1/QF9AkfR2M9omh8m8gJoZ8sWT\nxBZm6RmcJBNusNcvp6d02TGY+fLv6jjmFDqtR1I1bijGwSGoSl8TCNCOpWR9qjj0\nTtAWEHnws8qLsbVD67n6rtclKCA8KMVT+4SU5AhO7LXeoLFSdQR7uW77KlSRZ0WA\nFL5MZAhYACbfJU+BYSyv7YWVyXDlpmo35yalfz/osoA6XE3ZUfqU6KMKRrZNhcRy\n1cnbbD3QJKRpCNOJrRl3wxJ51N1UJ3S9rJGcTSqpvLRTRax5qHf+TiP6JJg9Wd1a\nUQahCWRqAm43u+NmbOfMvG6uY1TKU9Vw1UrbdD3tgQKBgQD+oTwXB8UM24zGk8iz\ngMJSvCaqnugIsJcPBy+lDTxiI80UdJMAnwwpuTuxH3Ur6rDQLQzqXJanFiOBnWLZ\n+tNCSM4CoccrdQ09o6b0xN1CYZ+NXWq6uEQWrpXXYRjtJ3qIYJdaqdnFMPfFSgvN\nH/UoogFkrZN3K/tE/MmTG5ODlQKBgQDSzr8eafg1z+Y6wO5M2NPfcV2WbxCXq+O9\n4oBPnm1rucwmScEUNshAttL/E5YoCq56tTfZZj3nizTeAeCCCYysGIKBfL9UPt0x\n0MLZoDlQ7Mp9MzOFKHlV2t8mjVw7I2V42m4VLv7PdaP0vMDzCc8+hoO9gT6VbJFN\n1m9iolYQwQKBgQDPGeT99lvXMVs2yEydc0Sadl4cuFKRfs/ecUHXRQSv7d6HnKlU\nAAishvR+A9ARgDl/mKTAmb4O+Hq4mYIlOVVKvFyS13JfbjzuvYS14Mj1jOFw4WJF\nrEn1CNrm6xqTCWEoOyffnfZ55HIiDS+8DxofimUHtgYTD7q3ScPJ2swIYQKBgQCS\nZrbgHmQcqxePMjHM+MCb6xU9xkBVtTBizQyjPrlrGQuog4wtx6XnG5EJSMb9Y/2s\nhnIU7yaKyWibzd3nMU6ariLkXohZr5baY8sObHGhu/EcZhSfo24wq+JR2dZ1061C\n8x+EYrDfzylgbD3sC6H8IFsZnsqh51Y6InQUofz3gQKBgQDVRgO3uvR4KwCZfawB\nc3nyl8PaDe5wKRAjKZ9adFOpGozxtX+QSmpqlu9IjhkhMWg9dB2+1D6U6NQH/BDh\nS9KzeQXr70GKyflgsHBCEYxCF9ry+WFhS+sHheTZ2VWVvLNf/kNoTGwqEEp6dOeR\n/ZU/nHjDE5NpBVKx3Pn1vYhXtA==\n-----END PRIVATE KEY-----\n"}},3604:function(e,t,r){r.d(t,{RQ:function(){return a},SA:function(){return n},UL:function(){return o},qK:function(){return i}});let o=async e=>{try{let t=await fetch("/api/sheets?sheet=".concat(e));if(!t.ok){let e=await t.json();throw Error(e.error||"Failed to fetch data")}let r=await t.json();return r.data}catch(t){return console.error("Error getting rows from ".concat(e,":"),t),[]}},n=async(e,t)=>{try{let r=await fetch("/api/sheets",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"add",sheetName:e,data:t})});if(!r.ok){let e=await r.json();throw Error(e.error||"Failed to add row")}let o=await r.json();return{...t,id:o.id}}catch(t){throw console.error("Error adding row to ".concat(e,":"),t),t}},a=async(e,t,r)=>{try{let o=await fetch("/api/sheets",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"update",sheetName:e,id:t,data:r})});if(!o.ok){let e=await o.json();throw Error(e.error||"Failed to update row")}return!0}catch(t){return console.error("Error updating row in ".concat(e,":"),t),!1}},i=async(e,t)=>{try{let r=await fetch("/api/sheets",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"delete",sheetName:e,id:t})});if(!r.ok){let e=await r.json();throw Error(e.error||"Failed to delete row")}return!0}catch(t){return console.error("Error deleting row from ".concat(e,":"),t),!1}}}}]);