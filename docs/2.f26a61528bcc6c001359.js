(window.webpackJsonp=window.webpackJsonp||[]).push([[2],{O7iY:function(l,n,o){"use strict";o.r(n);var e=o("CcnG"),u=function(){function l(l){this.router=l,this.routeTitle=null}return l.prototype.onMode=function(l){switch(l){case"resetPassword":this.routeTitle="Reset Password";break;case"recoverEmail":this.routeTitle="Recover Email";break;case"verifyEmail":this.routeTitle="Verify Email"}},l.prototype.onNavigationError=function(){this.router.navigate(["/"])},l.prototype.onSuccess=function(l){switch(l.mode){case"resetPassword":console.log("Welcome, "+l.user.displayName+"!"),this.router.navigate(["/"])}},l}(),t=function(){},r=o("pMnS"),i=o("URSy"),a=o("ixqD"),c=o("ZYCi"),s=e["\u0275crt"]({encapsulation:0,styles:[[""]],data:{}});function d(l){return e["\u0275vid"](0,[(l()(),e["\u0275eld"](0,0,null,null,6,"div",[["class","row"]],null,null,null,null,null)),(l()(),e["\u0275eld"](1,0,null,null,5,"div",[["class","col-sm-8 offset-md-2 col-md-6 offset-md-3 col-lg-4 offset-lg-4"]],null,null,null,null,null)),(l()(),e["\u0275eld"](2,0,null,null,1,"h1",[],null,null,null,null,null)),(l()(),e["\u0275ted"](3,null,[" "," "])),(l()(),e["\u0275eld"](4,0,null,null,0,"hr",[],null,null,null,null,null)),(l()(),e["\u0275eld"](5,0,null,null,1,"ngx-firebase-auth-oob",[],null,[[null,"mode"],[null,"navigationError"],[null,"success"]],function(l,n,o){var e=!0,u=l.component;return"mode"===n&&(e=!1!==u.onMode(o)&&e),"navigationError"===n&&(e=!1!==u.onNavigationError()&&e),"success"===n&&(e=!1!==u.onSuccess(o)&&e),e},i.c,i.a)),e["\u0275did"](6,114688,null,0,a.e,[c.a],null,{mode:"mode",navigationError:"navigationError",success:"success"})],function(l,n){l(n,6,0)},function(l,n){l(n,3,0,n.component.routeTitle)})}var m=e["\u0275ccf"]("app-route",u,function(l){return e["\u0275vid"](0,[(l()(),e["\u0275eld"](0,0,null,null,1,"app-route",[],null,null,null,d,s)),e["\u0275did"](1,49152,null,0,u,[c.k],null,null)],null,null)},{},{},[]),p=o("Ip0R"),f=o("gIcY"),v=o("Oipj");o.d(n,"OobModuleNgFactory",function(){return g});var g=e["\u0275cmf"](t,[],function(l){return e["\u0275mod"]([e["\u0275mpd"](512,e.ComponentFactoryResolver,e["\u0275CodegenComponentFactoryResolver"],[[8,[r.a,m]],[3,e.ComponentFactoryResolver],e.NgModuleRef]),e["\u0275mpd"](4608,p.NgLocalization,p.NgLocaleLocalization,[e.LOCALE_ID,[2,p["\u0275angular_packages_common_common_a"]]]),e["\u0275mpd"](4608,f.e,f.e,[]),e["\u0275mpd"](4608,f.r,f.r,[]),e["\u0275mpd"](4608,a.c,a.c,[v.a]),e["\u0275mpd"](1073742336,p.CommonModule,p.CommonModule,[]),e["\u0275mpd"](1073742336,c.m,c.m,[[2,c.s],[2,c.k]]),e["\u0275mpd"](1073742336,f.p,f.p,[]),e["\u0275mpd"](1073742336,f.n,f.n,[]),e["\u0275mpd"](1073742336,a.a,a.a,[]),e["\u0275mpd"](1073742336,a.b,a.b,[]),e["\u0275mpd"](1073742336,t,t,[]),e["\u0275mpd"](1024,c.i,function(){return[[{path:"",component:u}]]},[])])})}}]);