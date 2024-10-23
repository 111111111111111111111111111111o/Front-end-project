import axios from "axios";

const request = axios.create({
    baseURL: 'http://localhost:8081',
    timeout: 30000
})

request.interceptors.request.use(config => {
    config.headers['Content-Type'] = 'application/json';
    return config
},error => {
    console.error('request error: ' + error)
    return Promise.reject(error)
});

request.interceptors.response.use(
    response => {
        let res = response.data;

        if(typeof res ==='string'){
            res = res ? JSON.parse(res) : res
        }
        return res;
    },
    error => {1
        console.error('response error: ' + error)
        return Promise.reject(error)
    }
)

export default request
