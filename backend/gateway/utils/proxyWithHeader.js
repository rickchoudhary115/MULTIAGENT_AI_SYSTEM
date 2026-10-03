import proxy from "express-http-proxy"

export const proxyWithHeader = (serviceUrl)=> {
    return proxy(serviceUrl,{
        proxyReqOptDecorator:(proxyReqOpts,srcReq)=>{
            if(srcReq.user){
                    proxyReqOpts.headers["x-user-id"]=srcReq.user.userId}
              if (srcReq.headers.cookie) {
                proxyReqOpts.headers.cookie = srcReq.headers.cookie;
              }

                    return proxyReqOpts
        }
    })
}
