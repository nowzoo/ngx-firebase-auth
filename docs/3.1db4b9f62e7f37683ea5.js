(window.webpackJsonp=window.webpackJsonp||[]).push([[3],{Tlcl:function(l,n,e){"use strict";e.r(n);var o=e("CcnG"),u=e("/IO6"),t=function(){function l(l,n){this.deviceDetector=l,this.router=n,this.routeTitle=null}return l.prototype.onMode=function(l){switch(l){case"resetPassword":this.routeTitle="Reset Password";break;default:this.routeTitle="Sign In"}},l.prototype.onSuccess=function(l){console.log(l),console.log("Welcome, "+l.user.displayName+"!"),console.log("You signed in with "+l.additionalUserInfo.providerId+"."),l.additionalUserInfo.isNewUser?console.log("You are a newly registered user!"):console.log("You are a returning user!"),this.router.navigate(["/"])},l}(),r=function(){},s=e("pMnS"),c=e("URSy"),d=e("ixqD"),i=e("Oipj"),a=e("ZYCi"),p=o["\u0275crt"]({encapsulation:0,styles:[[""]],data:{}});function m(l){return o["\u0275vid"](0,[(l()(),o["\u0275ted"](-1,null,[" By signing in or signing up for XXXXXXX, you agree to our "])),(l()(),o["\u0275eld"](1,0,null,null,1,"a",[["href","/tos"]],null,null,null,null,null)),(l()(),o["\u0275ted"](-1,null,["Terms of Service"])),(l()(),o["\u0275ted"](-1,null,[" and "])),(l()(),o["\u0275eld"](4,0,null,null,1,"a",[["href","/privacy"]],null,null,null,null,null)),(l()(),o["\u0275ted"](-1,null,["Privacy Policy"])),(l()(),o["\u0275ted"](-1,null,[".\n"]))],null,null)}function f(l){return o["\u0275vid"](0,[(l()(),o["\u0275and"](0,[["tos",2]],null,0,null,m)),(l()(),o["\u0275eld"](1,0,null,null,7,"div",[["class","row"]],null,null,null,null,null)),(l()(),o["\u0275eld"](2,0,null,null,6,"div",[["class","col-sm-8 offset-md-2 col-md-6 offset-md-3 col-lg-4 offset-lg-4"]],null,null,null,null,null)),(l()(),o["\u0275eld"](3,0,null,null,1,"h1",[],null,null,null,null,null)),(l()(),o["\u0275ted"](4,null,["",""])),(l()(),o["\u0275eld"](5,0,null,null,0,"hr",[],null,null,null,null,null)),(l()(),o["\u0275eld"](6,0,null,null,2,"ngx-firebase-auth-sign-in",[],null,[[null,"success"],[null,"mode"]],function(l,n,e){var o=!0,u=l.component;return"success"===n&&(o=!1!==u.onSuccess(e)&&o),"mode"===n&&(o=!1!==u.onMode(e)&&o),o},c.d,c.b)),o["\u0275did"](7,245760,null,0,d.f,[i.a,d.c,a.a,a.k],{oAuthProviderIds:[0,"oAuthProviderIds"],useOAuthPopup:[1,"useOAuthPopup"],tosTemplate:[2,"tosTemplate"]},{success:"success",mode:"mode"}),o["\u0275pad"](8,1)],function(l,n){var e=n.component;l(n,7,0,l(n,8,0,"google.com"),e.deviceDetector.isDesktop(),o["\u0275nov"](n,0))},function(l,n){l(n,4,0,n.component.routeTitle)})}var g=o["\u0275ccf"]("app-route",t,function(l){return o["\u0275vid"](0,[(l()(),o["\u0275eld"](0,0,null,null,1,"app-route",[],null,null,null,f,p)),o["\u0275did"](1,49152,null,0,t,[u.DeviceDetectorService,a.k],null,null)],null,null)},{},{},[]),v=e("Ip0R"),h=e("gIcY");e.d(n,"SignInModuleNgFactory",function(){return y});var y=o["\u0275cmf"](r,[],function(l){return o["\u0275mod"]([o["\u0275mpd"](512,o.ComponentFactoryResolver,o["\u0275CodegenComponentFactoryResolver"],[[8,[s.a,g]],[3,o.ComponentFactoryResolver],o.NgModuleRef]),o["\u0275mpd"](4608,v.NgLocalization,v.NgLocaleLocalization,[o.LOCALE_ID,[2,v["\u0275angular_packages_common_common_a"]]]),o["\u0275mpd"](4608,h.e,h.e,[]),o["\u0275mpd"](4608,h.r,h.r,[]),o["\u0275mpd"](4608,d.c,d.c,[i.a]),o["\u0275mpd"](1073742336,v.CommonModule,v.CommonModule,[]),o["\u0275mpd"](1073742336,a.m,a.m,[[2,a.s],[2,a.k]]),o["\u0275mpd"](1073742336,h.p,h.p,[]),o["\u0275mpd"](1073742336,h.n,h.n,[]),o["\u0275mpd"](1073742336,d.a,d.a,[]),o["\u0275mpd"](1073742336,d.d,d.d,[]),o["\u0275mpd"](1073742336,r,r,[]),o["\u0275mpd"](1024,a.i,function(){return[[{path:"",component:t}]]},[])])})}}]);